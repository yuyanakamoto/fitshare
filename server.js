const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config(); // dotenvを読み込み

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// JWT秘密鍵（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB制限
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  }
});

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('警告: MONGODB_URIが設定されていません。.envファイルを確認してください。');
  console.log('ローカルモードで起動します（データは保存されません）');
}

// MongoDB接続（エラー時はローカルモードで動作）
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDBに接続しました'))
    .catch(err => {
      console.error('MongoDB接続エラー:', err.message);
      console.log('ローカルモードで起動します（データは保存されません）');
    });
}

// ユーザースキーマ
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 改善された投稿スキーマ（投稿日指定対応）
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: String,
  avatar: String,
  exercise: String,
  // 新形式：セットごとの詳細
  sets: [{
    weight: Number,
    reps: Number
  }],
  // 古い形式との互換性のため残す
  weight: Number,
  reps: Number,
  image: String, // 画像URL
  comment: String,
  workoutDate: { type: Date }, // トレーニングを実際に行った日
  timestamp: { type: Date, default: Date.now }, // 投稿した日時
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: Number, default: 0 }
});

const Post = mongoose.model('Post', postSchema);

// 初回アクセス時のサンプルデータ作成
async function createSampleData() {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    
    if (userCount === 0 && postCount === 0) {
      // サンプルユーザー作成
      const sampleUser = new User({
        email: 'sample@fitshare.com',
        password: await bcrypt.hash('sample123', 10),
        username: 'FitShare運営',
        avatar: '💪'
      });
      await sampleUser.save();
      
      // サンプル投稿作成（過去の日付も含む）
      const samplePosts = [
        {
          userId: sampleUser._id,
          user: sampleUser.username,
          avatar: sampleUser.avatar,
          exercise: 'ベンチプレス',
          sets: [
            { weight: 60, reps: 10 },
            { weight: 60, reps: 8 },
            { weight: 55, reps: 10 }
          ],
          comment: 'FitShareへようこそ！セットごとに重量と回数を記録できます💪',
          workoutDate: new Date(),
          likes: 1,
          likedBy: [sampleUser._id.toString()],
          comments: 0
        },
        {
          userId: sampleUser._id,
          user: sampleUser.username,
          avatar: sampleUser.avatar,
          exercise: 'スクワット',
          sets: [
            { weight: 80, reps: 12 },
            { weight: 80, reps: 10 },
            { weight: 75, reps: 12 }
          ],
          comment: '昨日のトレーニングを記録しました！',
          workoutDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨日
          likes: 0,
          likedBy: [],
          comments: 0
        },
        {
          userId: sampleUser._id,
          user: sampleUser.username,
          avatar: sampleUser.avatar,
          exercise: 'デッドリフト',
          sets: [
            { weight: 100, reps: 5 },
            { weight: 95, reps: 6 },
            { weight: 90, reps: 8 }
          ],
          comment: '一週間前のデッドリフト記録です',
          workoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1週間前
          likes: 2,
          likedBy: [],
          comments: 0
        }
      ];

      for (const postData of samplePosts) {
        const post = new Post(postData);
        await post.save();
      }
      
      console.log('サンプルデータを作成しました');
    }
  } catch (error) {
    console.error('サンプルデータ作成エラー:', error);
  }
}

// MongoDB接続後にサンプルデータを作成
if (MONGODB_URI) {
  mongoose.connection.once('open', () => {
    createSampleData();
  });
}

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'トークンが無効です' });
    }
    req.user = user;
    next();
  });
};

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ユーザー登録
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // バリデーション
    if (!email || !password || !username) {
      return res.status(400).json({ error: '全ての項目を入力してください' });
    }
    
    // 既存ユーザーチェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
    }
    
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ユーザー作成
    const user = new User({
      email,
      password: hashedPassword,
      username,
      avatar: username.charAt(0).toUpperCase()
    });
    
    await user.save();
    
    // JWT生成
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ error: '登録に失敗しました' });
  }
});

// ログイン
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // パスワード検証
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // JWT生成
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
});

// 全投稿を取得（workoutDate順にソート）
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username avatar')
      .sort({ workoutDate: -1, timestamp: -1 }); // workoutDateを優先してソート
    res.json(posts);
  } catch (error) {
    console.error('投稿取得エラー:', error);
    res.status(500).json({ error: 'データの取得に失敗しました' });
  }
});

// 新規投稿（認証必要 + 投稿日指定対応）
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    
    const postData = {
      userId: user._id,
      user: user.username,
      avatar: user.avatar,
      exercise: req.body.exercise,
      comment: req.body.comment || ''
    };
    
    // セットデータの処理
    if (req.body.sets) {
      try {
        postData.sets = JSON.parse(req.body.sets);
      } catch (error) {
        return res.status(400).json({ error: 'セットデータの形式が正しくありません' });
      }
    }
    
    // 投稿日（トレーニング実施日）の処理
    if (req.body.workoutDate) {
      postData.workoutDate = new Date(req.body.workoutDate);
    } else {
      postData.workoutDate = new Date(); // デフォルトは今日
    }
    
    // 画像がある場合
    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    }
    
    const newPost = new Post(postData);
    await newPost.save();
    
    // populateして返す
    await newPost.populate('userId', 'username avatar');
    
    io.emit('newPost', newPost);
    res.json(newPost);
  } catch (error) {
    console.error('投稿エラー:', error);
    res.status(500).json({ error: '投稿の保存に失敗しました' });
  }
});

// 投稿の更新（認証必要 + 投稿日更新対応）
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    // 投稿者本人かチェック
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: '権限がありません' });
    }
    
    // 更新可能なフィールドのみ更新
    if (req.body.exercise) post.exercise = req.body.exercise;
    if (req.body.sets) post.sets = req.body.sets;
    if (req.body.comment !== undefined) post.comment = req.body.comment;
    if (req.body.workoutDate) post.workoutDate = new Date(req.body.workoutDate);
    
    await post.save();
    await post.populate('userId', 'username avatar');
    
    io.emit('updatePost', post);
    res.json(post);
  } catch (error) {
    console.error('更新エラー:', error);
    res.status(500).json({ error: '更新に失敗しました' });
  }
});

// 投稿の削除（認証必要）
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    // 投稿者本人かチェック
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: '権限がありません' });
    }
    
    // 画像がある場合は削除
    if (post.image) {
      const imagePath = path.join(__dirname, post.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error('画像削除エラー:', error);
        }
      }
    }
    
    await post.deleteOne();
    
    io.emit('deletePost', req.params.id);
    res.json({ message: '投稿を削除しました' });
  } catch (error) {
    console.error('削除エラー:', error);
    res.status(500).json({ error: '削除に失敗しました' });
  }
});

// いいね機能（認証必要）
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    const userId = req.user.userId;
    const likedIndex = post.likedBy.indexOf(userId);
    
    if (likedIndex === -1) {
      post.likedBy.push(userId);
      post.likes++;
    } else {
      post.likedBy.splice(likedIndex, 1);
      post.likes--;
    }
    
    await post.save();
    await post.populate('userId', 'username avatar');
    
    io.emit('updatePost', post);
    res.json(post);
  } catch (error) {
    console.error('いいねエラー:', error);
    res.status(500).json({ error: 'いいねの更新に失敗しました' });
  }
});

// ユーザーの統計データを取得するAPI
app.get('/api/users/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 投稿者本人のみアクセス可能
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: '権限がありません' });
    }
    
    const posts = await Post.find({ userId });
    
    // 最大重量を計算
    const maxWeights = {};
    posts.forEach(post => {
      if (post.sets && Array.isArray(post.sets)) {
        post.sets.forEach(set => {
          const weight = parseFloat(set.weight);
          if (weight && (!maxWeights[post.exercise] || weight > maxWeights[post.exercise])) {
            maxWeights[post.exercise] = weight;
          }
        });
      } else if (post.weight) {
        const weight = parseFloat(post.weight);
        if (weight && (!maxWeights[post.exercise] || weight > maxWeights[post.exercise])) {
          maxWeights[post.exercise] = weight;
        }
      }
    });
    
    // 総トレーニング日数
    const uniqueDays = new Set(posts.map(post => 
      new Date(post.workoutDate || post.timestamp).toDateString()
    )).size;
    
    // 種目別の回数
    const exerciseCount = {};
    posts.forEach(post => {
      exerciseCount[post.exercise] = (exerciseCount[post.exercise] || 0) + 1;
    });
    
    res.json({
      maxWeights,
      totalDays: uniqueDays,
      totalPosts: posts.length,
      exerciseCount
    });
  } catch (error) {
    console.error('統計データ取得エラー:', error);
    res.status(500).json({ error: '統計データの取得に失敗しました' });
  }
});

// ユーザーの投稿一覧を取得するAPI
app.get('/api/users/:userId/posts', async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ userId })
      .populate('userId', 'username avatar')
      .sort({ workoutDate: -1, timestamp: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error('ユーザー投稿取得エラー:', error);
    res.status(500).json({ error: 'ユーザーの投稿取得に失敗しました' });
  }
});

// エラーハンドリングミドルウェア
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます（5MB以下にしてください）' });
    }
  }
  console.error('サーバーエラー:', error);
  res.status(500).json({ error: '内部サーバーエラーが発生しました' });
});

// Socket.io接続
io.on('connection', async (socket) => {
  console.log('新しいユーザーが接続しました:', socket.id);
  
  try {
    const posts = await Post.find()
      .populate('userId', 'username avatar')
      .sort({ workoutDate: -1, timestamp: -1 });
    socket.emit('allPosts', posts);
  } catch (error) {
    console.error('投稿の取得エラー:', error);
  }
  
  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log(`アプリケーションURL: http://localhost:${PORT}`);
});
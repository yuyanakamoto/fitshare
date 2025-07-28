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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// セキュリティミドルウェア
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // リクエスト数
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // 認証試行回数
});

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // NoSQLインジェクション対策
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// JWT秘密鍵（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('エラー: JWT_SECRETが設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, uniqueSuffix + '-' + sanitizedFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB制限
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('画像ファイル（JPEG, PNG, GIF, WebP）のみアップロード可能です'));
    }
  }
});

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('警告: MONGODB_URIが設定されていません。.envファイルを確認してください。');
  console.log('ローカルモードで起動します（データは保存されません）');
}

// MongoDB接続オプション
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// MongoDB接続（エラー時はローカルモードで動作）
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => console.log('MongoDBに接続しました'))
    .catch(err => {
      console.error('MongoDB接続エラー:', err.message);
      console.log('ローカルモードで起動します（データは保存されません）');
    });
}

// 接続エラーハンドリング
mongoose.connection.on('error', err => {
  console.error('MongoDB接続エラー:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDBから切断されました');
});

// ユーザースキーマ（改善版）
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '有効なメールアドレスを入力してください']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  username: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 20
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// インデックスの作成（emailは既にuniqueでインデックスが作成される）
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

// 投稿スキーマ（改善版）
const postSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  user: String,
  avatar: String,
  exercises: [{
    exercise: {
      type: String,
      required: true,
      trim: true
    },
    sets: [{
      weight: {
        type: Number,
        required: true,
        min: 0
      },
      reps: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  }],
  // 後方互換性のため残す
  exercise: String,
  sets: [{
    weight: Number,
    reps: Number
  }],
  weight: Number,
  reps: Number,
  image: String,
  comment: {
    type: String,
    maxlength: 500
  },
  workoutDate: { 
    type: Date,
    default: Date.now
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: { 
    type: Number, 
    default: 0 
  }
});

// 複合インデックス
postSchema.index({ userId: 1, workoutDate: -1 });
postSchema.index({ workoutDate: -1, timestamp: -1 });

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
      
      // サンプル投稿作成
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
          likedBy: [sampleUser._id],
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
          workoutDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          likes: 0,
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

// 認証ミドルウェア（改善版）
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ユーザーの存在確認
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'ユーザーが見つかりません' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'トークンの有効期限が切れています' });
    }
    return res.status(403).json({ error: 'トークンが無効です' });
  }
};

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ユーザー登録（改善版）
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // バリデーション
    if (!email || !password || !username) {
      return res.status(400).json({ error: '全ての項目を入力してください' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'パスワードは6文字以上で入力してください' });
    }
    
    if (username.length > 20) {
      return res.status(400).json({ error: 'ユーザー名は20文字以内で入力してください' });
    }
    
    // 既存ユーザーチェック
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
    }
    
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // ユーザー作成
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username.trim(),
      avatar: username.charAt(0).toUpperCase()
    });
    
    await user.save();
    
    // JWT生成（有効期限付き）
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
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

// ログイン（改善版）
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' });
    }
    
    // ユーザー検索
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // パスワード検証
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // 最終ログイン時刻を更新
    user.lastLogin = new Date();
    await user.save();
    
    // JWT生成
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
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

// 全投稿を取得（改善版）
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (page - 1) * limit;
    
    const query = userId ? { userId } : {};
    
    const posts = await Post.find(query)
      .populate('userId', 'username avatar')
      .sort({ workoutDate: -1, timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    // 画像URLの正規化と日本時間タイムスタンプの追加
    const normalizedPosts = posts.map(post => ({
      ...post,
      image: post.image ? normalizeImageUrl(req, post.image) : null,
      displayTime: calculateDisplayTime(post.timestamp)
    }));
    
    res.json(normalizedPosts);
  } catch (error) {
    console.error('投稿取得エラー:', error);
    res.status(500).json({ error: 'データの取得に失敗しました' });
  }
});

// 時刻表示計算の共通関数
function calculateDisplayTime(timestamp) {
  const originalDate = new Date(timestamp);
  const now = new Date();
  const diff = now - originalDate;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  return originalDate.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{2}):(\d{2}).*/, '$1/$2/$3 $4:$5');
}

// 画像URLを正規化する関数
function normalizeImageUrl(req, imagePath) {
  if (!imagePath) return null;
  
  // 既に完全なURLの場合はそのまま返す
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 相対パスの場合は完全なURLに変換
  const protocol = req.protocol;
  const host = req.get('host');
  const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  return `${protocol}://${host}${cleanPath}`;
}

// 新規投稿（複数種目対応版）
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
      comment: req.body.comment || ''
    };
    
    // 複数種目データの処理とバリデーション
    if (req.body.exercises) {
      try {
        const exercises = typeof req.body.exercises === 'string' ? JSON.parse(req.body.exercises) : req.body.exercises;
        if (!Array.isArray(exercises) || exercises.length === 0) {
          return res.status(400).json({ error: '種目データが不正です' });
        }
        
        // 各種目のバリデーション
        const validatedExercises = exercises.map(exercise => {
          if (!exercise.exercise || !exercise.exercise.trim()) {
            throw new Error('種目名が入力されていません');
          }
          
          if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
            throw new Error('セットデータが不正です');
          }
          
          const validatedSets = exercise.sets.map(set => ({
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps)
          }));
          
          if (validatedSets.some(set => isNaN(set.weight) || isNaN(set.reps) || set.weight < 0 || set.reps < 0)) {
            throw new Error('重量と回数は0以上の数値で入力してください');
          }
          
          return {
            exercise: exercise.exercise.trim(),
            sets: validatedSets
          };
        });
        
        postData.exercises = validatedExercises;
      } catch (error) {
        return res.status(400).json({ error: error.message || '種目データの形式が正しくありません' });
      }
    } else if (req.body.exercise && req.body.sets) {
      // 旧形式との互換性のため
      try {
        const sets = JSON.parse(req.body.sets);
        postData.exercises = [{
          exercise: req.body.exercise,
          sets: sets.map(set => ({
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps)
          }))
        }];
      } catch (error) {
        return res.status(400).json({ error: 'セットデータの形式が正しくありません' });
      }
    } else {
      return res.status(400).json({ error: '種目データが必要です' });
    }
    
    // 投稿日の処理
    if (req.body.workoutDate) {
      const workoutDate = new Date(req.body.workoutDate);
      if (isNaN(workoutDate.getTime())) {
        return res.status(400).json({ error: '日付の形式が正しくありません' });
      }
      if (workoutDate > new Date()) {
        return res.status(400).json({ error: '未来の日付は指定できません' });
      }
      postData.workoutDate = workoutDate;
      
      // 投稿時刻の設定：当日なら現在時刻、過去日なら12時に設定
      const today = new Date();
      const isToday = workoutDate.toDateString() === today.toDateString();
      
      if (isToday) {
        // 当日投稿：実際の投稿時刻を使用
        postData.timestamp = new Date();
      } else {
        // 過去日投稿：その日の12:00に設定
        const pastTimestamp = new Date(workoutDate);
        pastTimestamp.setHours(12, 0, 0, 0);
        postData.timestamp = pastTimestamp;
      }
    } else {
      postData.workoutDate = new Date();
      postData.timestamp = new Date(); // 当日投稿なので現在時刻
    }
    
    // 画像がある場合
    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    }
    
    const newPost = new Post(postData);
    await newPost.save();
    
    // populateして返す
    await newPost.populate('userId', 'username avatar');
    
    // 画像URLを正規化と表示時刻を計算
    const responsePost = newPost.toObject();
    responsePost.image = normalizeImageUrl(req, responsePost.image);
    
    // 新規投稿の表示時刻を計算
    responsePost.displayTime = calculateDisplayTime(responsePost.timestamp);
    
    io.emit('newPost', responsePost);
    res.json(responsePost);
  } catch (error) {
    console.error('投稿エラー:', error);
    
    // アップロードされたファイルがあれば削除
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('ファイル削除エラー:', err);
      }
    }
    
    res.status(500).json({ error: '投稿の保存に失敗しました' });
  }
});

// 投稿の更新（改善版）
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
    
    // 複数種目データの更新
    if (req.body.exercises) {
      try {
        const exercises = typeof req.body.exercises === 'string' ? JSON.parse(req.body.exercises) : req.body.exercises;
        if (!Array.isArray(exercises) || exercises.length === 0) {
          return res.status(400).json({ error: '種目データが不正です' });
        }
        
        const validatedExercises = exercises.map(exercise => {
          if (!exercise.exercise || !exercise.exercise.trim()) {
            throw new Error('種目名が入力されていません');
          }
          
          if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
            throw new Error('セットデータが不正です');
          }
          
          const validatedSets = exercise.sets.map(set => ({
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps)
          }));
          
          if (validatedSets.some(set => isNaN(set.weight) || isNaN(set.reps) || set.weight < 0 || set.reps < 0)) {
            throw new Error('重量と回数は0以上の数値で入力してください');
          }
          
          return {
            exercise: exercise.exercise.trim(),
            sets: validatedSets
          };
        });
        
        post.exercises = validatedExercises;
      } catch (error) {
        return res.status(400).json({ error: error.message || '種目データの形式が正しくありません' });
      }
    }
    
    // 旧形式との互換性
    else if (req.body.exercise && req.body.sets) {
      const validatedSets = req.body.sets.map(set => ({
        weight: parseFloat(set.weight),
        reps: parseInt(set.reps)
      }));
      
      if (validatedSets.some(set => isNaN(set.weight) || isNaN(set.reps) || set.weight < 0 || set.reps < 0)) {
        return res.status(400).json({ error: '重量と回数は0以上の数値で入力してください' });
      }
      
      post.exercises = [{
        exercise: req.body.exercise.trim(),
        sets: validatedSets
      }];
    }
    
    if (req.body.comment !== undefined) {
      post.comment = req.body.comment.substring(0, 500);
    }
    
    if (req.body.workoutDate) {
      const workoutDate = new Date(req.body.workoutDate);
      if (isNaN(workoutDate.getTime())) {
        return res.status(400).json({ error: '日付の形式が正しくありません' });
      }
      if (workoutDate > new Date()) {
        return res.status(400).json({ error: '未来の日付は指定できません' });
      }
      post.workoutDate = workoutDate;
    }
    
    await post.save();
    await post.populate('userId', 'username avatar');
    
    const responsePost = post.toObject();
    responsePost.image = normalizeImageUrl(req, responsePost.image);
    responsePost.displayTime = calculateDisplayTime(responsePost.timestamp);
    
    io.emit('updatePost', responsePost);
    res.json(responsePost);
  } catch (error) {
    console.error('更新エラー:', error);
    res.status(500).json({ error: '更新に失敗しました' });
  }
});

// 投稿の削除（改善版）
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
      const imagePath = post.image.replace(/^\//, '');
      const fullPath = path.join(__dirname, imagePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
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

// いいね機能（改善版）
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const likedIndex = post.likedBy.findIndex(id => id.equals(userObjectId));
    
    if (likedIndex === -1) {
      post.likedBy.push(userObjectId);
      post.likes++;
    } else {
      post.likedBy.splice(likedIndex, 1);
      post.likes--;
    }
    
    await post.save();
    await post.populate('userId', 'username avatar');
    
    const responsePost = post.toObject();
    responsePost.image = normalizeImageUrl(req, responsePost.image);
    responsePost.displayTime = calculateDisplayTime(responsePost.timestamp);
    
    io.emit('updatePost', responsePost);
    res.json(responsePost);
  } catch (error) {
    console.error('いいねエラー:', error);
    res.status(500).json({ error: 'いいねの更新に失敗しました' });
  }
});

// ユーザーの統計データを取得（改善版）
app.get('/api/users/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 投稿者本人のみアクセス可能
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: '権限がありません' });
    }
    
    const posts = await Post.find({ userId }).lean();
    
    if (posts.length === 0) {
      return res.json({
        maxWeights: {},
        totalDays: 0,
        totalPosts: 0,
        exerciseCount: {},
        recentProgress: []
      });
    }
    
    // 最大重量を計算
    const maxWeights = {};
    const exerciseProgress = {};
    
    posts.forEach(post => {
      const exercise = post.exercise;
      if (!exercise) return;
      
      // 最大重量の計算
      if (post.sets && Array.isArray(post.sets)) {
        post.sets.forEach(set => {
          const weight = parseFloat(set.weight);
          if (weight && (!maxWeights[exercise] || weight > maxWeights[exercise])) {
            maxWeights[exercise] = weight;
          }
        });
        
        // 進捗データの収集
        const maxSetWeight = Math.max(...post.sets.map(s => parseFloat(s.weight) || 0));
        if (maxSetWeight > 0) {
          if (!exerciseProgress[exercise]) {
            exerciseProgress[exercise] = [];
          }
          exerciseProgress[exercise].push({
            date: post.workoutDate || post.timestamp,
            weight: maxSetWeight
          });
        }
      }
    });
    
    // 総トレーニング日数（重複を除く）
    const uniqueDays = new Set(posts.map(post => 
      new Date(post.workoutDate || post.timestamp).toDateString()
    )).size;
    
    // 種目別の回数
    const exerciseCount = {};
    posts.forEach(post => {
      if (post.exercise) {
        exerciseCount[post.exercise] = (exerciseCount[post.exercise] || 0) + 1;
      }
    });
    
    // 最近の進捗（直近1ヶ月）
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentProgress = Object.entries(exerciseProgress).map(([exercise, data]) => ({
      exercise,
      data: data
        .filter(d => new Date(d.date) >= oneMonthAgo)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-10) // 最新10件まで
    })).filter(item => item.data.length > 0);
    
    res.json({
      maxWeights,
      totalDays: uniqueDays,
      totalPosts: posts.length,
      exerciseCount,
      recentProgress
    });
  } catch (error) {
    console.error('統計データ取得エラー:', error);
    res.status(500).json({ error: '統計データの取得に失敗しました' });
  }
});

// ユーザー情報の取得
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    res.json(user);
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

// エラーハンドリングミドルウェア
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます（5MB以下にしてください）' });
    }
    return res.status(400).json({ error: `ファイルアップロードエラー: ${error.message}` });
  }
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({ error: '無効なIDフォーマットです' });
  }
  
  console.error('サーバーエラー:', error);
  res.status(500).json({ error: '内部サーバーエラーが発生しました' });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// Socket.io接続（改善版）
const activeConnections = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        socket.userId = user._id.toString();
        socket.user = user;
      }
    }
    next();
  } catch (err) {
    console.log('Socket認証エラー:', err.message);
    next();
  }
});

io.on('connection', async (socket) => {
  console.log('新しいユーザーが接続しました:', socket.id);
  
  // ユーザーIDがある場合は接続を記録
  if (socket.userId) {
    activeConnections.set(socket.userId, socket.id);
  }
  
  try {
    // 初期データ送信（ページネーション対応）
    const posts = await Post.find()
      .populate('userId', 'username avatar')
      .sort({ workoutDate: -1, timestamp: -1 })
      .limit(20)
      .lean();
    
    // 画像URLの正規化と日本時間タイムスタンプの追加
    const normalizedPosts = posts.map(post => ({
      ...post,
      image: post.image ? `/uploads/${path.basename(post.image)}` : null,
      displayTime: calculateDisplayTime(post.timestamp)
    }));
    
    socket.emit('allPosts', normalizedPosts);
  } catch (error) {
    console.error('投稿の取得エラー:', error);
    socket.emit('error', { message: '投稿の取得に失敗しました' });
  }
  
  // カスタムイベントハンドラー
  socket.on('requestMorePosts', async (data) => {
    try {
      const { page = 2, limit = 20 } = data;
      const skip = (page - 1) * limit;
      
      const posts = await Post.find()
        .populate('userId', 'username avatar')
        .sort({ workoutDate: -1, timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();
      
      socket.emit('morePosts', {
        posts,
        page,
        hasMore: posts.length === parseInt(limit)
      });
    } catch (error) {
      console.error('追加投稿取得エラー:', error);
      socket.emit('error', { message: '投稿の取得に失敗しました' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました:', socket.id);
    
    // アクティブな接続から削除
    if (socket.userId) {
      activeConnections.delete(socket.userId);
    }
  });
});

// Graceful shutdown（改善版）
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  
  // 新規接続の受付を停止
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Socket.io接続をクローズ
  io.close(() => {
    console.log('Socket.io connections closed');
  });
  
  // MongoDB接続をクローズ
  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未処理のPromiseエラーを捕捉
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
=====================================
FitShare バックエンドサーバー
=====================================
ポート: ${PORT}
環境: ${process.env.NODE_ENV || 'development'}
MongoDB: ${MONGODB_URI ? '接続待機中...' : 'ローカルモード'}
URL: http://localhost:${PORT}
=====================================
  `);
});
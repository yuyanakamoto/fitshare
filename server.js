const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB接続（後で環境変数を設定）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitshare';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDBに接続しました'))
  .catch(err => console.error('MongoDB接続エラー:', err));

// Mongooseスキーマ
const postSchema = new mongoose.Schema({
  user: String,
  avatar: String,
  exercise: String,
  weight: Number,
  sets: Number,
  reps: Number,
  comment: String,
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: Number, default: 0 }
});

const Post = mongoose.model('Post', postSchema);

// 初回アクセス時のサンプルデータ作成
async function createSampleData() {
  const count = await Post.countDocuments();
  if (count === 0) {
    const samplePost = new Post({
      user: 'FitShare運営',
      avatar: '💪',
      exercise: 'ベンチプレス',
      weight: 60,
      sets: 3,
      reps: 10,
      comment: 'FitShareへようこそ！みんなでトレーニングを記録しましょう！',
      likes: 1,
      likedBy: ['sample'],
      comments: 0
    });
    await samplePost.save();
  }
}

createSampleData();

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 全投稿を取得
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'データの取得に失敗しました' });
  }
});

// 新規投稿
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    
    io.emit('newPost', newPost);
    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: '投稿の保存に失敗しました' });
  }
});

// いいね機能
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    const likedIndex = post.likedBy.indexOf(userId);
    if (likedIndex === -1) {
      post.likedBy.push(userId);
      post.likes++;
    } else {
      post.likedBy.splice(likedIndex, 1);
      post.likes--;
    }
    
    await post.save();
    io.emit('updatePost', post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'いいねの更新に失敗しました' });
  }
});

// Socket.io接続
io.on('connection', async (socket) => {
  console.log('新しいユーザーが接続しました');
  
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    socket.emit('allPosts', posts);
  } catch (error) {
    console.error('投稿の取得エラー:', error);
  }
  
  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
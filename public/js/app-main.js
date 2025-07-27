// メインのReactコンポーネント
const FitShareApp = () => {
  const [posts, setPosts] = React.useState([]);
  const [socket, setSocket] = React.useState(null);
  const [connected, setConnected] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [showAuthForm, setShowAuthForm] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentView, setCurrentView] = React.useState("home"); // 'home', 'profile', 'stats'
  const [authToken, setAuthToken] = React.useState(() => {
    return localStorage.getItem("fitShareToken") || "";
  });
  const [currentUser, setCurrentUser] = React.useState(() => {
    const user = localStorage.getItem("fitShareUser");
    return user ? JSON.parse(user) : null;
  });
  const [editingPost, setEditingPost] = React.useState(null);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [modalImage, setModalImage] = React.useState(null);

  // 認証フォーム
  const [authData, setAuthData] = React.useState({
    email: "",
    password: "",
    username: "",
  });

  // 複数種目対応の新しいフォームデータ構造
  const [formData, setFormData] = React.useState({
    exercises: [
      {
        exercise: "",
        sets: [{ weight: "", reps: "" }],
      },
    ],
    comment: "",
    workoutDate: new Date().toISOString().split("T")[0],
  });

  // カスタム種目入力の表示状態
  const [showCustomInput, setShowCustomInput] = React.useState([false]);

  // サーバーURLは現在のホストを使用
  const SERVER_URL = window.location.origin;

  // APIリクエストのヘッダー
  const getHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
  };

  // ユーザーが追加した種目を含む完全なリスト
  const [exercises, setExercises] = React.useState(() => {
    const savedExercises = localStorage.getItem("fitShareCustomExercises");
    if (savedExercises) {
      const customList = JSON.parse(savedExercises);
      return [...new Set([...defaultExercises, ...customList])].sort();
    }
    return defaultExercises;
  });

  // 統計データ計算
  const getStatsData = () => {
    if (!currentUser || !posts.length) return null;

    const userPosts = posts.filter((post) => {
      const postUser = post.userId || post.user;
      return (
        postUser &&
        ((typeof postUser === "object" && postUser._id === currentUser.id) ||
          (typeof postUser === "string" && postUser === currentUser.username))
      );
    });

    // 最大重量を計算
    const maxWeights = {};
    userPosts.forEach((post) => {
      if (post.sets && Array.isArray(post.sets)) {
        post.sets.forEach((set) => {
          const weight = parseFloat(set.weight);
          if (
            weight &&
            (!maxWeights[post.exercise] || weight > maxWeights[post.exercise])
          ) {
            maxWeights[post.exercise] = weight;
          }
        });
      } else if (post.weight) {
        const weight = parseFloat(post.weight);
        if (
          weight &&
          (!maxWeights[post.exercise] || weight > maxWeights[post.exercise])
        ) {
          maxWeights[post.exercise] = weight;
        }
      }
    });

    // 総トレーニング日数
    const uniqueDays = new Set(
      userPosts.map((post) => new Date(post.timestamp).toDateString())
    ).size;

    // 総投稿数
    const totalPosts = userPosts.length;

    // 最もよく行う種目
    const exerciseCount = {};
    userPosts.forEach((post) => {
      exerciseCount[post.exercise] = (exerciseCount[post.exercise] || 0) + 1;
    });
    const mostFrequentExercise = Object.entries(exerciseCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      maxWeights,
      totalDays: uniqueDays,
      totalPosts,
      mostFrequentExercise: mostFrequentExercise
        ? mostFrequentExercise[0]
        : null,
      mostFrequentCount: mostFrequentExercise ? mostFrequentExercise[1] : 0,
    };
  };

  // ... (他のメソッドは別ファイルに分離予定)

  // 投稿送信（複数種目を 1 投稿で送信）
  const handleSubmit = async () => {
    if (!currentUser) {
      setShowAuthForm(true);
      return;
    }

    // 入力検証 ─ 有効な種目 & セットだけ抽出
    const validExercises = formData.exercises
      .filter(e => e.exercise.trim() !== '' && e.sets.some(s => s.weight && s.reps))
      .map(e => ({
        exercise: e.exercise.trim(),
        sets: e.sets
          .filter(s => s.weight && s.reps)
          .map(s => ({ weight: Number(s.weight), reps: Number(s.reps) }))
      }));

    if (validExercises.length === 0) {
      alert('少なくとも 1 種目 1 セットを入力してください');
      return;
    }

    // カスタム種目を保存
    validExercises.forEach(e => saveCustomExercise(e.exercise));

    const payload = {
      exercises: validExercises,
      comment: formData.comment,
      workoutDate: formData.workoutDate,
    };

    let res;
    try {
      if (selectedImage) {
        // 画像あり: multipart/form-data
        const fd = new FormData();
        fd.append('exercises', JSON.stringify(validExercises));
        fd.append('comment', formData.comment);
        fd.append('workoutDate', formData.workoutDate);
        fd.append('image', selectedImage);
        res = await fetch(`${SERVER_URL}/api/posts`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: fd,
        });
      } else {
        // 画像なし: application/json
        res = await fetch(`${SERVER_URL}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error('投稿失敗:', err);
      alert('投稿に失敗しました。入力内容またはネットワークを確認してください。');
      return;
    }

    // レスポンスを UI に即反映
    let createdPost;
    try {
      createdPost = await res.json();
    } catch {
      createdPost = null;
    }
    if (createdPost) {
      setPosts(prev => [createdPost, ...prev]);
    } else {
      // fallback: 成功したので一覧をリロード
      fetch(`${SERVER_URL}/api/posts`)
        .then(res => res.json())
        .then(data => setPosts(data))
        .catch(err => console.error('投稿の取得に失敗しました:', err));
    }

    // フォームリセット
    setFormData({
      exercises: [{ exercise: '', sets: [{ weight: '', reps: '' }] }],
      comment: '',
      workoutDate: new Date().toISOString().split('T')[0],
    });
    setSelectedImage(null);
    setShowCustomInput([false]);
    setShowForm(false);
  };

  // ... (残りのメソッドは省略、完全版は元のapp.jsにあります)

  // ローディング中
  if (isLoading) {
    return React.createElement(
      "div",
      {
        className: "min-h-screen bg-blue-600 flex items-center justify-center",
      },
      React.createElement(
        "div",
        { className: "text-white text-xl" },
        "読み込み中..."
      )
    );
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-100 pb-20" },
    "アプリケーションの残りの部分..."
  );
};

// アプリケーションをマウント
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(FitShareApp));
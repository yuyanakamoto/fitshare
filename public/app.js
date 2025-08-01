// メインアプリケーション
const FitShareApp = () => {
  // State管理
  const [posts, setPosts] = React.useState([]);
  const [connected, setConnected] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [showAuthForm, setShowAuthForm] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentView, setCurrentView] = React.useState("home");
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
  const [viewingUser, setViewingUser] = React.useState(null); // 他ユーザーのプロフィール表示用

  // 認証フォーム
  const [authData, setAuthData] = React.useState({
    email: "",
    password: "",
    username: "",
  });

  // 複数種目対応のフォームデータ
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

  const [showCustomInput, setShowCustomInput] = React.useState([false]);
  const SERVER_URL = window.location.origin;

  // 種目リスト管理
  const [exercises, setExercises] = React.useState(() => {
    const savedExercises = localStorage.getItem("fitShareCustomExercises");
    if (savedExercises) {
      const customList = JSON.parse(savedExercises);
      return [...new Set([...defaultExercises, ...customList])].sort();
    }
    return defaultExercises;
  });

  // APIヘッダー
  const getHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
  };

  // Socket.io接続
  React.useEffect(() => {
    const newSocket = io(SERVER_URL);

    newSocket.on("connect", () => {
      console.log("サーバーに接続しました");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("サーバーから切断されました");
      setConnected(false);
    });

    newSocket.on("allPosts", (allPosts) => {
      setPosts(allPosts);
    });

    newSocket.on("newPost", (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    newSocket.on("updatePost", (updatedPost) => {
      setPosts((prev) =>
        prev.map((post) =>
          (post._id || post.id) === (updatedPost._id || updatedPost.id)
            ? updatedPost
            : post
        )
      );
    });

    newSocket.on("deletePost", (postId) => {
      setPosts((prev) =>
        prev.filter((post) => (post._id || post.id) !== postId)
      );
    });

    fetch(`${SERVER_URL}/api/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("投稿の取得に失敗しました:", err));

    return () => {
      newSocket.close();
    };
  }, []);

  // 自動ログインチェック
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("fitShareToken");
      const userStr = localStorage.getItem("fitShareUser");

      if (token && userStr) {
        try {
          const response = await fetch(`${SERVER_URL}/api/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            setAuthToken(token);
            setCurrentUser(JSON.parse(userStr));
          } else {
            localStorage.removeItem("fitShareToken");
            localStorage.removeItem("fitShareUser");
          }
        } catch (error) {
          console.error("認証チェックエラー:", error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // ログイン処理
  const handleLogin = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("fitShareToken", data.token);
        localStorage.setItem("fitShareUser", JSON.stringify(data.user));
        setShowAuthForm(false);
        setAuthData({ email: "", password: "", username: "" });
      } else {
        const error = await response.json();
        alert(error.error || "ログインに失敗しました");
      }
    } catch (error) {
      alert("ログインに失敗しました");
    }
  };

  // 新規登録処理
  const handleRegister = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("fitShareToken", data.token);
        localStorage.setItem("fitShareUser", JSON.stringify(data.user));
        setShowAuthForm(false);
        setAuthData({ email: "", password: "", username: "" });
      } else {
        const error = await response.json();
        alert(error.error || "登録に失敗しました");
      }
    } catch (error) {
      alert("登録に失敗しました");
    }
  };

  // ログアウト
  const handleLogout = () => {
    setAuthToken("");
    setCurrentUser(null);
    localStorage.removeItem("fitShareToken");
    localStorage.removeItem("fitShareUser");
    setCurrentView("home");
    setViewingUser(null);
  };

  // 他ユーザーのプロフィールを表示
  const handleViewUserProfile = (user) => {
    setViewingUser(user);
    setCurrentView("profile");
  };

  // 投稿関連の処理
  const saveCustomExercise = (exerciseName) => {
    if (exerciseName && !exercises.includes(exerciseName)) {
      const newExercises = [...exercises, exerciseName].sort();
      setExercises(newExercises);

      const customExercises = newExercises.filter(
        (ex) => !defaultExercises.includes(ex)
      );
      localStorage.setItem(
        "fitShareCustomExercises",
        JSON.stringify(customExercises)
      );
    }
  };

  // カスタム種目を削除する関数
  const deleteCustomExercise = (exerciseName) => {
    // デフォルト種目は削除できない
    if (defaultExercises.includes(exerciseName)) {
      alert('デフォルト種目は削除できません');
      return;
    }

    if (confirm(`「${exerciseName}」を種目リストから削除しますか？`)) {
      const newExercises = exercises.filter(ex => ex !== exerciseName);
      setExercises(newExercises);

      const customExercises = newExercises.filter(
        (ex) => !defaultExercises.includes(ex)
      );
      localStorage.setItem(
        "fitShareCustomExercises",
        JSON.stringify(customExercises)
      );
      
      console.log(`カスタム種目「${exerciseName}」を削除しました`);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setShowAuthForm(true);
      return;
    }

    // トークンの有効性をチェック
    if (!authToken) {
      console.error('認証トークンがありません');
      setShowAuthForm(true);
      return;
    }

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

    validExercises.forEach(e => saveCustomExercise(e.exercise));

    const payload = {
      exercises: validExercises,
      comment: formData.comment,
      workoutDate: formData.workoutDate,
    };

    let res;
    try {
      if (selectedImage) {
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
        res = await fetch(`${SERVER_URL}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        
        // 認証エラーの場合は再ログインを促す
        if (res.status === 401 || res.status === 403) {
          console.log('認証エラーが発生しました。再ログインが必要です。');
          localStorage.removeItem('fitShareToken');
          localStorage.removeItem('fitShareUser');
          setAuthToken('');
          setCurrentUser(null);
          setShowAuthForm(true);
          alert('セッションが切れました。再度ログインしてください。');
          return;
        }
        
        throw new Error(errorText);
      }

      // 投稿成功時のレスポンスを受信（Socket.ioで自動追加されるため手動追加は不要）
      let createdPost;
      try {
        createdPost = await res.json();
        console.log('投稿が正常に作成されました:', createdPost._id);
      } catch {
        console.log('投稿レスポンスの解析に失敗しましたが、投稿は成功しました');
      }

      setFormData({
        exercises: [{ exercise: '', sets: [{ weight: '', reps: '' }] }],
        comment: '',
        workoutDate: new Date().toISOString().split('T')[0],
      });
      setSelectedImage(null);
      setShowCustomInput([false]);
      setShowForm(false);
    } catch (err) {
      console.error('投稿失敗:', err);
      alert('投稿に失敗しました。');
    }
  };

  const handleUpdate = async () => {
    if (!currentUser || !editingPost) {
      return;
    }

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

    validExercises.forEach(e => saveCustomExercise(e.exercise));

    const payload = {
      exercises: validExercises,
      comment: formData.comment,
      workoutDate: formData.workoutDate,
    };

    try {
      const res = await fetch(`${SERVER_URL}/api/posts/${editingPost._id || editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Update API Error:', res.status, errorText);
        
        // 認証エラーの場合は再ログインを促す
        if (res.status === 401 || res.status === 403) {
          console.log('認証エラーが発生しました。再ログインが必要です。');
          localStorage.removeItem('fitShareToken');
          localStorage.removeItem('fitShareUser');
          setAuthToken('');
          setCurrentUser(null);
          setShowAuthForm(true);
          alert('セッションが切れました。再度ログインしてください。');
          return;
        }
        
        throw new Error(errorText);
      }

      // 更新成功時のレスポンスを受信（Socket.ioで自動更新されるため手動更新は不要）
      let updatedPost;
      try {
        updatedPost = await res.json();
        console.log('投稿が正常に更新されました:', updatedPost._id);
      } catch {
        console.log('更新レスポンスの解析に失敗しましたが、更新は成功しました');
      }

      setFormData({
        exercises: [{ exercise: '', sets: [{ weight: '', reps: '' }] }],
        comment: '',
        workoutDate: new Date().toISOString().split('T')[0],
      });
      setShowCustomInput([false]);
      setShowForm(false);
      setEditingPost(null);
    } catch (err) {
      console.error('更新失敗:', err);
      alert('更新に失敗しました。');
    }
  };

  // その他のハンドラー
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setSelectedImage(file);
    } else {
      alert("画像は5MB以下にしてください");
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      setShowAuthForm(true);
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: getHeaders(),
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.log('認証エラーが発生しました。再ログインが必要です。');
          localStorage.removeItem('fitShareToken');
          localStorage.removeItem('fitShareUser');
          setAuthToken('');
          setCurrentUser(null);
          setShowAuthForm(true);
          alert('セッションが切れました。再度ログインしてください。');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error("いいねの送信に失敗しました:", error);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      exercises: post.exercises ?? [
        {
          exercise: post.exercise,
          sets: post.sets || [
            { weight: post.weight || "", reps: post.reps || "" },
          ],
        },
      ],
      comment: post.comment || "",
      workoutDate: (post.workoutDate
        ? new Date(post.workoutDate)
        : new Date(post.timestamp)
      )
        .toISOString()
        .split("T")[0],
    });
    setShowCustomInput((post.exercises ?? [post]).map(() => false));
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (confirm("本当にこの投稿を削除しますか？")) {
      try {
        const response = await fetch(`${SERVER_URL}/api/posts/${postId}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        if (!response.ok) {
          console.error('削除API Error:', response.status, await response.text());
          if (response.status === 401 || response.status === 403) {
            console.log('認証エラーが発生しました。再ログインが必要です。');
            localStorage.removeItem('fitShareToken');
            localStorage.removeItem('fitShareUser');
            setAuthToken('');
            setCurrentUser(null);
            setShowAuthForm(true);
            alert('セッションが切れました。再度ログインしてください。');
            return;
          }
          alert("削除に失敗しました");
        } else {
          console.log('投稿が正常に削除されました:', postId);
        }
      } catch (error) {
        alert("削除に失敗しました");
      }
    }
  };

  // フォーム関連のハンドラー
  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          exercise: "",
          sets: [{ weight: "", reps: "" }],
        },
      ],
    });
    setShowCustomInput([...showCustomInput, false]);
  };

  const removeExercise = (index) => {
    if (formData.exercises.length > 1) {
      setFormData({
        ...formData,
        exercises: formData.exercises.filter((_, i) => i !== index),
      });
      setShowCustomInput(showCustomInput.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (index, value) => {
    const newExercises = [...formData.exercises];
    if (value === "その他（自由入力）") {
      const newShowCustom = [...showCustomInput];
      newShowCustom[index] = true;
      setShowCustomInput(newShowCustom);
      newExercises[index].exercise = "";
    } else {
      const newShowCustom = [...showCustomInput];
      newShowCustom[index] = false;
      setShowCustomInput(newShowCustom);
      newExercises[index].exercise = value;
    }
    setFormData({ ...formData, exercises: newExercises });
  };

  const addSet = (exerciseIndex) => {
    const newExercises = [...formData.exercises];
    newExercises[exerciseIndex].sets.push({ weight: "", reps: "" });
    setFormData({ ...formData, exercises: newExercises });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const newExercises = [...formData.exercises];
    if (newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets.splice(setIndex, 1);
      setFormData({ ...formData, exercises: newExercises });
    }
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setFormData({ ...formData, exercises: newExercises });
  };

  const copyPreviousWeight = (exerciseIndex, setIndex) => {
    if (setIndex > 0) {
      const previousWeight =
        formData.exercises[exerciseIndex].sets[setIndex - 1].weight;
      updateSet(exerciseIndex, setIndex, "weight", previousWeight);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({
      exercises: [
        {
          exercise: "",
          sets: [{ weight: "", reps: "" }],
        },
      ],
      comment: "",
      workoutDate: new Date().toISOString().split("T")[0],
    });
    setSelectedImage(null);
    setShowCustomInput([false]);
  };

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

  // 認証フォーム表示
  if (!currentUser && showAuthForm) {
    return React.createElement(AuthForm, {
      isLogin,
      authData,
      setAuthData,
      setIsLogin,
      onLogin: handleLogin,
      onRegister: handleRegister,
      onClose: () => setShowAuthForm(false)
    });
  }

  // メインUI
  return React.createElement(
    "div",
    { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20" },
    
    // 洗練されたヘッダー
    React.createElement(
      "header",
      { className: "bg-white bg-opacity-95 backdrop-blur-md text-gray-800 p-4 shadow-xl sticky top-0 z-50 border-b border-gray-200" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-3" },
          React.createElement(
            "div",
            { className: "w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg" },
            React.createElement(Dumbbell, { className: "h-5 w-5 text-white" })
          ),
          React.createElement(
            "h1",
            { className: "text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" },
            "FitShare"
          )
        ),
        React.createElement(
          "div",
          { className: "flex items-center space-x-2" },
          currentUser
            ? React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                React.createElement(
                  "button",
                  {
                    onClick: () => setCurrentView("home"),
                    className: `px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === "home" 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                    }`,
                  },
                  React.createElement(
                    "span",
                    { className: "flex items-center space-x-1" },
                    React.createElement(Home, { className: "h-4 w-4" }),
                    React.createElement("span", { className: "hidden sm:block" }, "ホーム")
                  )
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      setCurrentView("profile");
                      setViewingUser(null); // 自分のプロフィールを表示
                    },
                    className: `px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === "profile" 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                    }`,
                  },
                  React.createElement(
                    "span",
                    { className: "flex items-center space-x-1" },
                    React.createElement(User, { className: "h-4 w-4" }),
                    React.createElement("span", { className: "hidden sm:block" }, "プロフィール")
                  )
                ),
                React.createElement(
                  "div",
                  { className: "flex items-center space-x-2 ml-2 pl-2 sm:ml-4 sm:pl-4 border-l border-gray-300" },
                  React.createElement(
                    "div",
                    { className: "w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm" },
                    currentUser.avatar || currentUser.username.charAt(0).toUpperCase()
                  ),
                  React.createElement(
                    "span",
                    { className: "text-sm font-medium text-gray-700 hidden sm:block" },
                    currentUser.username
                  )
                ),
                React.createElement(
                  "button",
                  {
                    onClick: handleLogout,
                    className: "p-2 ml-1 sm:ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200",
                    title: "ログアウト"
                  },
                  React.createElement(LogOut, { className: "h-5 w-5" })
                )
              )
            : React.createElement(
                "button",
                {
                  onClick: () => setShowAuthForm(true),
                  className: "text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
                },
                "ログイン"
              )
        )
      )
    ),

    // 画像モーダル
    modalImage &&
      React.createElement(ImageModal, {
        imageUrl: modalImage,
        onClose: () => setModalImage(null),
      }),

    React.createElement(
      "main",
      { className: "px-4 sm:px-6 py-4 sm:py-8 max-w-4xl mx-auto" },
      
      // ビューの切り替え
      currentView === "profile" && currentUser
        ? React.createElement(ProfilePage, {
            currentUser,
            viewingUser,
            posts,
            onImageClick: setModalImage,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onLike: handleLike,
            connected
          })
        : React.createElement(
            React.Fragment,
            null,
            // ホーム画面のコンテンツ
            
            // 投稿ボタン
      React.createElement(
        "button",
        {
          onClick: () => {
            if (!currentUser) {
              setShowAuthForm(true);
            } else {
              setShowForm(!showForm);
              setEditingPost(null);
              if (!showForm) {
                setFormData({
                  exercises: [
                    {
                      exercise: "",
                      sets: [{ weight: "", reps: "" }],
                    },
                  ],
                  comment: "",
                  workoutDate: new Date().toISOString().split("T")[0],
                });
                setSelectedImage(null);
                setShowCustomInput([false]);
              }
            }
          },
          className:
            "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 border border-indigo-200",
          disabled: !connected,
        },
        React.createElement(Plus, { className: "h-5 w-5" }),
        React.createElement(
          "span",
          { className: "font-semibold text-base sm:text-lg" },
          "新しいワークアウトを記録"
        )
      ),

      // 接続エラーメッセージ
      !connected &&
        React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl mb-4 sm:mb-6 shadow-lg backdrop-blur-sm",
          },
          React.createElement(
            "div",
            { className: "flex items-center space-x-3" },
            React.createElement(
              "div",
              { className: "w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center" },
              React.createElement(
                "span", 
                { className: "text-white text-sm font-bold" },
                "!"
              )
            ),
            React.createElement(
              "p",
              { className: "text-sm font-medium" },
              "サーバーに接続できません。接続を確認してください。"
            )
          )
        ),

      // ワークアウトフォーム
      showForm &&
        React.createElement(WorkoutForm, {
          formData,
          setFormData,
          exercises,
          showCustomInput,
          setShowCustomInput,
          editingPost,
          selectedImage,
          onImageSelect: handleImageSelect,
          onSubmit: handleSubmit,
          onUpdate: handleUpdate,
          onCancel: handleFormCancel,
          onAddExercise: addExercise,
          onRemoveExercise: removeExercise,
          onUpdateExercise: updateExercise,
          onAddSet: addSet,
          onRemoveSet: removeSet,
          onUpdateSet: updateSet,
          onCopyPreviousWeight: copyPreviousWeight,
          onDeleteCustomExercise: deleteCustomExercise
        }),

            // 投稿一覧
            React.createElement(PostList, {
              posts,
              currentUser,
              connected,
              onLike: handleLike,
              onEdit: handleEdit,
              onDelete: handleDelete,
              onImageClick: setModalImage,
              onUserClick: handleViewUserProfile
            })
          )
    )
  );
};

// アプリケーションをマウント
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(FitShareApp));
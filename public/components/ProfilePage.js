// プロフィールページコンポーネント
const ProfilePage = ({ 
  currentUser, 
  viewingUser, // 表示するユーザー（他ユーザーの場合はこちらを使用）
  posts, 
  onImageClick, 
  onEdit, 
  onDelete, 
  onLike, 
  connected,
  // 編集機能用の追加props
  exercises,
  onUpdate,
  onDeleteCustomExercise
}) => {
  // カレンダーの年月状態管理
  const [calendarDate, setCalendarDate] = React.useState(() => new Date());
  
  // プロフィール画面での編集状態管理
  const [editingPost, setEditingPost] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [formData, setFormData] = React.useState({
    exercises: [{ exercise: '', sets: [{ weight: '', reps: '' }] }],
    comment: '',
    workoutDate: new Date().toISOString().split('T')[0],
  });
  const [showCustomInput, setShowCustomInput] = React.useState([false]);
  
  // 時刻表示関数（コンポーネント内で直接定義）
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      if (isNaN(date.getTime()) || isNaN(now.getTime())) {
        return '時刻不明';
      }
      
      // 日本時間ベースで時差を計算
      const japanOffset = 9 * 60 * 60 * 1000;
      const nowJST = new Date(now.getTime() + japanOffset);
      const dateJST = new Date(date.getTime() + japanOffset);
      
      const diff = nowJST - dateJST;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "たった今";
      if (minutes < 60) return `${minutes}分前`;
      if (hours < 24) return `${hours}時間前`;
      if (days < 7) return `${days}日前`;
      
      // 古い投稿は日本時間で日時表示
      try {
        const japanTimeString = date.toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return japanTimeString.replace(/(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{2}):(\d{2}).*/, '$1/$2/$3 $4:$5');
      } catch (error) {
        const japanDate = new Date(date.getTime() + japanOffset);
        const year = japanDate.getUTCFullYear();
        const month = japanDate.getUTCMonth() + 1;
        const day = japanDate.getUTCDate();
        const hour = japanDate.getUTCHours().toString().padStart(2, '0');
        const minute = japanDate.getUTCMinutes().toString().padStart(2, '0');
        return `${year}/${month}/${day} ${hour}:${minute}`;
      }
    } catch (error) {
      console.error('formatTimestamp error:', error);
      return '時刻エラー';
    }
  };

  // プロフィール画面内での編集処理
  const handleEditInProfile = (post) => {
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
    setSelectedImage(null);
    setShowForm(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 15 * 1024 * 1024) {
      setSelectedImage(file);
    } else {
      alert("画像は15MB以下にしてください");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({
      exercises: [{ exercise: '', sets: [{ weight: '', reps: '' }] }],
      comment: '',
      workoutDate: new Date().toISOString().split('T')[0],
    });
    setSelectedImage(null);
    setShowCustomInput([false]);
  };

  // 表示対象のユーザー（他ユーザーを見ている場合はviewingUser、自分の場合はcurrentUser）
  const targetUser = viewingUser || currentUser;
  const isOwnProfile = !viewingUser || viewingUser.id === currentUser?.id;
  
  // 対象ユーザーの投稿のみフィルタリング
  const userPosts = posts.filter(post => {
    const postUserId = typeof post.userId === 'object' ? post.userId._id : post.userId;
    return postUserId === targetUser.id || post.user === targetUser.username;
  });

  // BIG3の最大重量を計算
  const calculateMaxWeights = () => {
    const big3 = {
      'ベンチプレス': 0,
      'デッドリフト': 0,
      'スクワット': 0
    };

    userPosts.forEach(post => {
      if (post.exercises && Array.isArray(post.exercises)) {
        post.exercises.forEach(exercise => {
          if (big3.hasOwnProperty(exercise.exercise)) {
            exercise.sets.forEach(set => {
              if (set.weight > big3[exercise.exercise]) {
                big3[exercise.exercise] = set.weight;
              }
            });
          }
        });
      }
      // 旧形式との互換性
      else if (post.exercise && big3.hasOwnProperty(post.exercise)) {
        if (post.sets && Array.isArray(post.sets)) {
          post.sets.forEach(set => {
            if (set.weight > big3[post.exercise]) {
              big3[post.exercise] = set.weight;
            }
          });
        }
      }
    });

    return big3;
  };

  // トレーニング日のカレンダーデータを作成
  const getWorkoutDates = () => {
    const workoutDates = new Set();
    
    userPosts.forEach(post => {
      const date = post.workoutDate || post.timestamp;
      if (date) {
        const dateStr = new Date(date).toDateString();
        workoutDates.add(dateStr);
      }
    });
    
    return workoutDates;
  };

  // 月のカレンダーを生成
  const generateCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    const workoutDates = getWorkoutDates();
    
    // 前月の空白日
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // 今月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const hasWorkout = workoutDates.has(date.toDateString());
      days.push({ day, hasWorkout, date });
    }
    
    return days;
  };

  // カレンダー関連の関数
  const goToPreviousMonth = () => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCalendarDate(new Date());
  };

  const maxWeights = calculateMaxWeights();
  const calendarDays = generateCalendar(calendarDate.getFullYear(), calendarDate.getMonth());
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const currentDate = new Date();
  const isCurrentMonth = calendarDate.getFullYear() === currentDate.getFullYear() && 
                         calendarDate.getMonth() === currentDate.getMonth();

  return React.createElement(
    "div",
    { className: "space-y-4 sm:space-y-6" },
    
    // ユーザー情報セクション
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 hover-lift border border-gray-100" },
      React.createElement(
        "div",
        { className: "flex items-center space-x-4 mb-4" },
        React.createElement(
          "div",
          {
            className: "w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
          },
          targetUser.avatar || targetUser.username.charAt(0).toUpperCase()
        ),
        React.createElement(
          "div",
          {},
          React.createElement(
            "h1",
            { className: "text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent" },
            targetUser.username
          ),
          React.createElement(
            "p",
            { className: "text-gray-600" },
            `総投稿数: ${userPosts.length}件`
          ),
          !isOwnProfile &&
            React.createElement(
              "p",
              { className: "text-sm text-blue-600 mt-1" },
              `${targetUser.username}さんのプロフィール`
            )
        )
      )
    ),

    // BIG3最大重量セクション
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 hover-lift border border-gray-100" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" },
        React.createElement(Dumbbell, { className: "h-6 w-6 mr-3 text-indigo-500" }),
        "BIG3 最大重量"
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
        Object.entries(maxWeights).map(([exercise, weight]) =>
          React.createElement(
            "div",
            {
              key: exercise,
              className: "bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300"
            },
            React.createElement(
              "h3",
              { className: "font-bold text-gray-800 mb-2 text-lg" },
              exercise
            ),
            React.createElement(
              "p",
              { className: "text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" },
              weight > 0 ? `${weight}kg` : "記録なし"
            )
          )
        )
      )
    ),

    // トレーニングカレンダーセクション
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 hover-lift border border-gray-100" },
      // ヘッダー（モバイル対応）
      React.createElement(
        "div",
        { className: "mb-4" },
        React.createElement(
          "h2",
          { className: "text-lg sm:text-2xl font-bold flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3" },
          React.createElement(Calendar, { className: "h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-indigo-500" }),
          React.createElement("span", { className: "hidden sm:inline" }, "トレーニングカレンダー"),
          React.createElement("span", { className: "sm:hidden" }, "カレンダー")
        ),
        React.createElement(
          "div",
          { className: "flex items-center justify-between" },
          React.createElement(
            "button",
            {
              onClick: goToPreviousMonth,
              className: "p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors",
              title: "前月"
            },
            React.createElement(ChevronLeft, { className: "h-5 w-5" })
          ),
          React.createElement(
            "div",
            { className: "text-base sm:text-lg font-semibold text-center flex-1" },
            React.createElement("span", { className: "hidden sm:inline" }, `${calendarDate.getFullYear()}年${monthNames[calendarDate.getMonth()]}`),
            React.createElement("span", { className: "sm:hidden" }, `${calendarDate.getFullYear()}/${calendarDate.getMonth() + 1}`)
          ),
          React.createElement(
            "button",
            {
              onClick: goToNextMonth,  
              className: "p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors",
              title: "次月"
            },
            React.createElement(ChevronRight, { className: "h-5 w-5" })
          ),
          !isCurrentMonth && React.createElement(
            "button",
            {
              onClick: goToCurrentMonth,
              className: "ml-2 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-colors"
            },
            "今月"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-7 gap-1 sm:gap-2 text-center" },
        // 曜日ヘッダー（モバイル対応）
        ['日', '月', '火', '水', '木', '金', '土'].map(dayName =>
          React.createElement(
            "div",
            {
              key: dayName,
              className: "py-1 sm:py-2 text-xs sm:text-sm font-semibold text-gray-600"
            },
            dayName
          )
        ),
        // カレンダーの日付（モバイル対応）
        calendarDays.map((day, index) =>
          React.createElement(
            "div",
            {
              key: index,
              className: `aspect-square flex items-center justify-center text-xs sm:text-sm min-h-[32px] sm:min-h-[40px] transition-all duration-200 ${
                day === null 
                  ? "text-gray-300" 
                  : day.hasWorkout 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold shadow-lg animate-pulse" 
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg cursor-pointer"
              }`
            },
            day ? day.day : ""
          )
        )
      ),
      React.createElement(
        "div",
        { className: "mt-3 sm:mt-4 flex items-center justify-center" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full" },
          React.createElement(
            "div",
            { className: "w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" }
          ),
          React.createElement("span", { className: "text-xs sm:text-sm text-gray-600 font-medium" }, "トレーニング実施日")
        )
      )
    ),

    // 過去の投稿一覧セクション
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 hover-lift border border-gray-100" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" },
        React.createElement(MessageCircle, { className: "h-6 w-6 mr-3 text-indigo-500" }),
        "過去の投稿一覧"
      ),
      userPosts.length === 0 
        ? React.createElement(
            "p",
            { className: "text-gray-500 text-center py-8" },
            "まだ投稿がありません。最初のトレーニングを記録してみましょう！"
          )
        : !showForm && React.createElement(
            "div",
            { className: "space-y-4" },
            userPosts.slice(0, 10).map(post =>
              React.createElement(
                "div",
                {
                  key: post._id || post.id,
                  className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                },
                React.createElement(
                  "div",
                  { className: "flex items-center justify-between mb-2" },
                  React.createElement(
                    "span",
                    { className: "text-sm text-gray-500" },
                    post.displayTime || formatTimestamp(post.workoutDate || post.timestamp)
                  ),
                  isOwnProfile &&
                    React.createElement(
                      "div",
                      { className: "flex items-center space-x-2" },
                      React.createElement(
                        "button",
                        {
                          onClick: () => handleEditInProfile(post),
                          className: "p-1 text-gray-500 hover:text-blue-500"
                        },
                        React.createElement(Edit, { className: "h-4 w-4" })
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => onDelete(post._id || post.id),
                          className: "p-1 text-gray-500 hover:text-red-500"
                        },
                        React.createElement(Trash, { className: "h-4 w-4" })
                      )
                    )
                ),
                
                // 種目表示
                (() => {
                  let exercises = post.exercises;
                  if (typeof exercises === "string") {
                    try { exercises = JSON.parse(exercises); } catch { exercises = null; }
                  }
                  if (!Array.isArray(exercises)) {
                    exercises = [{
                      exercise: post.exercise,
                      sets: post.sets ?? [{ weight: post.weight, reps: post.reps }]
                    }];
                  }
                  return React.createElement(
                    "div",
                    { className: "space-y-2" },
                    exercises.map((ex, i) =>
                      React.createElement(ExerciseBlock, { key: i, ex })
                    )
                  );
                })(),
                
                // 画像表示
                post.image &&
                  React.createElement("img", {
                    src: post.image,
                    alt: "トレーニング写真",
                    className: "rounded-lg max-h-48 w-full object-cover cursor-pointer mt-2",
                    onClick: () => onImageClick(post.image),
                    onLoad: (e) => {
                      console.log("プロフィール画像読み込み成功:", {
                        url: post.image,
                        isCloudinary: post.image?.startsWith('https://res.cloudinary.com')
                      });
                    },
                    onError: (e) => {
                      console.error("プロフィール画像の読み込みに失敗しました:", {
                        url: post.image,
                        isCloudinary: post.image?.startsWith('https://res.cloudinary.com')
                      });
                    }
                  }),
                
                // コメント
                post.comment &&
                  React.createElement(CommentWithLineBreaks, {
                    comment: post.comment
                  }),
                
                // いいね数表示
                React.createElement(
                  "div",
                  { className: "flex items-center space-x-4 mt-2 pt-2 border-t border-gray-100" },
                  React.createElement(
                    "div",
                    { className: "flex items-center space-x-1 text-gray-600" },
                    React.createElement(Heart, { className: "h-4 w-4" }),
                    React.createElement("span", { className: "text-sm" }, post.likes || 0)
                  )
                )
              )
            ),
            userPosts.length > 10 &&
              React.createElement(
                "p",
                { className: "text-center text-gray-500 text-sm" },
                `${userPosts.length - 10}件の投稿がさらにあります`
              ),

            // プロフィール画面での編集フォーム
            showForm && editingPost &&
              React.createElement(WorkoutForm, {
                formData,
                setFormData,
                exercises,
                showCustomInput,
                setShowCustomInput,
                editingPost,
                selectedImage,
                posts,
                currentUser,
                onImageSelect: handleImageSelect,
                onSubmit: () => {}, // プロフィール画面では新規投稿はしない
                onUpdate,
                onCancel: handleFormCancel,
                onAddExercise: () => {
                  setFormData({
                    ...formData,
                    exercises: [
                      ...formData.exercises,
                      { exercise: "", sets: [{ weight: "", reps: "" }] },
                    ],
                  });
                  setShowCustomInput([...showCustomInput, false]);
                },
                onRemoveExercise: (index) => {
                  if (formData.exercises.length > 1) {
                    setFormData({
                      ...formData,
                      exercises: formData.exercises.filter((_, i) => i !== index),
                    });
                    setShowCustomInput(showCustomInput.filter((_, i) => i !== index));
                  }
                },
                onUpdateExercise: (index, value) => {
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
                },
                onAddSet: (exerciseIndex) => {
                  const newExercises = [...formData.exercises];
                  const exerciseName = newExercises[exerciseIndex].exercise;
                  const isCardio = window.isCardioExercise && window.isCardioExercise(exerciseName);
                  const isBodyweight = window.isBodyweightExercise && window.isBodyweightExercise(exerciseName);
                  
                  let newSet;
                  if (isCardio) {
                    newSet = { distance: "", time: "" };
                  } else if (isBodyweight) {
                    newSet = { bodyweight: "", reps: "" };
                  } else {
                    newSet = { weight: "", reps: "" };
                  }
                  
                  newExercises[exerciseIndex].sets.push(newSet);
                  setFormData({ ...formData, exercises: newExercises });
                },
                onRemoveSet: (exerciseIndex, setIndex) => {
                  const newExercises = [...formData.exercises];
                  if (newExercises[exerciseIndex].sets.length > 1) {
                    newExercises[exerciseIndex].sets.splice(setIndex, 1);
                    setFormData({ ...formData, exercises: newExercises });
                  }
                },
                onUpdateSet: (exerciseIndex, setIndex, field, value) => {
                  const newExercises = [...formData.exercises];
                  newExercises[exerciseIndex].sets[setIndex][field] = value;
                  setFormData({ ...formData, exercises: newExercises });
                },
                onCopyPreviousWeight: (exerciseIndex, setIndex) => {
                  if (setIndex > 0) {
                    const previousWeight =
                      formData.exercises[exerciseIndex].sets[setIndex - 1].weight;
                    const newExercises = [...formData.exercises];
                    newExercises[exerciseIndex].sets[setIndex].weight = previousWeight;
                    setFormData({ ...formData, exercises: newExercises });
                  }
                },
                onDeleteCustomExercise
              })
          )
    )
  );
};
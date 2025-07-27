// プロフィールページコンポーネント
const ProfilePage = ({ 
  currentUser, 
  posts, 
  onImageClick, 
  onEdit, 
  onDelete, 
  onLike, 
  connected 
}) => {
  // 現在のユーザーの投稿のみフィルタリング
  const userPosts = posts.filter(post => {
    const postUserId = typeof post.userId === 'object' ? post.userId._id : post.userId;
    return postUserId === currentUser.id || post.user === currentUser.username;
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

  const maxWeights = calculateMaxWeights();
  const currentDate = new Date();
  const calendarDays = generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return React.createElement(
    "div",
    { className: "space-y-6" },
    
    // ユーザー情報セクション
    React.createElement(
      "div",
      { className: "bg-white rounded-xl shadow-md p-6" },
      React.createElement(
        "div",
        { className: "flex items-center space-x-4 mb-4" },
        React.createElement(
          "div",
          {
            className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl"
          },
          currentUser.avatar
        ),
        React.createElement(
          "div",
          {},
          React.createElement(
            "h1",
            { className: "text-2xl font-bold text-gray-800" },
            currentUser.username
          ),
          React.createElement(
            "p",
            { className: "text-gray-600" },
            `総投稿数: ${userPosts.length}件`
          )
        )
      )
    ),

    // BIG3最大重量セクション
    React.createElement(
      "div",
      { className: "bg-white rounded-xl shadow-md p-6" },
      React.createElement(
        "h2",
        { className: "text-xl font-bold mb-4 flex items-center" },
        React.createElement(Dumbbell, { className: "h-5 w-5 mr-2" }),
        "BIG3 最大重量"
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
        Object.entries(maxWeights).map(([exercise, weight]) =>
          React.createElement(
            "div",
            {
              key: exercise,
              className: "bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
            },
            React.createElement(
              "h3",
              { className: "font-semibold text-gray-800 mb-1" },
              exercise
            ),
            React.createElement(
              "p",
              { className: "text-2xl font-bold text-blue-600" },
              weight > 0 ? `${weight}kg` : "記録なし"
            )
          )
        )
      )
    ),

    // トレーニングカレンダーセクション
    React.createElement(
      "div",
      { className: "bg-white rounded-xl shadow-md p-6" },
      React.createElement(
        "h2",
        { className: "text-xl font-bold mb-4 flex items-center" },
        React.createElement(Calendar, { className: "h-5 w-5 mr-2" }),
        `トレーニングカレンダー - ${currentDate.getFullYear()}年${monthNames[currentDate.getMonth()]}`
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-7 gap-1 text-center" },
        // 曜日ヘッダー
        ['日', '月', '火', '水', '木', '金', '土'].map(dayName =>
          React.createElement(
            "div",
            {
              key: dayName,
              className: "py-2 text-sm font-semibold text-gray-600"
            },
            dayName
          )
        ),
        // カレンダーの日付
        calendarDays.map((day, index) =>
          React.createElement(
            "div",
            {
              key: index,
              className: `aspect-square flex items-center justify-center text-sm ${
                day === null 
                  ? "text-gray-300" 
                  : day.hasWorkout 
                    ? "bg-blue-500 text-white rounded-full font-bold" 
                    : "text-gray-700 hover:bg-gray-100 rounded"
              }`
            },
            day ? day.day : ""
          )
        )
      ),
      React.createElement(
        "div",
        { className: "mt-4 flex items-center space-x-4 text-sm text-gray-600" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-2" },
          React.createElement(
            "div",
            { className: "w-4 h-4 bg-blue-500 rounded-full" }
          ),
          React.createElement("span", {}, "トレーニング実施日")
        )
      )
    ),

    // 過去の投稿一覧セクション
    React.createElement(
      "div",
      { className: "bg-white rounded-xl shadow-md p-6" },
      React.createElement(
        "h2",
        { className: "text-xl font-bold mb-4 flex items-center" },
        React.createElement(MessageCircle, { className: "h-5 w-5 mr-2" }),
        "過去の投稿一覧"
      ),
      userPosts.length === 0 
        ? React.createElement(
            "p",
            { className: "text-gray-500 text-center py-8" },
            "まだ投稿がありません。最初のトレーニングを記録してみましょう！"
          )
        : React.createElement(
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
                    formatTimestamp(post.workoutDate || post.timestamp)
                  ),
                  React.createElement(
                    "div",
                    { className: "flex items-center space-x-2" },
                    React.createElement(
                      "button",
                      {
                        onClick: () => onEdit(post),
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
                    onClick: () => onImageClick(post.image)
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
              )
          )
    )
  );
};
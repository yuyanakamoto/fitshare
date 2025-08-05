// 共通コンポーネント

// 画像モーダルコンポーネント
const ImageModal = ({ imageUrl, onClose }) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return React.createElement(
    "div",
    {
      className:
        "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4",
      onClick: onClose,
    },
    React.createElement(
      "div",
      {
        className:
          "relative max-w-full max-h-full flex items-center justify-center",
        onClick: (e) => e.stopPropagation(),
      },
      React.createElement(
        "button",
        {
          onClick: onClose,
          className:
            "absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors z-10",
        },
        React.createElement(X, { className: "h-6 w-6" })
      ),
      React.createElement("img", {
        src: imageUrl,
        alt: "トレーニング写真",
        className: "max-w-full max-h-[90vh] object-contain",
        onError: (e) => {
          console.error("画像の読み込みに失敗しました:", imageUrl);
          e.target.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPueUu+WDj+OBjOiqreOBv+i+vOOCgeOBvuOBm+OCkzwvdGV4dD4KPC9zdmc+";
        },
      })
    )
  );
};

// 複数種目表示用コンポーネント
const ExerciseBlock = ({ ex }) => {
  const isCardio = window.isCardioExercise && window.isCardioExercise(ex.exercise);
  const isBodyweight = window.isBodyweightExercise && window.isBodyweightExercise(ex.exercise);
  
  let className;
  if (isCardio) {
    className = "bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-2 border border-green-200";
  } else if (isBodyweight) {
    className = "bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 mb-2 border border-orange-200";
  } else {
    className = "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-2";
  }
  
  return React.createElement(
    "div",
    { className },
    React.createElement(
      "div",
      { className: "mb-2" },
      React.createElement(
        "span", 
        { 
          className: isCardio 
            ? "font-semibold text-green-700" 
            : isBodyweight 
              ? "font-semibold text-orange-700" 
              : "font-semibold" 
        }, 
        ex.exercise
      )
    ),
    ex.sets && Array.isArray(ex.sets)
      ? React.createElement(
          "div",
          { className: "space-y-1" },
          ex.sets.map((set, index) =>
            React.createElement(
              "div",
              { key: index, className: "flex items-center space-x-2 text-sm" },
              React.createElement(
                "span",
                { 
                  className: isCardio 
                    ? "font-medium text-green-600 w-16" 
                    : isBodyweight 
                      ? "font-medium text-orange-600 w-16" 
                      : "font-medium text-gray-600 w-16" 
                },
                `${index + 1}${isCardio ? '回目:' : 'セット:'}`
              ),
              isCardio ? 
                // 有酸素運動の表示（距離・時間・ペース）
                (() => {
                  const distance = parseFloat(set.distance || 0);
                  const timeString = set.time || "";
                  const totalMinutes = window.timeStringToMinutes ? window.timeStringToMinutes(timeString) : 0;
                  
                  let paceDisplay = "";
                  if (distance > 0 && totalMinutes > 0) {
                    const pace = window.calculatePace ? window.calculatePace(distance, totalMinutes) : null;
                    if (pace) {
                      const paceMin = Math.floor(pace);
                      const paceSec = Math.round((pace - paceMin) * 60);
                      paceDisplay = ` (${paceMin}:${paceSec.toString().padStart(2, '0')}/km)`;
                    }
                  }
                  
                  return React.createElement(
                    "span",
                    { className: "font-bold text-green-600" },
                    `${distance}km ${timeString}${paceDisplay}`
                  );
                })()
              : isBodyweight ?
                // 自重トレーニングの表示（体重・回数）
                React.createElement(
                  "span",
                  { className: "font-bold text-orange-600" },
                  `${set.bodyweight}kg × ${set.reps}回`
                )
              :
                // ウェイトトレーニングの表示（重量・回数）
                React.createElement(
                  "span",
                  { className: "font-bold text-blue-600" },
                  `${set.weight}kg × ${set.reps}回`
                )
            )
          )
        )
      : null
  );
};

// コメントを改行対応で表示するコンポーネント
const CommentWithLineBreaks = ({ comment }) => {
  const lines = comment.split("\n");
  return React.createElement(
    "div",
    { className: "text-gray-700 text-sm mb-2" },
    lines.map((line, index) =>
      React.createElement(
        React.Fragment,
        { key: index },
        line,
        index < lines.length - 1 && React.createElement("br")
      )
    )
  );
};

// コメントセクションコンポーネント（Instagram風デザイン）
const CommentSection = ({ post, currentUser, onAddComment, onLike, hasLiked, connected }) => {
  const [showComments, setShowComments] = React.useState(false);
  const [showLikes, setShowLikes] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(post._id || post.id, commentText.trim());
      setCommentText("");
    } catch (error) {
      console.error('コメント送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return React.createElement(
    "div",
    { className: "pt-3" },
    
    // アクションボタン（いいね・コメント・シェア）
    React.createElement(
      "div",
      { className: "flex items-center justify-between mb-3" },
      React.createElement(
        "div",
        { className: "flex items-center space-x-4" },
        // いいねボタン
        React.createElement(
          "button",
          {
            onClick: () => onLike(post._id || post.id),
            className: "flex items-center space-x-2 group transition-colors",
            disabled: !connected,
          },
          React.createElement(Heart, {
            className: `h-6 w-6 transition-colors ${
              hasLiked 
                ? "fill-red-500 text-red-500" 
                : "text-gray-700 group-hover:text-red-500"
            }`,
          }),
          React.createElement(
            "button",
            { 
              className: "text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors",
              onClick: () => {
                if (post.likes > 0) {
                  setShowLikes(!showLikes);
                }
              }
            },
            post.likes || 0
          )
        ),
        // コメントボタン
        React.createElement(
          "button",
          {
            onClick: () => setShowComments(!showComments),
            className: "flex items-center space-x-2 group transition-colors"
          },
          React.createElement(MessageCircle, { 
            className: `h-6 w-6 text-gray-700 group-hover:text-blue-500 transition-colors ${showComments ? 'text-blue-500' : ''}` 
          }),
          React.createElement(
            "span",
            { className: "text-sm font-medium text-gray-700" },
            post.commentCount || 0
          )
        )
      )
    ),

    // いいね詳細情報（Instagram風）
    post.likes > 0 && React.createElement(
      "div",
      { className: "px-1 mb-2" },
      React.createElement(
        "button",
        {
          onClick: () => setShowLikes(!showLikes),
          className: "text-sm text-gray-900 hover:text-gray-700 transition-colors"
        },
        post.likes === 1 
          ? React.createElement(
              "span",
              {},
              React.createElement("span", { className: "font-semibold" }, (post.likedBy?.[0]?.username || "誰か")), 
              "がいいねしました"
            )
          : React.createElement(
              "span",
              {},
              React.createElement("span", { className: "font-semibold" }, post.likes.toLocaleString()),
              "人がいいねしました"
            )
      )
    ),

    // いいねした人一覧（表示時のみ）
    showLikes && React.createElement(
      "div",
      { className: "bg-gray-50 rounded-2xl p-4 mb-3" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between mb-3" },
        React.createElement(
          "h4",
          { className: "font-semibold text-gray-900" },
          "いいね"
        ),
        React.createElement(
          "button",
          {
            onClick: () => setShowLikes(false),
            className: "text-gray-500 hover:text-gray-700"
          },
          React.createElement("svg", {
            className: "w-5 h-5",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M6 18L18 6M6 6l12 12"
            })
          )
        )
      ),
      React.createElement(
        "div",
        { className: "space-y-3 max-h-60 overflow-y-auto" },
        (post.likedBy || []).map((user, index) =>
          React.createElement(
            "div",
            { key: index, className: "flex items-center space-x-3" },
            // ユーザーアバター
            React.createElement(
              "div",
              { className: "w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden" },
              user.avatar && user.avatar !== user.username.charAt(0).toUpperCase()
                ? React.createElement("img", {
                    src: user.avatar,
                    alt: `${user.username}のアバター`,
                    className: "w-full h-full object-cover",
                    onError: (e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.textContent = user.username.charAt(0).toUpperCase();
                    }
                  })
                : user.username.charAt(0).toUpperCase()
            ),
            // ユーザー名
            React.createElement(
              "div",
              { className: "flex-1" },
              React.createElement(
                "span",
                { className: "font-medium text-gray-900" },
                user.username
              )
            ),
            // フォローボタン（現在のユーザーでない場合）
            currentUser && user._id !== currentUser.id && React.createElement(
              "button",
              { className: "px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors" },
              "フォロー"
            )
          )
        )
      )
    ),

    // コメント一覧（表示時のみ）
    showComments && React.createElement(
      "div",
      { className: "space-y-3 mb-4" },
      (post.comments || []).map((comment, index) =>
        React.createElement(
          "div",
          { key: index, className: "flex space-x-3" },
          // ユーザーアバター（小）
          React.createElement(
            "div",
            { className: "w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" },
            comment.username.charAt(0).toUpperCase()
          ),
          // コメント内容
          React.createElement(
            "div",
            { className: "flex-1 min-w-0" },
            React.createElement(
              "div",
              { className: "bg-gray-50 rounded-2xl px-3 py-2" },
              React.createElement(
                "div",
                { className: "flex items-baseline space-x-2 mb-1" },
                React.createElement(
                  "span", 
                  { className: "font-semibold text-gray-900 text-sm" }, 
                  comment.username
                ),
                React.createElement(
                  "span", 
                  { className: "text-gray-500 text-xs" }, 
                  window.formatTimestamp ? window.formatTimestamp(comment.timestamp) : "時刻不明"
                )
              ),
              React.createElement(
                "p",
                { className: "text-gray-800 text-sm" },
                comment.text
              )
            )
          )
        )
      )
    ),

    // コメント入力フォーム
    showComments && currentUser && React.createElement(
      "form",
      { onSubmit: handleSubmitComment, className: "flex space-x-3 mt-3" },
      // ユーザーアバター（小）
      React.createElement(
        "div",
        { className: "w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden" },
        currentUser.avatar && currentUser.avatar !== currentUser.username.charAt(0).toUpperCase()
          ? React.createElement("img", {
              src: currentUser.avatar,
              alt: "アバター",
              className: "w-full h-full object-cover",
              onError: (e) => {
                e.target.style.display = 'none';
                e.target.parentElement.textContent = currentUser.username.charAt(0).toUpperCase();
              }
            })
          : currentUser.username.charAt(0).toUpperCase()
      ),
      // 入力フィールド
      React.createElement("input", {
        type: "text",
        value: commentText,
        onChange: (e) => setCommentText(e.target.value),
        placeholder: "コメントを追加...",
        className: "flex-1 px-4 py-2 bg-gray-50 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors",
        maxLength: 200,
        disabled: isSubmitting
      }),
      // 送信ボタン
      commentText.trim() && React.createElement(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        },
        isSubmitting ? "送信中..." : "投稿"
      )
    )
  );
};
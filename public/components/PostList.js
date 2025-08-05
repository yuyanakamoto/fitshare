// 投稿リストコンポーネント
const PostList = ({ posts, currentUser, connected, onLike, onEdit, onDelete, onImageClick, onUserClick, onAddComment }) => {
  
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
  return React.createElement(
    "div",
    { className: "space-y-3 sm:space-y-4" },
    posts.map((post) => {
      const postUser = post.userId || post.user;
      const isOwner =
        currentUser &&
        postUser &&
        ((typeof postUser === "object" &&
          postUser._id === currentUser.id) ||
          (typeof postUser === "string" &&
            postUser === currentUser.username));
      const hasLiked =
        currentUser &&
        post.likedBy &&
        post.likedBy.includes(currentUser.id);
      const displayUser =
        typeof postUser === "object" ? postUser.username : post.user;
      const displayAvatar =
        typeof postUser === "object" ? postUser.avatar : post.avatar;

      return React.createElement(
        "div",
        {
          key: post._id || post.id,
          className: "bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover-lift border border-gray-100",
        },
        React.createElement(
          "div",
          { className: "flex items-start space-x-3" },
          React.createElement(
            "div",
            {
              className:
                "w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden",
            },
            displayAvatar && displayAvatar !== displayUser.charAt(0).toUpperCase()
              ? React.createElement("img", {
                  src: displayAvatar,
                  alt: "アバター",
                  className: "w-full h-full object-cover rounded-full",
                  onError: (e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.textContent = displayUser.charAt(0).toUpperCase();
                  }
                })
              : displayUser.charAt(0).toUpperCase()
          ),
          React.createElement(
            "div",
            { className: "flex-1" },
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-2" },
              React.createElement(
                "h3",
                { 
                  className: "font-bold text-lg cursor-pointer hover:text-indigo-600 transition-colors",
                  onClick: () => {
                    if (onUserClick && typeof postUser === 'object') {
                      onUserClick({
                        id: postUser._id,
                        username: postUser.username,
                        avatar: postUser.avatar
                      });
                    }
                  }
                },
                displayUser
              ),
              React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                React.createElement(
                  "span",
                  { className: "text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full" },
                  post.displayTime || formatTimestamp(post.workoutDate || post.timestamp)
                ),
                isOwner &&
                  React.createElement(
                    "div",
                    { className: "flex items-center space-x-1" },
                    React.createElement(
                      "button",
                      {
                        onClick: () => onEdit(post),
                        className:
                          "p-1 text-gray-500 hover:text-blue-500",
                      },
                      React.createElement(Edit, {
                        className: "h-4 w-4",
                      })
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () =>
                          onDelete(post._id || post.id),
                        className:
                          "p-1 text-gray-500 hover:text-red-500",
                      },
                      React.createElement(Trash, {
                        className: "h-4 w-4",
                      })
                    )
                  )
              )
            ),

            // 種目表示（複数種目対応）
            (() => {
              let list = post.exercises;
              if (typeof list === "string") {
                try { list = JSON.parse(list); } catch { list = null; }
              }
              if (!Array.isArray(list)) {
                list = [{
                  exercise: post.exercise,
                  sets: post.sets ?? [{ weight: post.weight, reps: post.reps }]
                }];
              }
              return React.createElement(
                React.Fragment,
                null,
                list.map((ex, i) =>
                  React.createElement(ExerciseBlock, { key: i, ex })
                )
              );
            })(),

            // 画像表示（クリックで拡大）
            post.image &&
              React.createElement(
                "div",
                {
                  className: "mb-2 relative group",
                },
                React.createElement("img", {
                  key: `img-${post._id || post.id}-${post.image}`,
                  src: post.image,
                  alt: "トレーニング写真",
                  className:
                    "rounded-lg max-h-64 w-full object-cover cursor-pointer",
                  loading: "lazy",
                  onClick: (e) => {
                    e.stopPropagation();
                    onImageClick(post.image);
                  },
                  onLoad: (e) => {
                    console.log("画像読み込み成功:", {
                      url: post.image,
                      isCloudinary: post.image?.startsWith('https://res.cloudinary.com'),
                      dimensions: `${e.target.naturalWidth}x${e.target.naturalHeight}`
                    });
                  },
                  onError: (e) => {
                    console.error("画像の読み込みに失敗しました:", {
                      url: post.image,
                      error: e,
                      userAgent: navigator.userAgent,
                      isCloudinary: post.image?.startsWith('https://res.cloudinary.com')
                    });
                    if (!e.target.dataset.errorHandled) {
                      e.target.dataset.errorHandled = "true";
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPueUu+WDj+OBjOiqreOBv+i+vOOCgeOBvuOBm+OCkzwvdGV4dD4KPC9zdmc+";
                    }
                  },
                }),
                React.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center pointer-events-none",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-white bg-opacity-90 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    },
                    React.createElement(Image, {
                      className: "h-5 w-5 text-gray-700",
                    })
                  )
                )
              ),

            // コメント（改行対応）
            post.comment &&
              React.createElement(CommentWithLineBreaks, {
                comment: post.comment,
              }),

            // コメントセクション（いいねボタンも含む）
            React.createElement(CommentSection, {
              post: post,
              currentUser: currentUser,
              onAddComment: onAddComment,
              onLike: onLike,
              hasLiked: hasLiked,
              connected: connected
            })
          )
        )
      );
    })
  );
};
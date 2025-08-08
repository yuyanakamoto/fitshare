// フォローリストページコンポーネント
const FollowListPage = ({ currentUser, targetUserId, listType, onUserSelect, onBack }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [targetUser, setTargetUser] = React.useState(null);

  // フォローリストを取得
  const fetchFollowList = React.useCallback(async () => {
    if (!targetUserId || !listType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('fitShareToken');
      
      // まずターゲットユーザーの情報を取得
      const userResponse = await fetch(`/api/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setTargetUser(userData);
      }
      
      // フォローリストを取得
      const endpoint = listType === 'following' 
        ? `/api/user/${targetUserId}/following`
        : `/api/user/${targetUserId}/followers`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userList = listType === 'following' ? data.following : data.followers;
        setUsers(userList || []);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (error) {
      console.error('フォローリスト取得エラー:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [targetUserId, listType]);

  // 初期データ取得
  React.useEffect(() => {
    fetchFollowList();
  }, [fetchFollowList]);

  // フォロー/フォロー解除処理
  const handleFollowToggle = async (userId, username, currentFollowStatus) => {
    try {
      const token = localStorage.getItem('fitShareToken');
      const method = currentFollowStatus ? 'DELETE' : 'POST';
      const response = await fetch(`/api/follow/${userId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // リストを再取得して最新状態を反映
        fetchFollowList();
      }
    } catch (error) {
      console.error('フォロー操作エラー:', error);
    }
  };

  const isOwnList = targetUserId === currentUser?.id;
  const pageTitle = listType === 'following' 
    ? (isOwnList ? 'フォロー中' : `${targetUser?.username}さんのフォロー中`) 
    : (isOwnList ? 'フォロワー' : `${targetUser?.username}さんのフォロワー`);

  return React.createElement(
    "div",
    { className: "max-w-4xl mx-auto p-4 space-y-6" },
    
    // ヘッダー
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100" },
      React.createElement(
        "div",
        { className: "flex items-center space-x-4" },
        React.createElement(
          "button",
          {
            onClick: onBack,
            className: "p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          },
          React.createElement("svg", {
            className: "w-6 h-6",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M10 19l-7-7m0 0l7-7m-7 7h18"
            })
          )
        ),
        React.createElement(
          "h1",
          { className: "text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" },
          pageTitle
        ),
        React.createElement(
          "span",
          { className: "text-sm text-gray-500" },
          `${users.length}人`
        )
      )
    ),

    // コンテンツ
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100" },
      
      loading 
        ? React.createElement(
            "div",
            { className: "text-center py-8" },
            React.createElement(
              "p",
              { className: "text-gray-500" },
              "読み込み中..."
            )
          )
        : error
          ? React.createElement(
              "div",
              { className: "text-center py-8" },
              React.createElement(
                "p",
                { className: "text-red-500" },
                error
              )
            )
          : users.length === 0
            ? React.createElement(
                "div",
                { className: "text-center py-8 text-gray-500" },
                React.createElement(
                  "p",
                  {},
                  listType === 'following' 
                    ? (isOwnList ? 'まだ誰もフォローしていません' : 'まだ誰もフォローしていません')
                    : (isOwnList ? 'まだフォロワーがいません' : 'まだフォロワーがいません')
                )
              )
            : React.createElement(
                "div",
                { className: "space-y-4" },
                users.map(user =>
                  React.createElement(
                    "div",
                    {
                      key: user.id,
                      className: "flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    },
                    React.createElement(
                      "div",
                      {
                        className: "flex items-center space-x-4 cursor-pointer flex-1",
                        onClick: () => onUserSelect && onUserSelect({ id: user.id, username: user.username })
                      },
                      // アバター
                      React.createElement(
                        "div",
                        { className: "w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden" },
                        (() => {
                          const shouldShowImage = user.avatar && user.avatar !== user.username?.charAt(0)?.toUpperCase();
                          const firstChar = user.username?.charAt(0)?.toUpperCase() || '?';
                          
                          return shouldShowImage
                            ? React.createElement("img", {
                                src: user.avatar,
                                alt: `${user.username}のアバター`,
                                className: "w-full h-full object-cover",
                                onError: (e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.textContent = firstChar;
                                }
                              })
                            : firstChar;
                        })()
                      ),
                      // ユーザー情報
                      React.createElement(
                        "div",
                        { className: "flex-1" },
                        React.createElement(
                          "h3",
                          { className: "font-bold text-lg text-gray-800" },
                          user.username
                        ),
                        React.createElement(
                          "p",
                          { className: "text-sm text-gray-500" },
                          `${new Date(user.followedAt).toLocaleDateString('ja-JP')}からの関係`
                        )
                      )
                    ),
                    // フォローボタン（自分以外かつ自分のリスト以外の場合）
                    currentUser?.id !== user.id && React.createElement(
                      "button",
                      {
                        onClick: async (e) => {
                          e.stopPropagation();
                          
                          // 現在のフォロー状態を確認
                          const token = localStorage.getItem('fitShareToken');
                          const statusResponse = await fetch(`/api/user/${user.id}/follow-status`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          if (statusResponse.ok) {
                            const statusData = await statusResponse.json();
                            await handleFollowToggle(user.id, user.username, statusData.isFollowing);
                          }
                        },
                        className: "px-4 py-2 bg-blue-600 text-white rounded-full font-medium text-sm hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      },
                      'フォロー確認'
                    )
                  )
                )
              )
    )
  );
};

// グローバルスコープに追加
window.FollowListPage = FollowListPage;
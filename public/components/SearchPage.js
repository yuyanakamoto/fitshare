// ユーザー検索ページコンポーネント
const SearchPage = ({ currentUser, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [followingUsers, setFollowingUsers] = React.useState(new Map());

  // 検索処理
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('fitShareToken');
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
        setHasSearched(true);
      } else {
        console.error('検索エラー:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('検索エラー:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // フォロー/フォロー解除処理
  const handleFollowToggle = async (userId, currentFollowStatus) => {
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
        const data = await response.json();
        
        // 検索結果を更新
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId 
              ? { 
                  ...user, 
                  isFollowing: data.isFollowing,
                  followerCount: data.isFollowing 
                    ? user.followerCount + 1 
                    : user.followerCount - 1
                }
              : user
          )
        );
      }
    } catch (error) {
      console.error('フォロー操作エラー:', error);
    }
  };

  // Enterキーでの検索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return React.createElement(
    "div",
    { className: "max-w-4xl mx-auto p-4 space-y-6" },
    
    // 検索ヘッダー
    React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100" },
      React.createElement(
        "h1",
        { className: "text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" },
        "ユーザー検索"
      ),
      React.createElement(
        "div",
        { className: "flex gap-3" },
        React.createElement("input", {
          type: "text",
          placeholder: "ユーザー名を入力してください",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          onKeyPress: handleKeyPress,
          className: "flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        }),
        React.createElement(
          "button",
          {
            onClick: handleSearch,
            disabled: loading || !searchQuery.trim(),
            className: `px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium ${
              loading || !searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`
          },
          loading ? '検索中...' : '検索'
        )
      )
    ),

    // 検索結果
    hasSearched && React.createElement(
      "div",
      { className: "bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100" },
      React.createElement(
        "h2",
        { className: "text-xl font-bold mb-4 text-gray-800" },
        `検索結果: ${searchResults.length}件`
      ),
      
      searchResults.length === 0
        ? React.createElement(
            "div",
            { className: "text-center py-8 text-gray-500" },
            React.createElement(
              "p",
              {},
              "該当するユーザーが見つかりませんでした"
            )
          )
        : React.createElement(
            "div",
            { className: "space-y-4" },
            searchResults.map(user =>
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
                    onClick: () => onUserSelect && onUserSelect(user)
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
                      "div",
                      { className: "flex space-x-4 text-sm text-gray-600" },
                      React.createElement(
                        "span",
                        {},
                        `フォロー: ${user.followingCount || 0}`
                      ),
                      React.createElement(
                        "span",
                        {},
                        `フォロワー: ${user.followerCount || 0}`
                      )
                    )
                  )
                ),
                // フォローボタン（自分以外）
                !user.isSelf && React.createElement(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleFollowToggle(user.id, user.isFollowing);
                    },
                    className: `px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                      user.isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`
                  },
                  user.isFollowing ? 'フォロー中' : 'フォロー'
                )
              )
            )
          )
    )
  );
};

// グローバルスコープに追加
window.SearchPage = SearchPage;
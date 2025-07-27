// 認証フォームコンポーネント
const AuthForm = ({ isLogin, authData, setAuthData, setIsLogin, onLogin, onRegister, onClose }) => {
  return React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-blue-600 flex items-center justify-center p-4",
    },
    React.createElement(
      "div",
      { className: "bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold mb-4 text-center" },
        isLogin ? "ログイン" : "新規登録"
      ),
      React.createElement(
        "div",
        { className: "space-y-3" },
        React.createElement("input", {
          type: "email",
          value: authData.email,
          onChange: (e) =>
            setAuthData({ ...authData, email: e.target.value }),
          className: "w-full p-3 border rounded-lg",
          placeholder: "メールアドレス",
        }),
        React.createElement("input", {
          type: "password",
          value: authData.password,
          onChange: (e) =>
            setAuthData({ ...authData, password: e.target.value }),
          className: "w-full p-3 border rounded-lg",
          placeholder: "パスワード",
        }),
        !isLogin &&
          React.createElement("input", {
            type: "text",
            value: authData.username,
            onChange: (e) =>
              setAuthData({ ...authData, username: e.target.value }),
            className: "w-full p-3 border rounded-lg",
            placeholder: "ユーザー名",
            maxLength: 10,
          }),
        React.createElement(
          "button",
          {
            onClick: isLogin ? onLogin : onRegister,
            className:
              "w-full bg-blue-600 text-white rounded-lg py-3 font-semibold",
          },
          isLogin ? "ログイン" : "登録"
        ),
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "button",
            {
              onClick: () => setIsLogin(!isLogin),
              className: "text-blue-600 text-sm",
            },
            isLogin ? "新規登録はこちら" : "ログインはこちら"
          )
        ),
        React.createElement(
          "button",
          {
            onClick: onClose,
            className: "w-full text-gray-500 text-sm",
          },
          "あとでログイン"
        )
      )
    )
  );
};
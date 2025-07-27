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
const ExerciseBlock = ({ ex }) =>
  React.createElement(
    "div",
    {
      className:
        "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-2",
    },
    React.createElement(
      "div",
      { className: "flex items-center space-x-2 mb-2" },
      React.createElement(Dumbbell, { className: "h-4 w-4 text-blue-600" }),
      React.createElement("span", { className: "font-semibold" }, ex.exercise)
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
                { className: "font-medium text-gray-600 w-16" },
                `${index + 1}セット:`
              ),
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
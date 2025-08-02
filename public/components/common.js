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
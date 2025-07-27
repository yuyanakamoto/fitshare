// ワークアウトフォームコンポーネント
const WorkoutForm = ({ 
  formData, 
  setFormData, 
  exercises, 
  showCustomInput, 
  setShowCustomInput,
  editingPost,
  selectedImage,
  onImageSelect,
  onSubmit,
  onUpdate,
  onCancel,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onCopyPreviousWeight
}) => {
  return React.createElement(
    "div",
    { className: "bg-white rounded-xl shadow-lg p-4 mb-4" },
    React.createElement(
      "h2",
      { className: "text-lg font-bold mb-3" },
      editingPost ? "トレーニング編集" : "トレーニング記録"
    ),
    React.createElement(
      "div",
      { className: "space-y-3" },
      // 投稿日指定
      React.createElement(
        "div",
        {},
        React.createElement(
          "label",
          {
            className:
              "block text-sm font-medium mb-1 flex items-center",
          },
          React.createElement(Calendar, {
            className: "h-4 w-4 mr-1",
          }),
          "トレーニング日"
        ),
        React.createElement("input", {
          type: "date",
          value: formData.workoutDate,
          onChange: (e) =>
            setFormData({ ...formData, workoutDate: e.target.value }),
          max: new Date().toISOString().split("T")[0],
          className: "w-full p-3 border rounded-lg text-base",
        })
      ),

      // 複数種目入力
      React.createElement(
        "div",
        { className: "space-y-4" },
        formData.exercises.map((exerciseData, exerciseIndex) =>
          React.createElement(
            "div",
            {
              key: exerciseIndex,
              className:
                "border border-gray-200 rounded-lg p-3 bg-gray-50",
            },
            // 種目ヘッダー
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-3" },
              React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                React.createElement(
                  "span",
                  { className: "text-sm font-bold text-gray-600" },
                  `種目 ${exerciseIndex + 1}`
                ),
                formData.exercises.length > 1 &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => onRemoveExercise(exerciseIndex),
                      className: "text-red-500 hover:text-red-700",
                    },
                    React.createElement(Trash, {
                      className: "h-4 w-4",
                    })
                  )
              )
            ),

            // 種目選択
            React.createElement(
              "select",
              {
                value: showCustomInput[exerciseIndex]
                  ? "その他（自由入力）"
                  : exerciseData.exercise,
                onChange: (e) =>
                  onUpdateExercise(exerciseIndex, e.target.value),
                className:
                  "w-full p-2 border rounded-lg text-base mb-3",
                required: true,
              },
              React.createElement(
                "option",
                { value: "" },
                "種目を選択"
              ),
              exercises.map((ex) =>
                React.createElement(
                  "option",
                  { key: ex, value: ex },
                  ex
                )
              ),
              React.createElement(
                "option",
                { value: "その他（自由入力）" },
                "その他（自由入力）"
              )
            ),

            // カスタム種目入力欄
            showCustomInput[exerciseIndex] &&
              React.createElement("input", {
                type: "text",
                value: exerciseData.exercise,
                onChange: (e) => {
                  const newExercises = [...formData.exercises];
                  newExercises[exerciseIndex].exercise = e.target.value;
                  setFormData({
                    ...formData,
                    exercises: newExercises,
                  });
                },
                className:
                  "w-full p-2 border rounded-lg text-base mb-3",
                placeholder: "種目名を入力",
                required: true,
              }),

            // セット入力
            React.createElement(
              "div",
              { className: "space-y-2" },
              exerciseData.sets.map((set, setIndex) =>
                React.createElement(
                  "div",
                  {
                    key: setIndex,
                    className: "flex items-center space-x-2",
                  },
                  React.createElement(
                    "span",
                    { className: "text-sm w-12" },
                    `${setIndex + 1}セット`
                  ),
                  React.createElement("input", {
                    type: "number",
                    inputMode: "numeric",
                    value: set.weight,
                    onChange: (e) =>
                      onUpdateSet(
                        exerciseIndex,
                        setIndex,
                        "weight",
                        e.target.value
                      ),
                    onFocus: () =>
                      setIndex > 0 &&
                      !set.weight &&
                      onCopyPreviousWeight(exerciseIndex, setIndex),
                    className:
                      "w-20 p-2 border rounded-lg text-base text-center",
                    placeholder: "重量",
                  }),
                  React.createElement(
                    "span",
                    { className: "text-sm" },
                    "kg ×"
                  ),
                  React.createElement("input", {
                    type: "number",
                    inputMode: "numeric",
                    value: set.reps,
                    onChange: (e) =>
                      onUpdateSet(
                        exerciseIndex,
                        setIndex,
                        "reps",
                        e.target.value
                      ),
                    className:
                      "w-20 p-2 border rounded-lg text-base text-center",
                    placeholder: "回数",
                  }),
                  React.createElement(
                    "span",
                    { className: "text-sm" },
                    "回"
                  ),
                  exerciseData.sets.length > 1 &&
                    React.createElement(
                      "button",
                      {
                        onClick: () =>
                          onRemoveSet(exerciseIndex, setIndex),
                        className: "p-1 text-red-500",
                      },
                      React.createElement(MinusCircle, {
                        className: "h-5 w-5",
                      })
                    )
                )
              ),
              React.createElement(
                "button",
                {
                  onClick: () => onAddSet(exerciseIndex),
                  className:
                    "mt-2 flex items-center space-x-1 text-blue-600 text-sm",
                },
                React.createElement(PlusCircle, {
                  className: "h-4 w-4",
                }),
                React.createElement("span", {}, "セットを追加")
              )
            )
          )
        ),

        // 種目追加ボタン（編集時は非表示）
        !editingPost &&
          React.createElement(
            "button",
            {
              onClick: onAddExercise,
              className:
                "w-full mt-2 p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center space-x-2",
            },
            React.createElement(Plus, { className: "h-5 w-5" }),
            React.createElement("span", {}, "種目を追加")
          )
      ),

      // 画像アップロード（新規投稿時のみ）
      !editingPost &&
        React.createElement(
          "div",
          {},
          React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium mb-1 flex items-center",
            },
            React.createElement(Camera, {
              className: "h-4 w-4 mr-1",
            }),
            "写真（任意）"
          ),
          React.createElement("input", {
            type: "file",
            accept: "image/*",
            onChange: onImageSelect,
            className: "w-full p-2 border rounded-lg text-sm",
          }),
          selectedImage &&
            React.createElement(
              "p",
              { className: "text-sm text-gray-600 mt-1" },
              `選択: ${selectedImage.name}`
            )
        ),

      // コメント
      React.createElement(
        "div",
        {},
        React.createElement(
          "label",
          { className: "block text-sm font-medium mb-1" },
          "コメント"
        ),
        React.createElement("textarea", {
          value: formData.comment,
          onChange: (e) =>
            setFormData({ ...formData, comment: e.target.value }),
          className: "w-full p-3 border rounded-lg text-base",
          rows: "3",
          placeholder: "今日の調子、感想など...\n改行も使えます",
        })
      ),

      // ボタン
      React.createElement(
        "div",
        { className: "flex space-x-2" },
        React.createElement(
          "button",
          {
            onClick: editingPost ? onUpdate : onSubmit,
            className:
              "flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold active:bg-blue-700",
          },
          editingPost ? "更新" : "投稿"
        ),
        React.createElement(
          "button",
          {
            onClick: onCancel,
            className:
              "flex-1 bg-gray-300 text-gray-700 rounded-lg py-3 font-semibold active:bg-gray-400",
          },
          "キャンセル"
        )
      )
    )
  );
};
// ワークアウトフォームコンポーネント
const WorkoutForm = ({ 
  formData, 
  setFormData, 
  exercises, 
  showCustomInput, 
  setShowCustomInput,
  editingPost,
  selectedImage,
  posts,
  currentUser,
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
  onCopyPreviousWeight,
  onDeleteCustomExercise
}) => {
  
  // 指定した種目の最大総負荷を計算する関数
  const getMaxLoadForExercise = (exerciseName) => {
    if (!exerciseName || !posts || !currentUser || editingPost) {
      return null;
    }

    let maxLoad = 0;
    let maxSet = null;

    // 現在のユーザーの投稿のみをフィルタ
    const userPosts = posts.filter(post => {
      const postUserId = typeof post.userId === 'object' ? post.userId._id : post.userId;
      return postUserId === currentUser.id || post.user === currentUser.username;
    });

    userPosts.forEach(post => {
      // 新しい形式（複数種目対応）
      if (post.exercises && Array.isArray(post.exercises)) {
        post.exercises.forEach(exercise => {
          if (exercise.exercise === exerciseName && exercise.sets) {
            exercise.sets.forEach(set => {
              let load = 0;
              if (set.weight !== undefined && set.reps !== undefined) {
                // ウェイトトレーニング
                load = set.weight * set.reps;
              } else if (set.bodyweight !== undefined && set.reps !== undefined) {
                // 自重トレーニング
                load = set.bodyweight * set.reps;
              }
              
              if (load > maxLoad) {
                maxLoad = load;
                maxSet = set;
              }
            });
          }
        });
      }
      // 旧形式（単一種目）
      else if (post.exercise === exerciseName && post.sets) {
        post.sets.forEach(set => {
          let load = 0;
          if (set.weight !== undefined && set.reps !== undefined) {
            // ウェイトトレーニング
            load = set.weight * set.reps;
          } else if (set.bodyweight !== undefined && set.reps !== undefined) {
            // 自重トレーニング
            load = set.bodyweight * set.reps;
          }
          
          if (load > maxLoad) {
            maxLoad = load;
            maxSet = set;
          }
        });
      }
    });

    if (maxSet) {
      if (maxSet.weight !== undefined) {
        return { weight: maxSet.weight, reps: maxSet.reps };
      } else if (maxSet.bodyweight !== undefined) {
        return { bodyweight: maxSet.bodyweight, reps: maxSet.reps };
      }
    }
    return null;
  };
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

            // 種目選択（部位別）
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
              
              // 部位別にグループ化された種目
              window.exercisesByBodyPart && Object.entries(window.exercisesByBodyPart).map(([bodyPart, exerciseList]) => {
                const bodyPartEmojis = {
                  "胸": "🫁",
                  "背中": "🔙", 
                  "肩": "🤷",
                  "腕（上腕二頭筋）": "💪",
                  "腕（上腕三頭筋）": "🔱",
                  "脚（大腿四頭筋）": "🦵",
                  "脚（ハムストリング・臀部）": "🍑",
                  "脚（ふくらはぎ）": "🦶",
                  "腹筋・体幹": "🔥",
                  "有酸素運動": "🏃",
                  "自重トレーニング": "🤸"
                };
                return React.createElement(
                  "optgroup",
                  { key: bodyPart, label: `${bodyPartEmojis[bodyPart] || "💪"} ${bodyPart}` },
                  exerciseList.map((ex) =>
                    React.createElement(
                      "option",
                      { key: ex, value: ex },
                      ex
                    )
                  )
                );
              }),
              
              // カスタム種目（デフォルト種目以外）
              (() => {
                const customExercises = exercises.filter(ex => 
                  !window.defaultExercises?.includes(ex)
                );
                if (customExercises.length > 0) {
                  return React.createElement(
                    "optgroup",
                    { key: "custom", label: "🏷️ カスタム種目" },
                    customExercises.map((ex) =>
                      React.createElement(
                        "option",
                        { key: ex, value: ex },
                        ex
                      )
                    )
                  );
                }
                return null;
              })(),
              
              React.createElement(
                "optgroup",
                { key: "other", label: "➕ その他" },
                React.createElement(
                  "option",
                  { value: "その他（自由入力）" },
                  "新しい種目を追加"
                )
              )
            ),

            // 最大記録表示（種目選択時のみ、編集時は非表示）
            !showCustomInput[exerciseIndex] && exerciseData.exercise && exerciseData.exercise !== "" && !editingPost &&
              (() => {
                const maxRecord = getMaxLoadForExercise(exerciseData.exercise);
                if (maxRecord) {
                  return React.createElement(
                    "div",
                    { 
                      className: "text-xs text-gray-500 mb-2 px-1",
                      style: { fontSize: "12px" }
                    },
                    maxRecord.weight !== undefined 
                      ? `MAX: ${maxRecord.weight}kg×${maxRecord.reps}回`
                      : `MAX: ${maxRecord.bodyweight}kg×${maxRecord.reps}回（自重）`
                  );
                }
                return null;
              })(),

            // カスタム種目管理（選択された種目がカスタムの場合）
            exerciseData.exercise && 
            !window.defaultExercises.includes(exerciseData.exercise) &&
            exerciseData.exercise !== "" &&
              React.createElement(
                "div",
                { className: "mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg" },
                React.createElement(
                  "div",
                  { className: "flex items-center justify-between" },
                  React.createElement(
                    "span",
                    { className: "text-sm text-yellow-700" },
                    `🏷️ カスタム種目: ${exerciseData.exercise}`
                  ),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        if (onDeleteCustomExercise) {
                          onDeleteCustomExercise(exerciseData.exercise);
                          // 削除後、種目選択をリセット
                          onUpdateExercise(exerciseIndex, "");
                        }
                      },
                      className: "text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                    },
                    "🗑️ 削除"
                  )
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

            // セット入力（有酸素運動、自重トレーニング、ウェイトトレーニングで分岐）
            window.isCardioExercise && window.isCardioExercise(exerciseData.exercise) ?
              // 有酸素運動用の入力フィールド
              React.createElement(
                "div",
                { className: "space-y-3 bg-green-50 p-3 rounded-lg border border-green-200" },
                React.createElement(
                  "div",
                  { className: "text-sm font-medium text-green-700 mb-2" },
                  "有酸素運動"
                ),
                exerciseData.sets.map((set, setIndex) =>
                  React.createElement(
                    "div",
                    {
                      key: setIndex,
                      className: "space-y-3 border border-green-300 rounded-lg p-3 bg-white",
                    },
                    // セット番号とペース表示
                    React.createElement(
                      "div",
                      { className: "flex items-center justify-between" },
                      React.createElement(
                        "span",
                        { className: "text-sm font-medium text-green-700" },
                        `${setIndex + 1}回目`
                      ),
                      (() => {
                        const distance = parseFloat(set.distance || 0);
                        const timeString = set.time || "";
                        const totalMinutes = window.timeStringToMinutes ? window.timeStringToMinutes(timeString) : 0;
                        
                        if (distance > 0 && totalMinutes > 0) {
                          const pace = window.calculatePace ? window.calculatePace(distance, totalMinutes) : null;
                          if (pace) {
                            const paceMin = Math.floor(pace);
                            const paceSec = Math.round((pace - paceMin) * 60);
                            return React.createElement(
                              "span",
                              { className: "text-xs text-green-600 font-medium" },
                              `ペース: ${paceMin}:${paceSec.toString().padStart(2, '0')}/km`
                            );
                          }
                        }
                        return React.createElement(
                          "span",
                          { className: "text-xs text-gray-400" },
                          "ペース: --:--/km"
                        );
                      })()
                    ),
                    // 距離入力
                    React.createElement(
                      "div",
                      { className: "flex items-center space-x-2" },
                      React.createElement(
                        "span",
                        { className: "text-sm w-12 text-green-700" },
                        "距離"
                      ),
                      React.createElement("input", {
                        type: "number",
                        inputMode: "decimal",
                        step: "0.1",
                        value: set.distance || "",
                        onChange: (e) =>
                          onUpdateSet(
                            exerciseIndex,
                            setIndex,
                            "distance",
                            e.target.value
                          ),
                        className:
                          "flex-1 p-2 border rounded-lg text-base text-center",
                        placeholder: "0.0",
                      }),
                      React.createElement(
                        "span",
                        { className: "text-sm text-green-700" },
                        "km"
                      )
                    ),
                    // 時間入力
                    React.createElement(
                      "div",
                      { className: "flex items-center space-x-2" },
                      React.createElement(
                        "span",
                        { className: "text-sm w-12 text-green-700" },
                        "時間"
                      ),
                      React.createElement("input", {
                        type: "text",
                        value: set.time || "",
                        onChange: (e) =>
                          onUpdateSet(
                            exerciseIndex,
                            setIndex,
                            "time",
                            e.target.value
                          ),
                        className:
                          "flex-1 p-2 border rounded-lg text-base text-center",
                        placeholder: "0:00",
                        pattern: "\\d+:\\d{2}",
                      }),
                      React.createElement(
                        "span",
                        { className: "text-sm text-green-700" },
                        "分:秒"
                      )
                    ),
                    // 削除ボタン
                    exerciseData.sets.length > 1 &&
                      React.createElement(
                        "div",
                        { className: "flex justify-end" },
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              onRemoveSet(exerciseIndex, setIndex),
                            className: "p-1 text-red-500 hover:text-red-700",
                          },
                          React.createElement(MinusCircle, {
                            className: "h-5 w-5",
                          })
                        )
                      )
                  )
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => onAddSet(exerciseIndex),
                    className:
                      "mt-2 w-full flex items-center justify-center space-x-1 text-green-600 text-sm py-2 border border-green-300 rounded-lg hover:bg-green-50",
                  },
                  React.createElement(PlusCircle, {
                    className: "h-4 w-4",
                  }),
                  React.createElement("span", {}, "記録を追加")
                )
              )
            : window.isBodyweightExercise && window.isBodyweightExercise(exerciseData.exercise) ?
              // 自重トレーニング用の入力フィールド
              React.createElement(
                "div",
                { className: "space-y-3 bg-orange-50 p-3 rounded-lg border border-orange-200" },
                React.createElement(
                  "div",
                  { className: "text-sm font-medium text-orange-700 mb-2" },
                  "自重トレーニング"
                ),
                exerciseData.sets.map((set, setIndex) =>
                  React.createElement(
                    "div",
                    {
                      key: setIndex,
                      className: "space-y-3 border border-orange-300 rounded-lg p-3 bg-white",
                    },
                    // セット番号
                    React.createElement(
                      "div",
                      { className: "flex items-center justify-between" },
                      React.createElement(
                        "span",
                        { className: "text-sm font-medium text-orange-700" },
                        `${setIndex + 1}セット目`
                      )
                    ),
                    // 体重入力（自重の場合は体重を記録）
                    React.createElement(
                      "div",
                      { className: "flex items-center space-x-2" },
                      React.createElement(
                        "span",
                        { className: "text-sm w-12 text-orange-700" },
                        "体重"
                      ),
                      React.createElement("input", {
                        type: "number",
                        inputMode: "decimal",
                        step: "0.1",
                        value: set.bodyweight || "",
                        onChange: (e) =>
                          onUpdateSet(
                            exerciseIndex,
                            setIndex,
                            "bodyweight",
                            e.target.value
                          ),
                        className:
                          "flex-1 p-2 border rounded-lg text-base text-center",
                        placeholder: "60.0",
                      }),
                      React.createElement(
                        "span",
                        { className: "text-sm text-orange-700" },
                        "kg"
                      )
                    ),
                    // 回数入力
                    React.createElement(
                      "div",
                      { className: "flex items-center space-x-2" },
                      React.createElement(
                        "span",
                        { className: "text-sm w-12 text-orange-700" },
                        "回数"
                      ),
                      React.createElement("input", {
                        type: "number",
                        inputMode: "numeric",
                        value: set.reps || "",
                        onChange: (e) =>
                          onUpdateSet(
                            exerciseIndex,
                            setIndex,
                            "reps",
                            e.target.value
                          ),
                        className:
                          "flex-1 p-2 border rounded-lg text-base text-center",
                        placeholder: "10",
                      }),
                      React.createElement(
                        "span",
                        { className: "text-sm text-orange-700" },
                        "回"
                      )
                    ),
                    // 削除ボタン
                    exerciseData.sets.length > 1 &&
                      React.createElement(
                        "div",
                        { className: "flex justify-end" },
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              onRemoveSet(exerciseIndex, setIndex),
                            className: "p-1 text-red-500 hover:text-red-700",
                          },
                          React.createElement(MinusCircle, {
                            className: "h-5 w-5",
                          })
                        )
                      )
                  )
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => onAddSet(exerciseIndex),
                    className:
                      "mt-2 w-full flex items-center justify-center space-x-1 text-orange-600 text-sm py-2 border border-orange-300 rounded-lg hover:bg-orange-50",
                  },
                  React.createElement(PlusCircle, {
                    className: "h-4 w-4",
                  }),
                  React.createElement("span", {}, "セットを追加")
                )
              )
            :
              // ウェイトトレーニング用の入力フィールド（従来通り）
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
                      inputMode: "decimal",
                      step: "0.1",
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

      // 画像アップロード
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
          editingPost ? "写真を変更（任意）" : "写真（任意）"
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
          ),
        editingPost && editingPost.image && !selectedImage &&
          React.createElement(
            "div",
            { className: "mt-2" },
            React.createElement(
              "p",
              { className: "text-sm text-gray-600 mb-1" },
              "現在の画像:"
            ),
            React.createElement("img", {
              src: editingPost.image,
              alt: "現在の画像",
              className: "w-32 h-32 object-cover rounded-lg border",
            })
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
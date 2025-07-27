// ユーティリティ関数

// タイムスタンプのフォーマット
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return date.toLocaleDateString("ja-JP");
};

// デフォルトの種目リスト
const defaultExercises = [
  "ベンチプレス",
  "スクワット",
  "デッドリフト",
  "ショルダープレス",
  "ラットプルダウン",
  "バーベルカール",
  "レッグプレス",
  "チェストフライ",
  "プルアップ",
  "ディップス",
  "ダンベルフライ",
  "レッグカール",
  "カーフレイズ",
  "アームカール",
  "トライセプスエクステンション",
];

// グローバルにアクセス可能にする
window.defaultExercises = defaultExercises;
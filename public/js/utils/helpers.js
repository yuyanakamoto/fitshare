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

// 画像URLを正しく構築する関数
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // 既に完全なURLの場合はそのまま返す
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // 相対パスの場合は、先頭のスラッシュを除去してから結合
  const cleanPath = imagePath.startsWith("/") ? imagePath : "/" + imagePath;
  return `${window.location.origin}${cleanPath}`;
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
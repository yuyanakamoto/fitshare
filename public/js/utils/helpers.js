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

// 部位別種目リスト
const exercisesByBodyPart = {
  "胸": [
    "ベンチプレス",
    "チェストプレス", 
    "ダンベルプレス",
    "インクラインベンチプレス",
    "インクラインダンベルプレス",
    "チェストフライ",
    "ダンベルフライ",
    "ペックフライ",
    "ディップス",
    "プッシュアップ",
    "スミスインクラインプレス"
  ],
  "背中": [
    "ラットプルダウン",
    "デッドリフト",
    "プルアップ",
    "マシンローイング",
    "シーテッドロー",
    "ベントオーバーロー",
    "ワンハンドロー",
    "チンアップ",
    "ケーブルロー",
    "T-バーロー"
  ],
  "肩": [
    "サイドレイズ",
    "ショルダープレス",
    "ダンベルショルダープレス",
    "リアレイズ",
    "フロントレイズ",
    "アップライトロー",
    "シュラッグ",
    "アーノルドプレス"
  ],
  "腕（上腕二頭筋）": [
    "バーベルカール",
    "ダンベルカール",
    "ハンマーカール",
    "プリーチャーカール",
    "インクラインDBカール",
    "コンセントレーションカール",
    "バイセップカール",
    "アームカール"
  ],
  "腕（上腕三頭筋）": [
    "トライセプスエクステンション",
    "ダンベルトライセプスエクステンション",
    "オーバーヘッドエクステンション",
    "キックバック",
    "ナローグリップベンチプレス",
    "ディップス"
  ],
  "脚（大腿四頭筋）": [
    "スクワット",
    "レッグプレス",
    "レッグエクステンション",
    "ハックスクワット",
    "ブルガリアンスクワット",
    "スミススクワット",
    "フロントスクワット"
  ],
  "脚（ハムストリング・臀部）": [
    "デッドリフト",
    "ルーマニアンデッドリフト",
    "レッグカール",
    "スティッフレッグデッドリフト",
    "ヒップスラスト",
    "グッドモーニング"
  ],
  "脚（ふくらはぎ）": [
    "カーフレイズ",
    "シーテッドカーフレイズ",
    "ドンキーカーフレイズ",
    "スタンディングカーフレイズ"
  ],
  "腹筋・体幹": [
    "クランチ",
    "シットアップ",
    "プランク",
    "サイドプランク",
    "レッグレイズ",
    "バイシクルクランチ",
    "ロシアンツイスト",
    "アブドミナルクランチ",
    "マウンテンクライマー"
  ],
  "有酸素運動": [
    "ランニング",
    "ウォーキング",
    "サイクリング",
    "エアロバイク",
    "トレッドミル",
    "エリプティカル",
    "ステップマシン",
    "ローイングマシン"
  ]
};

// 旧形式との互換性を保つため、フラットなリストも作成
const defaultExercises = Object.values(exercisesByBodyPart).flat();

// グローバルにアクセス可能にする
window.defaultExercises = defaultExercises;
window.exercisesByBodyPart = exercisesByBodyPart;
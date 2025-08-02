// ユーティリティ関数

// タイムスタンプのフォーマット（日本時間ベース修正版）
const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    
    // 無効な日付チェック
    if (isNaN(date.getTime()) || isNaN(now.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return '時刻不明';
    }
  
  // 🔧 修正：日本時間の数値で直接計算
  // new Date().getTime() は常にUTC基準のミリ秒を返すので、
  // 日本時間として解釈し直す必要がある
  
  // より確実な方法：日本時間のタイムスタンプを直接計算
  const japanOffset = 9 * 60 * 60 * 1000; // 日本は UTC+9
  const nowJST = new Date(now.getTime() + japanOffset);
  const dateJST = new Date(date.getTime() + japanOffset);
  
  // 日本時間ベースで時差を計算
  const diff = nowJST - dateJST;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  console.log('🔧 修正後の時差計算:', {
    nowUTC: now.toISOString(),
    dateUTC: date.toISOString(),
    nowJST: nowJST.toISOString(),
    dateJST: dateJST.toISOString(),
    diff_minutes: minutes,
    diff_hours: hours
  });

  // 相対時間表示（日本時間ベース）
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  // 古い投稿は日本時間で日時表示
  try {
    const japanTimeString = date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // フォーマットを統一 (YYYY/M/D HH:MM)
    const formatted = japanTimeString.replace(/(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{2}):(\d{2}).*/, '$1/$2/$3 $4:$5');
    return formatted;
  } catch (error) {
    // フォールバック: 手動で日本時間計算
    const japanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const year = japanDate.getUTCFullYear();
    const month = japanDate.getUTCMonth() + 1;
    const day = japanDate.getUTCDate();
    const hour = japanDate.getUTCHours().toString().padStart(2, '0');
    const minute = japanDate.getUTCMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}`;
  }
  } catch (error) {
    console.error('formatTimestamp error:', error, 'timestamp:', timestamp);
    return '時刻エラー';
  }
};

// グローバルにアクセス可能にする
window.formatTimestamp = formatTimestamp;

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
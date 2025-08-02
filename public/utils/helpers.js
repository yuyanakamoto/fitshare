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
    "インクラインダンベルプレス",
    "チェストフライ",
    "ペックフライ",
    "スミスインクラインプレス"
  ],
  "背中": [
    "デッドリフト",
    "ラットプルダウン",
    "デッドリフト",
    "シーテッドロー",
    "チンニング",
  ],
  "肩": [
    "サイドレイズ",
    "ショルダープレス",
    "ダンベルショルダープレス",
    "リアレイズ",
    "フロントレイズ",
    "アップライトロー",
    "スミスマシンショルダープレス"
  ],
  "腕（上腕二頭筋）": [
    "バーベルカール",
    "ダンベルカール",
    "ハンマーカール",
    "インクラインダンベルカール",
  ],
  "腕（上腕三頭筋）": [
    "トライセプスエクステンション",
    "ダンベルトライセプスエクステンション",
    "キックバック",
    "ナローグリップベンチプレス",
  ],
  "脚": [
    "スクワット",
    "レッグプレス",
    "レッグエクステンション",
    "レッグカール",
    "カーフレイズ"
  ],
  "腹筋・体幹": [
    "レッグレイズ",
    "アブドミナルクランチ",
  ],
  "有酸素運動": [
    "ランニング",
    "ウォーキング",
    "エアロバイク",
  ]
};

// 旧形式との互換性を保つため、フラットなリストも作成
const defaultExercises = Object.values(exercisesByBodyPart).flat();

// 有酸素運動かどうかを判定する関数
const isCardioExercise = (exerciseName) => {
  return exercisesByBodyPart["有酸素運動"].includes(exerciseName);
};

// ペース（分/km）を計算する関数
const calculatePace = (distanceKm, timeMinutes) => {
  if (!distanceKm || !timeMinutes || distanceKm <= 0 || timeMinutes <= 0) {
    return null;
  }
  return timeMinutes / distanceKm;
};

// 時間を「分:秒」形式から分数に変換する関数
const timeStringToMinutes = (timeString) => {
  if (!timeString) return 0;
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  return minutes + (seconds / 60);
};

// 分数を「分:秒」形式に変換する関数
const minutesToTimeString = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return "0:00";
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// グローバルにアクセス可能にする
window.defaultExercises = defaultExercises;
window.exercisesByBodyPart = exercisesByBodyPart;
window.isCardioExercise = isCardioExercise;
window.calculatePace = calculatePace;
window.timeStringToMinutes = timeStringToMinutes;
window.minutesToTimeString = minutesToTimeString;
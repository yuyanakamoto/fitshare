# 📸 FitShare - Cloudinary画像アップロード設定手順書

## 🎯 概要
この手順書では、FitShareアプリでデプロイ時に画像が消失する問題を解決するため、Cloudinaryクラウドストレージサービスの設定方法を詳しく説明します。

## 🚀 なぜCloudinaryが必要か？

### 問題の背景
- **現在の状況**: 画像はローカルの`uploads/`フォルダに保存
- **問題**: Render.comは**エフェメラルファイルシステム**を使用
- **結果**: デプロイ時にアップロードした画像がすべて消失

### Cloudinaryの利点
✅ **永続的ストレージ** - デプロイ時に画像が消失しない  
✅ **CDN配信** - 世界中で高速な画像読み込み  
✅ **自動最適化** - 画像サイズ・品質の自動調整  
✅ **無料枠** - 月間25,000変換まで無料  
✅ **簡単統合** - 既存コードへの影響最小限  

---

## 📋 STEP 1: Cloudinaryアカウントの作成

### 1.1 アカウント登録
1. [Cloudinary公式サイト](https://cloudinary.com/)にアクセス
2. 「Sign Up Free」をクリック
3. 以下の情報を入力：
   - **Email**: あなたのメールアドレス
   - **Password**: 強力なパスワード
   - **Cloud Name**: `fitshare-[あなたの名前]` （例：`fitshare-yuya`）
   - **Company**: 個人の場合は「Personal」
4. 「Create Account」をクリック
5. メール認証を完了

### 1.2 ダッシュボードへのアクセス
1. ログイン後、ダッシュボードが表示される
2. 左サイドバーの「Dashboard」をクリック
3. **Account Details**セクションを確認

---

## 📊 STEP 2: API認証情報の取得

### 2.1 認証情報の確認
ダッシュボードの**Account Details**セクションで以下の情報を確認：

```
Product Environment Credentials
┌─────────────────────────────────────────┐
│ Cloud name: your-cloud-name             │
│ API Key:    123456789012345             │
│ API Secret: abcdefghijklmnopqrstuvwxyz  │
└─────────────────────────────────────────┘
```

### 2.2 情報のコピー
以下の3つの値をメモ帳などに安全にコピー：
- **Cloud Name**: `your-cloud-name`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz`

⚠️ **重要**: API Secretは他人に見せないでください

---

## 🔧 STEP 3: Render.com環境変数の設定

### 3.1 Render.comダッシュボードにアクセス
1. [Render.com](https://render.com/)にログイン
2. **FitShare**プロジェクトを選択
3. 左サイドバーの「Environment」をクリック

### 3.2 環境変数の追加
「Add Environment Variable」ボタンをクリックし、以下の3つを順番に追加：

#### 3.2.1 Cloud Name設定
```
Key:   CLOUDINARY_CLOUD_NAME
Value: your-cloud-name
```
（STEP 2でコピーしたCloud Name）

#### 3.2.2 API Key設定
```
Key:   CLOUDINARY_API_KEY  
Value: 123456789012345
```
（STEP 2でコピーしたAPI Key）

#### 3.2.3 API Secret設定
```
Key:   CLOUDINARY_API_SECRET
Value: abcdefghijklmnopqrstuvwxyz
```
（STEP 2でコピーしたAPI Secret）

### 3.3 設定の保存
1. 各環境変数を追加後、「Save Changes」をクリック
2. 設定が正しく保存されたことを確認

---

## 🚀 STEP 4: アプリケーションのデプロイ

### 4.1 手動デプロイの実行
1. Render.comダッシュボードで「Manual Deploy」をクリック
2. 「Deploy latest commit」を選択
3. デプロイの完了を待機

### 4.2 デプロイログの確認
デプロイログで以下のメッセージが表示されることを確認：
```
==> Installing dependencies...
✓ cloudinary@1.41.3
✓ multer-storage-cloudinary@4.0.0

==> Starting server...
=====================================
FitShare バックエンドサーバー
=====================================
ポート: 10000
環境: production
MongoDB: 接続待機中...
URL: https://fitshare.onrender.com
=====================================
```

---

## ✅ STEP 5: 動作確認

### 5.1 画像アップロードテスト
1. FitShareアプリ（https://fitshare.onrender.com）にアクセス
2. ログインまたは新規登録
3. 新しいワークアウトを投稿し、画像をアップロード
4. 投稿が正常に表示されることを確認

### 5.2 Cloudinaryダッシュボードで確認
1. Cloudinaryダッシュボードにアクセス
2. 左サイドバーの「Media Library」をクリック
3. `fitshare`フォルダにアップロードした画像があることを確認

### 5.3 永続性テスト
1. Render.comで再度手動デプロイを実行
2. デプロイ完了後、過去にアップロードした画像が引き続き表示されることを確認

---

## 🔧 STEP 6: 設定のトラブルシューティング

### 6.1 よくある問題と解決策

#### 問題1: 「Cloudinary configuration error」
**原因**: 環境変数が正しく設定されていない
**解決策**:
1. Render.comの環境変数設定を再確認
2. Cloud Name、API Key、API Secretが正確であることを確認
3. 設定後に再デプロイを実行

#### 問題2: 画像アップロードエラー
**原因**: Cloudinaryの無料枠制限に達している
**解決策**:
1. Cloudinaryダッシュボードで使用量を確認
2. 必要に応じて古い画像を削除
3. または有料プランへアップグレード

#### 問題3: 画像の読み込みが遅い
**原因**: 画像サイズが大きすぎる
**解決策**:
自動最適化が設定済みですが、アップロード前にサイズを確認

### 6.2 ログの確認方法
Render.comでエラーが発生した場合：
1. Render.comダッシュボードの「Logs」タブを確認
2. エラーメッセージをコピーしてサポートに連絡

---

## 📊 STEP 7: 使用量の監視

### 7.1 Cloudinary使用量の確認
1. Cloudinaryダッシュボードの「Usage」セクションを定期的に確認
2. 無料枠の範囲内（月間25,000変換）で運用

### 7.2 使用量アラートの設定
1. Cloudinaryダッシュボードの「Settings」→「Notifications」
2. 使用量が80%に達したときのアラートを設定

---

## 🔒 STEP 8: セキュリティ設定

### 8.1 Upload Presetsの設定（推奨）
より高いセキュリティのため：
1. Cloudinaryダッシュボードの「Settings」→「Upload」
2. 「Add upload preset」をクリック
3. 以下の設定を適用：
   - **Mode**: Unsigned
   - **Folder**: fitshare
   - **Format**: Auto
   - **Quality**: Auto
   - **Max file size**: 15MB

### 8.2 URL署名の有効化
1. 「Settings」→「Security」
2. 「Strict transformations」を有効化
3. 不正なURL操作を防止

---

## 📈 STEP 9: パフォーマンス最適化

### 9.1 自動最適化の確認
現在の設定では以下が自動適用されます：
- **サイズ制限**: 1200x1200px
- **品質**: 自動最適化
- **形式**: WebP対応ブラウザでは自動変換

### 9.2 追加の最適化（オプション）
さらなる最適化が必要な場合：
1. Cloudinaryダッシュボードの「Optimization」セクション
2. 「Auto optimization」を有効化
3. 「Responsive images」を設定

---

## 📝 完了チェックリスト

設定完了の確認に以下をチェック：

- [ ] Cloudinaryアカウントが作成済み
- [ ] Cloud Name、API Key、API Secretを取得
- [ ] Render.comで3つの環境変数を設定
- [ ] アプリケーションが正常にデプロイされた
- [ ] 画像アップロードが正常に動作
- [ ] Cloudinary Media Libraryに画像が保存されている
- [ ] 再デプロイ後も画像が表示される

---

## 🆘 サポート

### 問題が解決しない場合
1. この手順書を最初から再確認
2. Render.comのログを確認
3. Cloudinaryのステータスページを確認
4. 必要に応じて開発者に連絡

### 参考リンク
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Render.com Environment Variables](https://render.com/docs/environment-variables)
- [multer-storage-cloudinary GitHub](https://github.com/affanshahid/multer-storage-cloudinary)

---

**🎉 設定完了！**  
これでFitShareアプリの画像はクラウドに永続的に保存され、デプロイ時に消失することはありません。
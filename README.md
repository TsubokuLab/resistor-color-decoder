# 抵抗カラーコード デコーダー

抵抗のカラーバンドを **クリックして色を変えるだけ** で抵抗値が計算できる、直感的でデザイン性の高い Web ツールです。
おまけに **LED の電流制限抵抗** も計算できます。

![type:静的サイト](https://img.shields.io/badge/build-none-brightgreen) ![lang:日本語](https://img.shields.io/badge/lang-日本語-blue)

## ✨ 特徴

- 🎨 **クリックで色変更** — 抵抗のグラフィックの各バンドをクリックしてカラーパレットから色を選ぶだけ
- 🔢 **4 / 5 / 6 本帯に対応** — プルダウンで切り替え（数字バンド・乗数・許容差・温度係数）
- ⚡ **リアルタイム計算** — 抵抗値・許容差・誤差範囲・E系列（E12/E24）を即時表示
- 💡 **LED 電流制限抵抗の計算** — 電源電圧・LED順方向電圧・希望電流から必要な抵抗値、最も近いE24標準値、消費電力、推奨ワット数を算出
- 🌙 洗練されたダークテーマ UI（ビルド不要の素の HTML/CSS/JS）

## 🚀 使い方

### ローカルで開く

```bash
# リポジトリのルートで
python3 -m http.server 8000
# → http://localhost:8000 を開く
```

もしくは `index.html` をブラウザで直接開くだけでも動作します。

### 公開（GitHub Pages）

`main` ブランチに push すると、GitHub Actions（`.github/workflows/deploy.yml`）が
自動で GitHub Pages にデプロイします。

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を
**「GitHub Actions」** に設定してください。

## 🧮 計算ロジック

### 抵抗値

| バンド | 役割 |
| --- | --- |
| 4本帯 | 数字, 数字, 乗数, 許容差 |
| 5本帯 | 数字, 数字, 数字, 乗数, 許容差 |
| 6本帯 | 数字, 数字, 数字, 乗数, 許容差, 温度係数 |

```
抵抗値 = (数字を並べた値) × 乗数
```

### LED 電流制限抵抗

```
R = (V_S − V_F) / I_F          必要な抵抗値
P = (V_S − V_F) × I_F          抵抗での消費電力
```

例: 5V 電源から 3V / 100mA の LED を駆動 → R = (5 − 3) / 0.1 = **20Ω**、P = 0.2W

## 📁 構成

```
.
├── index.html        # マークアップ
├── styles.css        # スタイル
├── script.js         # 計算・UI ロジック
└── .github/workflows/deploy.yml  # GitHub Pages 自動デプロイ
```

## 📜 ライセンス

MIT

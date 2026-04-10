# 🔮 Visual English - Stop Translating. Start Visualizing.

Visual English 是一個現代化、直覺化的英語學習平台，旨在打破「翻譯思維」。我們透過圖片、AI 生成的情境以及感官連結，幫助學習者建立像母語人士一樣的「視覺反射」，跳過中文翻譯，直接將單字與現實世界連結。

---

## 🚀 核心理念 (Core Concepts)

- **視覺反射 (Visual Reflex)**：直接建立大腦與圖像的連結，徹底消除「中文轉譯」的門檻。
- **情境感官 (Scenario & Emotion)**：利用 AI 生成的情境故事與情感連結，強化長期記憶。
- **感官整合 (Sensory Integration)**：結合完美的發音 (音)、單字拼寫 (形) 與視覺圖像 (意)。

---

## ✨ 主要功能 (Features)

- **視覺化搜尋 (Visualize Search)**：輸入單字，直接呈現定義該單字的真實世界圖片。
- **多重語義支持 (Multi-Sense Support)**：完整呈現一個單字在不同情境下的多種意涵。
- **AI 情境生成 (AI-Powered Scenarios)**：透過 AI 自動生成描述單字用法的情境故事與聯想圖示。
- **個人化學習進度 (Progress Tracking)**：記錄已學單字、熟練度以及複習週期。
- **測驗系統 (Quiz System)**：自定義測驗與模擬測試，檢驗學習成果。
- **管理後台 (Admin Dashboard)**：強大的單字庫管理與使用者權限設定。

---

## 🛠️ 技術堆疊 (Tech Stack)

### Frontend & Framework
- **Next.js 15+ (App Router)**：提供卓越的效能與 SEO 優勢。
- **React 19**：使用最新的 React 特性與 Hooks。
- **Tailwind CSS 4**：打造精美、流暢且具備磨砂玻璃質感的 UI。

### Backend & Database
- **Prisma ORM**：強類型的資料庫操作介面。
- **PostgreSQL (Prisma Postgres)**：生產環境使用的高效能關聯式資料庫。
- **Next.js API Routes**：構建穩健的後端服務邏輯。

### Security & AI
- **JWT / Jose**：安全的身份驗證機制。
- **Bcryptjs**：密碼加密存儲。
- **Unsplash API / ComfyUI Integration**：獲取高品質圖片與 AI 生成內容。

---

## 📦 快速開始 (Quick Start)

### 1. 複製專案
```bash
git clone https://github.com/lenogwan/visual-english.git
cd visual-english
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境設定
建立 `.env` 檔案並設定以下變數：
```env
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
# 其他 API 密鑰如 UNSPLASH_ACCESS_KEY 等
```

### 4. 資料庫初始化
```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. 啟動開發伺服器
```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可開始體驗！

---

## 🚀 雲端部署與資料庫初始化 (Production)

本專案支援在 Vercel 部署並使用 **PostgreSQL** 作為雲端資料庫。

### 1. 同步資料庫結構
在本地終端機執行，將 Prisma Schema 推送到雲端資料庫：
```bash
$env:PRISMA_DATABASE_URL="your_postgres_url"; npx prisma db push
```

### 2. 初始化雲端管理員 (Admin Setup)
部署後如果資料庫是空的，可透過本地執行以下指令來建立管理員帳號：

**PowerShell:**
```powershell
$env:NODE_ENV="production"; $env:PRISMA_DATABASE_URL="your_postgres_url"; npm run db:init-admin
```

**Bash / Linux / Mac:**
```bash
NODE_ENV=production PRISMA_DATABASE_URL="your_postgres_url" npm run db:init-admin
```

- **預設帳號**: `admin@visual-english.com`
- **預設密碼**: `admin123`
*(登入後請務必修改密碼)*

---

## 📂 專案結構 (Project Structure)

- `app/`：Next.js App Router 路由與頁面元件。
- `components/`：可重複使用的 UI 元件 (如 WordCard, Dashboard)。
- `lib/`：共享的工具函式、資料庫配置與驗證邏輯。
- `prisma/`：資料庫 Schema 定義與遷移腳本。
- `scripts/`：資料維護、導入與檢查腳本。

---

## 🤝 貢獻指南

歡迎任何形式的 Pull Request 或 Issue 回饋！讓我們一起打造更好的英語學習環境。

---

## 📄 授權協議

本專案採用 [MIT License](LICENSE)。

# 🎨 Fitness Tracker - Design System

## 設計理念

### 核心原則
1. **簡潔優雅** - 白色為主，減少視覺噪音
2. **專業可信** - 醫療級 UI 設計語言
3. **易用性** - 大按鈕、清晰層級、直觀操作
4. **現代感** - 柔和陰影、圓角、漸變
5. **響應式** - 手機優先，多設備適配

---

## 🎨 色彩系統

### 主色調（Primary）
```
Primary 50:  #f0f9ff (淺藍背景)
Primary 100: #e0f2fe (卡片背景)
Primary 500: #0ea5e9 (主要按鈕)
Primary 600: #0284c7 (按鈕 hover)
Primary 700: #0369a1 (深色強調)
```

### 功能色
```
Success 50:  #f0fdf4 (成功背景)
Success 500: #22c55e (成功狀態)
Success 600: #16a34a (成功 hover)

Warning 50:  #fffbeb (警告背景)
Warning 500: #f59e0b (警告狀態)

Danger 50:   #fef2f2 (錯誤背景)
Danger 500:  #ef4444 (錯誤狀態)
```

### 中性色
```
Gray 50:  #f9fafb (頁面背景)
Gray 100: #f3f4f6 (卡片邊框)
Gray 200: #e5e7eb (分隔線)
Gray 500: #6b7280 (次要文字)
Gray 900: #111827 (主要文字)
```

### 餐別色彩
```
早餐 🌅: Orange (橙色系)
午餐 ☀️: Yellow (黃色系)
晚餐 🌙: Indigo (靛藍系)
小食 🍎: Green (綠色系)
```

---

## 📐 間距系統

### 標準間距
```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
```

### 卡片內距
```
小卡片: p-4 (16px)
標準卡片: p-6 (24px)
大卡片: p-8 (32px)
```

---

## 🔤 字體系統

### 字體家族
```css
font-family: -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Helvetica Neue', 
             Arial, sans-serif;
```

### 字體大小
```
xs:   12px (0.75rem)  - 輔助文字
sm:   14px (0.875rem) - 次要文字
base: 16px (1rem)     - 正文
lg:   18px (1.125rem) - 小標題
xl:   20px (1.25rem)  - 標題
2xl:  24px (1.5rem)   - 大標題
3xl:  30px (1.875rem) - 頁面標題
4xl:  36px (2.25rem)  - 數據展示
```

### 字重
```
Regular:  400 - 正文
Medium:   500 - 次要標題
Semibold: 600 - 標題
Bold:     700 - 強調
```

---

## 🎯 組件設計

### 卡片 (Card)
```css
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.3s;
}

.card-hover:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.07);
  border-color: #e5e7eb;
  transform: translateY(-2px);
}
```

**使用場景:**
- 主要內容容器
- 功能區塊
- 統計卡片

### 按鈕 (Button)
```css
.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn:active {
  transform: scale(0.95);
}

.btn-primary {
  background: linear-gradient(to right, #0ea5e9, #0284c7);
  color: white;
  box-shadow: 0 4px 6px rgba(14,165,233,0.2);
}

.btn-primary:hover {
  box-shadow: 0 6px 12px rgba(14,165,233,0.3);
}
```

**按鈕尺寸:**
- 小按鈕: px-4 py-2 (手機次要操作)
- 標準: px-6 py-3 (桌面標準)
- 大按鈕: px-8 py-4 (主要 CTA)

### 輸入框 (Input)
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
}

.input:focus {
  border-color: #0ea5e9;
  ring: 4px solid #f0f9ff;
  outline: none;
}
```

### 統計卡片 (Stat Card)
```css
.stat-card {
  background: linear-gradient(to bottom right, from, to);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

**數據展示:**
- 數字: text-3xl font-bold (36px)
- 標籤: text-xs font-medium (12px)
- 單位: text-xs (12px)

---

## 🎭 動畫系統

### 過渡時間
```
Fast:     150ms - 按鈕、hover
Standard: 300ms - 卡片、彈窗
Slow:     500ms - 進度條、數據變化
```

### 緩動函數
```
ease-in-out: 標準過渡
ease-out:    進入動畫
ease-in:     退出動畫
```

### 關鍵動畫

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* 使用: animate-fade-in */
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
/* 使用: animate-slide-up */
```

#### Scale
```css
.scale-hover:hover {
  transform: scale(1.05);
}

.scale-active:active {
  transform: scale(0.95);
}
```

---

## 📱 響應式設計

### 斷點
```
sm:  640px  - 手機橫屏
md:  768px  - 平板
lg:  1024px - 桌面
xl:  1280px - 大桌面
```

### 手機優化
```
- 最小觸控區域: 44x44px
- 文字最小: 14px
- 行高: 1.5
- 間距: 16px 起
```

### 佈局策略
```
手機: 單列 (grid-cols-1)
平板: 雙列 (md:grid-cols-2)
桌面: 四列 (lg:grid-cols-4)
```

---

## 🎨 UI 模式

### 1. 餐別選擇
**設計:**
- 2x2 網格（手機）
- 4x1 網格（桌面）
- 大圖標 + 文字
- 選中狀態：彩色背景 + 邊框 + 縮放

**互動:**
- Hover: 陰影增強
- Active: 縮放 1.05
- Selected: 彩色背景

### 2. 上傳區域
**設計:**
- 虛線邊框
- 大圖標居中
- 清晰提示文字
- Drag & Drop 支援

**狀態:**
- Default: 灰色虛線
- Hover: 藍色虛線 + 淺藍背景
- Dragging: 藍色實線 + 藍色背景

### 3. 分析結果
**設計:**
- 食物名稱 + 信心度徽章
- 2x2 營養網格
- 漸變背景卡片
- 大數字 + 小標籤

**層級:**
1. 食物名稱（最重要）
2. 卡路里（次重要）
3. 其他營養（輔助）

### 4. 進度條
**設計:**
- 圓角背景
- 漸變填充
- 百分比標籤
- 平滑過渡

**顏色:**
- 0-50%: 綠色
- 50-80%: 黃色
- 80-100%: 橙色
- >100%: 紅色

---

## 🔍 可訪問性

### 對比度
```
文字 vs 背景: 最少 4.5:1
大文字 vs 背景: 最少 3:1
```

### 觸控目標
```
最小尺寸: 44x44px
間距: 8px
```

### 鍵盤導航
```
Tab: 焦點移動
Enter/Space: 激活
Esc: 關閉彈窗
```

---

## 📐 網格系統

### 容器
```
max-w-4xl: 896px (主要內容)
max-w-2xl: 672px (窄內容)
max-w-7xl: 1280px (寬內容)
```

### 間距
```
p-4:  16px (手機)
p-6:  24px (平板)
p-8:  32px (桌面)
```

---

## 🎯 最佳實踐

### DO ✅
- 使用白色為主色調
- 保持充足留白
- 使用柔和陰影
- 統一圓角 (12-16px)
- 清晰的視覺層級
- 一致的間距系統

### DON'T ❌
- 避免過多顏色
- 避免尖銳邊角
- 避免過重陰影
- 避免過小文字 (<14px)
- 避免過密佈局
- 避免不一致的樣式

---

## 📊 設計檢查清單

### 視覺
- [ ] 色彩對比度符合標準
- [ ] 字體大小適中
- [ ] 間距一致
- [ ] 圓角統一
- [ ] 陰影柔和

### 互動
- [ ] 按鈕有 hover 狀態
- [ ] 按鈕有 active 狀態
- [ ] 載入狀態清晰
- [ ] 錯誤提示友善
- [ ] 成功反饋明確

### 響應式
- [ ] 手機佈局正常
- [ ] 平板佈局正常
- [ ] 桌面佈局正常
- [ ] 觸控區域足夠大
- [ ] 文字可讀

### 效能
- [ ] 動畫流暢 (60fps)
- [ ] 圖片已優化
- [ ] 載入時間 < 3s
- [ ] 無佈局偏移

---

**設計工具:** Tailwind CSS 3.x  
**參考:** Apple Human Interface Guidelines, Material Design 3  
**更新日期:** 2026-03-06

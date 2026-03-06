# Fitness Tracker - Calomei-Style Features 🎉

## 📚 學習來源

**參考 App:** [CaLoMei - 卡老味](https://apps.apple.com/hk/app/calomei/id6759828348)

### Calomei 主要功能
- ✅ AI 食物掃描 - 影相自動辨認食物同計算營養
- ✅ 每日卡路里追蹤 - 蛋白質、碳水、脂肪一目了然
- ✅ AI 語氣評論 - 每次掃描完都會用廣東話寸你一句
- ✅ 體重追蹤 - 記錄體重變化睇下你有冇進步
- ✅ 香港地道食物資料庫 - 茶餐廳、車仔麵、燒味飯統統都有

---

## 🎯 新增功能

### 1️⃣ Edit Button（編輯按鈕）
**位置:** 分析結果右上角

**功能:**
- 點擊「✏️ 編輯」進入編輯模式
- 可以修改所有營養數據
- 確認或取消修改

**使用場景:**
- AI 識別唔準確
- 用戶食咗唔同份量
- 需要微調數據

### 2️⃣ Serving Size Adjuster（份量調整器）
**位置:** 編輯模式頂部

**快速調整:**
- **½ 份** - 所有營養減半
- **¾ 份** - 所有營養 × 0.75
- **1.5 份** - 所有營養 × 1.5
- **2 份** - 所有營養加倍

**自動計算:**
- 卡路里
- 蛋白質
- 碳水化合物
- 脂肪
- 纖維
- 糖分
- 鈉

**使用場景:**
- 食咗半碗飯
- 分享食物
- 食咗兩份
- 打包剩餘

### 3️⃣ More Nutrition Details（更多營養細節）
**新增顯示:**
- **纖維** (Fiber) - 紫色卡片
- **糖分** (Sugar) - 粉紅色卡片
- **鈉** (Sodium) - 灰色卡片

**原有顯示:**
- **卡路里** (Calories) - 綠色卡片
- **蛋白質** (Protein) - 藍色卡片
- **碳水化合物** (Carbs) - 橙色卡片
- **脂肪** (Fat) - 紅色卡片

**總共 7 項營養數據！**

### 4️⃣ Editable Fields（可編輯欄位）
**編輯模式下:**
- 所有營養數據都可以直接輸入修改
- 數字輸入框帶底線
- 即時更新顯示
- 支援手動微調

---

## 🎨 UI 設計

### 編輯模式
**視覺特徵:**
- 藍色背景框（份量調整器）
- 輸入框帶底線
- 綠色「✓ 確認修改」按鈕
- 灰色「✗ 取消」按鈕

### 顏色系統
| 營養素 | 顏色 | 用途 |
|--------|------|------|
| 卡路里 | 綠色 | 主要指標 |
| 蛋白質 | 藍色 | 肌肉建造 |
| 碳水 | 橙色 | 能量來源 |
| 脂肪 | 紅色 | 脂肪攝取 |
| 纖維 | 紫色 | 消化健康 |
| 糖分 | 粉紅 | 糖分控制 |
| 鈉 | 灰色 | 鹽分攝取 |

---

## 📱 使用流程

### 基本流程
1. 選擇餐別（早餐/午餐/晚餐/小食）
2. 上傳食物照片
3. 等待 AI 分析（3-5 秒）
4. 查看分析結果

### 編輯流程
1. 點擊「✏️ 編輯」按鈕
2. **快速調整:** 點擊份量按鈕（½、¾、1.5、2 份）
3. **手動微調:** 直接修改數字
4. 點擊「✓ 確認修改」
5. 點擊「💾 儲存記錄」

### 取消編輯
- 點擊「✗ 取消」返回原始數據
- 不會保存任何修改

---

## 🎯 功能對比

### Calomei vs Our App

| 功能 | Calomei | Fitness Tracker |
|------|---------|-----------------|
| AI 食物識別 | ✅ | ✅ |
| 卡路里追蹤 | ✅ | ✅ |
| 營養分析 | ✅ (3項) | ✅ (7項) |
| 編輯功能 | ✅ | ✅ |
| 份量調整 | ❓ | ✅ (4檔快速) |
| 手動微調 | ❓ | ✅ (所有欄位) |
| 廣東話評論 | ✅ | ❌ (未實作) |
| 體重追蹤 | ✅ | ❌ (未實作) |
| 免費使用 | 3次/日 | ✅ 無限 |

---

## 🚀 技術實現

### State Management
```typescript
const [editing, setEditing] = useState(false);
const [editedResult, setEditedResult] = useState<any>(null);
```

### Key Functions
1. **startEdit()** - 進入編輯模式
2. **cancelEdit()** - 取消編輯
3. **saveEdit()** - 確認修改
4. **updateNutrition()** - 更新單一欄位
5. **adjustServing()** - 調整份量（倍數）

### Serving Multiplier Logic
```typescript
const adjustServing = (multiplier: number) => {
  setEditedResult((prev: any) => ({
    ...prev,
    calories: Math.round(prev.calories * multiplier),
    protein: Math.round(prev.protein * multiplier),
    carbs: Math.round(prev.carbs * multiplier),
    fat: Math.round(prev.fat * multiplier),
    fiber: Math.round((prev.fiber || 0) * multiplier),
    sugar: Math.round((prev.sugar || 0) * multiplier),
    sodium: Math.round((prev.sodium || 0) * multiplier)
  }));
};
```

---

## 📊 數據結構

### Analysis Result
```typescript
{
  foodName: string;        // 食物名稱
  calories: number;        // 卡路里
  protein: number;         // 蛋白質 (g)
  carbs: number;           // 碳水化合物 (g)
  fat: number;             // 脂肪 (g)
  fiber: number;           // 纖維 (g)
  sugar: number;           // 糖分 (g)
  sodium: number;          // 鈉 (mg)
  servingSize: string;     // 份量描述
  confidence: number;      // 信心度 (0-1)
  imagePath: string;       // 圖片路徑
  note?: string;           // 警告訊息
}
```

---

## 🎉 使用範例

### 場景 1: 食咗半碗飯
1. AI 識別：白飯 - 300 kcal
2. 點擊「✏️ 編輯」
3. 點擊「½ 份」
4. 結果：白飯 - 150 kcal
5. 點擊「✓ 確認修改」
6. 點擊「💾 儲存記錄」

### 場景 2: AI 識別唔準
1. AI 識別：炒飯 - 500 kcal
2. 點擊「✏️ 編輯」
3. 手動改卡路里：600
4. 手動改蛋白質：25
5. 點擊「✓ 確認修改」
6. 點擊「💾 儲存記錄」

### 場景 3: 食咗兩份
1. AI 識別：雞扒 - 400 kcal
2. 點擊「✏️ 編輯」
3. 點擊「2 份」
4. 結果：雞扒 - 800 kcal
5. 點擊「✓ 確認修改」
6. 點擊「💾 儲存記錄」

---

## 📱 測試

**URL:** http://192.168.131.21:3001

**測試步驟:**
1. 上傳食物照片
2. 等待 AI 分析
3. 點擊「✏️ 編輯」
4. 測試份量調整（½、¾、1.5、2 份）
5. 測試手動修改數字
6. 點擊「✓ 確認修改」
7. 驗證數據更新
8. 點擊「💾 儲存記錄」

---

## 🚀 Commit Info

**Commit:** 18cb667  
**Message:** "Feature: Add Calomei-style edit mode + serving adjuster + more nutrition details"  
**GitHub:** https://github.com/ycozzz/fitness-tracker

**Changes:**
- ✅ Added edit button
- ✅ Added serving size adjuster (½, ¾, 1.5, 2x)
- ✅ Added 3 more nutrition fields (fiber, sugar, sodium)
- ✅ Made all fields editable
- ✅ Added confirm/cancel buttons
- ✅ Improved UI with color-coded cards

---

## 🎯 總結

**新功能:**
1. ✏️ **Edit Button** - 進入編輯模式
2. 🔢 **Serving Adjuster** - 快速調整份量（4檔）
3. 📊 **More Details** - 7項營養數據（+3項）
4. ✍️ **Manual Edit** - 所有欄位可編輯
5. ✓ **Confirm/Cancel** - 確認或取消修改

**學習自 Calomei:**
- AI 食物識別
- 營養追蹤
- 編輯功能
- 用戶友好設計

**超越 Calomei:**
- 更多營養細節（7 vs 3）
- 快速份量調整（4檔）
- 完全免費無限使用
- 所有欄位可手動編輯

---

**而家可以完美微調食物數據！** 🎉✅

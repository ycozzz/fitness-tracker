'use client';
import { useState, useRef, useEffect } from 'react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  quantity: number;
}

interface MealTypeConfig {
  type: MealType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function Home() {
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string>('');
  const [todayStats, setTodayStats] = useState({ consumed: 0, target: 2000, remaining: 2000 });
  const [error, setError] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      const res = await fetch('/api/meals');
      if (res.ok) {
        const meals = await res.json();
        const consumed = meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
        setTodayStats({
          consumed: Math.round(consumed),
          target: 2000,
          remaining: Math.max(0, 2000 - consumed)
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('圖片大小不能超過 10MB');
      return;
    }

    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      setUploading(false);

      if (!res.ok) {
        throw new Error('上傳失敗');
      }

      setAnalyzing(true);
      const data = await res.json();
      
      setTimeout(() => {
        setAnalyzing(false);
        setResult(data);
      }, 1500);

    } catch (err: any) {
      setUploading(false);
      setAnalyzing(false);
      setError(err.message || '分析失敗，請重試');
    }
  };

  const startEdit = () => {
    setEditedResult(JSON.parse(JSON.stringify(result))); // Deep copy
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditedResult(null);
  };

  const saveEdit = () => {
    // Recalculate totals
    const items = editedResult.items || [];
    const totals = items.reduce((acc: any, item: FoodItem) => ({
      calories: acc.calories + (item.calories * item.quantity),
      protein: acc.protein + (item.protein * item.quantity),
      carbs: acc.carbs + (item.carbs * item.quantity),
      fat: acc.fat + (item.fat * item.quantity),
      fiber: acc.fiber + (item.fiber * item.quantity),
      sugar: acc.sugar + (item.sugar * item.quantity),
      sodium: acc.sodium + (item.sodium * item.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });

    setResult({
      ...editedResult,
      ...totals,
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      fiber: Math.round(totals.fiber),
      sugar: Math.round(totals.sugar),
      sodium: Math.round(totals.sodium)
    });
    setEditing(false);
    setEditedResult(null);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...editedResult.items];
    newItems[index].quantity = Math.max(0, quantity);
    setEditedResult({ ...editedResult, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = editedResult.items.filter((_: any, i: number) => i !== index);
    setEditedResult({ ...editedResult, items: newItems });
  };

  const saveMeal = async () => {
    if (!result) return;
    
    const mealData = {
      mealType: selectedMeal,
      ...result,
    };

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
      });

      if (res.ok) {
        setResult(null);
        setPreview('');
        fetchTodayStats();
      }
    } catch (err) {
      setError('儲存失敗，請重試');
    }
  };

  const mealTypes: MealTypeConfig[] = [
    { type: 'breakfast', label: '早餐', icon: '🌅', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { type: 'lunch', label: '午餐', icon: '☀️', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { type: 'dinner', label: '晚餐', icon: '🌙', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    { type: 'snack', label: '小食', icon: '🍎', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  ];

  const selectedConfig = mealTypes.find(m => m.type === selectedMeal)!;
  const progressPercent = Math.min(100, (todayStats.consumed / todayStats.target) * 100);

  const displayData = editing ? editedResult : result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">🏋️ Fitness Tracker</h1>
                <p className="text-gray-500 text-sm">AI 智能飲食記錄</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  {todayStats.consumed}
                </div>
                <div className="text-gray-500 text-xs mt-1">今日卡路里</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>進度</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Meal Type Selector */}
        <section className="mb-6 animate-slide-up">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🍽️</span> 選擇餐別
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mealTypes.map((meal) => (
                <button
                  key={meal.type}
                  onClick={() => setSelectedMeal(meal.type)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedMeal === meal.type
                      ? `${meal.bgColor} ${meal.borderColor} shadow-md scale-105`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-3xl mb-2">{meal.icon}</div>
                  <div className={`text-sm font-semibold ${selectedMeal === meal.type ? meal.color : 'text-gray-700'}`}>
                    {meal.label}
                  </div>
                  {selectedMeal === meal.type && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-2 h-2 rounded-full ${meal.color.replace('text-', 'bg-')}`} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Upload Area */}
        <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {!preview ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📸</span> 拍照或上傳
                </h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-area w-full py-16 flex flex-col items-center justify-center group"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    📷
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    點擊上傳食物照片
                  </div>
                  <div className="text-sm text-gray-500">
                    支援 JPG、PNG 格式，最大 10MB
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-md">
                  <img src={preview} alt="Food" className="w-full" />
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                      <div className="text-center">
                        <div className="spinner mx-auto mb-4 text-primary-500" />
                        <p className="text-gray-700 font-semibold">上傳中...</p>
                      </div>
                    </div>
                  )}

                  {analyzing && !uploading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                      <div className="text-center">
                        <div className="spinner mx-auto mb-4 text-primary-500" />
                        <p className="text-gray-700 font-semibold text-lg">AI 分析中...</p>
                        <p className="text-gray-500 text-sm mt-2">正在識別食物並計算營養</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Result */}
                {displayData && !analyzing && !uploading && (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-100 shadow-sm animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {displayData.foodName}
                        </h3>
                        {displayData.confidence && (
                          <div className="badge badge-success">
                            信心度 {Math.round(displayData.confidence * 100)}%
                          </div>
                        )}
                        {displayData.note && (
                          <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                            {displayData.note}
                          </div>
                        )}
                      </div>
                      
                      {/* Edit Button */}
                      {!editing && (
                        <button
                          onClick={startEdit}
                          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <span>✏️</span>
                          <span>編輯</span>
                        </button>
                      )}
                    </div>

                    {/* Food Items List (Editing Mode) */}
                    {editing && displayData.items && displayData.items.length > 0 && (
                      <div className="mb-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">食物項目</h4>
                        {displayData.items.map((item: FoodItem, index: number) => (
                          <div key={index} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {item.calories}kcal · {item.protein}g蛋白質 · {item.carbs}g碳水 · {item.fat}g脂肪
                                </div>
                              </div>
                              <button
                                onClick={() => removeItem(index)}
                                className="ml-3 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-semibold"
                              >
                                ✕ 移除
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-700">數量:</label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateItemQuantity(index, item.quantity - 0.5)}
                                  className="w-8 h-8 bg-white border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-bold"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 0)}
                                  className="w-20 px-3 py-2 text-center border-2 border-blue-300 rounded-lg font-semibold text-blue-700 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() => updateItemQuantity(index, item.quantity + 0.5)}
                                  className="w-8 h-8 bg-white border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-bold"
                                >
                                  +
                                </button>
                                <span className="text-sm text-gray-600 ml-2">份</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Total Nutrition Grid */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">總營養</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="stat-card from-green-50 to-emerald-50 border-green-100">
                          <div className="text-sm text-green-700 font-medium mb-1">卡路里</div>
                          <div className="text-3xl font-bold text-green-600">{displayData.calories}</div>
                          <div className="text-xs text-green-600 mt-1">kcal</div>
                        </div>
                        <div className="stat-card from-blue-50 to-cyan-50 border-blue-100">
                          <div className="text-sm text-blue-700 font-medium mb-1">蛋白質</div>
                          <div className="text-3xl font-bold text-blue-600">{displayData.protein}</div>
                          <div className="text-xs text-blue-600 mt-1">g</div>
                        </div>
                        <div className="stat-card from-orange-50 to-amber-50 border-orange-100">
                          <div className="text-sm text-orange-700 font-medium mb-1">碳水</div>
                          <div className="text-3xl font-bold text-orange-600">{displayData.carbs}</div>
                          <div className="text-xs text-orange-600 mt-1">g</div>
                        </div>
                        <div className="stat-card from-red-50 to-rose-50 border-red-100">
                          <div className="text-sm text-red-700 font-medium mb-1">脂肪</div>
                          <div className="text-3xl font-bold text-red-600">{displayData.fat}</div>
                          <div className="text-xs text-red-600 mt-1">g</div>
                        </div>
                      </div>
                    </div>

                    {/* More Details */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-purple-700 font-medium mb-1">纖維</div>
                        <div className="text-lg font-bold text-purple-600">{displayData.fiber || 0}g</div>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-pink-700 font-medium mb-1">糖分</div>
                        <div className="text-lg font-bold text-pink-600">{displayData.sugar || 0}g</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-700 font-medium mb-1">鈉</div>
                        <div className="text-lg font-bold text-gray-600">{displayData.sodium || 0}mg</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {editing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="flex-1 btn btn-success"
                          >
                            ✓ 確認修改
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                          >
                            ✗ 取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={saveMeal}
                            className="flex-1 btn btn-success"
                          >
                            💾 儲存記錄
                          </button>
                          <button
                            onClick={() => { setResult(null); setPreview(''); setError(''); }}
                            className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                          >
                            🔄 重新上傳
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-danger-50 border-2 border-danger-500 rounded-xl p-4 flex items-center animate-fade-in">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <div className="font-semibold text-danger-500">錯誤</div>
                      <div className="text-sm text-danger-600">{error}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Today Stats */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📊</span> 今日統計
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="stat-card from-green-50 to-emerald-50 border-green-100">
                  <div className="text-3xl font-bold text-green-600">{todayStats.consumed}</div>
                  <div className="text-xs text-green-700 mt-2 font-medium">已攝取</div>
                </div>
              </div>
              <div className="text-center">
                <div className="stat-card from-blue-50 to-cyan-50 border-blue-100">
                  <div className="text-3xl font-bold text-blue-600">{todayStats.target}</div>
                  <div className="text-xs text-blue-700 mt-2 font-medium">目標</div>
                </div>
              </div>
              <div className="text-center">
                <div className="stat-card from-orange-50 to-amber-50 border-orange-100">
                  <div className="text-3xl font-bold text-orange-600">{todayStats.remaining}</div>
                  <div className="text-xs text-orange-700 mt-2 font-medium">剩餘</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

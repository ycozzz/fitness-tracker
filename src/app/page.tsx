'use client';
import { useState, useRef } from 'react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function Home() {
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Analyze
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('分析失敗');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!result) return;
    
    const mealData = {
      mealType: selectedMeal,
      ...result,
    };

    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData),
    });

    if (res.ok) {
      alert('✅ 已記錄！');
      setResult(null);
      setPreview('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏋️ Fitness Tracker
          </h1>
          <p className="text-gray-600">拍照記錄你的飲食</p>
        </div>

        {/* Meal Type Selector */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">選擇餐別</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { type: 'breakfast', label: '早餐', icon: '🌅' },
              { type: 'lunch', label: '午餐', icon: '☀️' },
              { type: 'dinner', label: '晚餐', icon: '🌙' },
              { type: 'snack', label: '小食', icon: '🍎' },
            ].map((meal) => (
              <button
                key={meal.type}
                onClick={() => setSelectedMeal(meal.type as MealType)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedMeal === meal.type
                    ? 'bg-gradient-to-br from-green-500 to-blue-500 border-transparent text-white shadow-lg scale-105'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-3xl mb-1">{meal.icon}</div>
                <div className="text-sm font-medium">{meal.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Camera / Upload */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-16 border-4 border-dashed border-gray-300 rounded-3xl hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📸</div>
              <div className="text-lg font-semibold text-gray-700">拍照或上傳食物圖片</div>
              <div className="text-sm text-gray-500 mt-2">AI 會自動識別並計算營養</div>
            </button>
          ) : (
            <div>
              <img src={preview} alt="Food" className="w-full rounded-2xl mb-4" />
              
              {analyzing ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">AI 分析中...</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{result.foodName}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{result.calories}</div>
                        <div className="text-sm text-gray-600">卡路里</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{result.protein}g</div>
                        <div className="text-sm text-gray-600">蛋白質</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">{result.carbs}g</div>
                        <div className="text-sm text-gray-600">碳水化合物</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{result.fat}g</div>
                        <div className="text-sm text-gray-600">脂肪</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      份量：{result.servingSize}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveMeal}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                      >
                        ✅ 儲存記錄
                      </button>
                      <button
                        onClick={() => { setResult(null); setPreview(''); }}
                        className="px-6 bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-300 transition-all"
                      >
                        重拍
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">今日統計</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,450</div>
              <div className="text-xs text-gray-600">已攝取</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2,000</div>
              <div className="text-xs text-gray-600">目標</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">550</div>
              <div className="text-xs text-gray-600">剩餘</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function Home() {
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string>('');
  const [todayStats, setTodayStats] = useState({ consumed: 0, target: 2000, remaining: 2000 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      const res = await fetch('/api/meals');
      const meals = await res.json();
      const consumed = meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
      setTodayStats({
        consumed: Math.round(consumed),
        target: 2000,
        remaining: Math.max(0, 2000 - consumed)
      });
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setAnalyzing(true);
    setResult(null);
    
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
      alert('❌ 分析失敗，請重試');
      setPreview('');
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
      fetchTodayStats();
    }
  };

  const mealTypes = [
    { type: 'breakfast', label: '早餐', icon: '🌅', gradient: 'from-orange-400 to-pink-500' },
    { type: 'lunch', label: '午餐', icon: '☀️', gradient: 'from-yellow-400 to-orange-500' },
    { type: 'dinner', label: '晚餐', icon: '🌙', gradient: 'from-indigo-500 to-purple-600' },
    { type: 'snack', label: '小食', icon: '🍎', gradient: 'from-green-400 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                🏋️ Fitness Tracker
              </h1>
              <p className="text-white/80 text-sm">AI 智能飲食記錄</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white drop-shadow-lg">{todayStats.consumed}</div>
              <div className="text-white/60 text-xs">今日卡路里</div>
            </div>
          </div>
        </div>

        {/* Meal Type Selector */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🍽️</span> 選擇餐別
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {mealTypes.map((meal) => (
              <button
                key={meal.type}
                onClick={() => setSelectedMeal(meal.type as MealType)}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform ${
                  selectedMeal === meal.type
                    ? 'scale-105 shadow-2xl'
                    : 'scale-100 hover:scale-102 shadow-lg'
                }`}
                style={{
                  background: selectedMeal === meal.type 
                    ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meal.gradient} ${
                  selectedMeal === meal.type ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-2">{meal.icon}</div>
                  <div className={`text-base font-bold ${
                    selectedMeal === meal.type ? 'text-white' : 'text-white/80'
                  }`}>{meal.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Camera / Upload */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
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
              className="w-full py-20 border-4 border-dashed border-white/30 rounded-3xl hover:border-white/60 hover:bg-white/5 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">📸</div>
                <div className="text-xl font-bold text-white mb-2">拍照或上傳食物圖片</div>
                <div className="text-sm text-white/60">AI 會自動識別並計算營養</div>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={preview} alt="Food" className="w-full" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-white font-semibold text-lg">AI 分析中...</p>
                      <p className="text-white/60 text-sm mt-2">請稍候</p>
                    </div>
                  </div>
                )}
              </div>
              
              {result && !analyzing && (
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🍴</span> {result.foodName}
                  </h3>
                  
                  {result.confidence && (
                    <div className="mb-4 text-white/70 text-sm">
                      信心度: {Math.round(result.confidence * 100)}%
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl p-4 text-center border border-white/20">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">{result.calories}</div>
                      <div className="text-white/80 text-sm font-medium">卡路里</div>
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl p-4 text-center border border-white/20">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">{result.protein}g</div>
                      <div className="text-white/80 text-sm font-medium">蛋白質</div>
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-xl p-4 text-center border border-white/20">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">{result.carbs}g</div>
                      <div className="text-white/80 text-sm font-medium">碳水</div>
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-xl p-4 text-center border border-white/20">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">{result.fat}g</div>
                      <div className="text-white/80 text-sm font-medium">脂肪</div>
                    </div>
                  </div>

                  <div className="text-sm text-white/70 mb-4 text-center">
                    📏 份量：{result.servingSize}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveMeal}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      ✅ 儲存記錄
                    </button>
                    <button
                      onClick={() => { setResult(null); setPreview(''); }}
                      className="px-6 backdrop-blur-xl bg-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
                    >
                      🔄 重拍
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today Stats */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span> 今日統計
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white drop-shadow-lg">{todayStats.consumed}</div>
                <div className="text-xs text-white/70 mt-1">已攝取</div>
              </div>
            </div>
            <div className="text-center">
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white drop-shadow-lg">{todayStats.target}</div>
                <div className="text-xs text-white/70 mt-1">目標</div>
              </div>
            </div>
            <div className="text-center">
              <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white drop-shadow-lg">{todayStats.remaining}</div>
                <div className="text-xs text-white/70 mt-1">剩餘</div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl border border-white/20">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (todayStats.consumed / todayStats.target) * 100)}%` }}
              />
            </div>
            <div className="text-center text-white/60 text-xs mt-2">
              {Math.round((todayStats.consumed / todayStats.target) * 100)}% 完成
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

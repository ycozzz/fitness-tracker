'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register' | 'onboarding';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login/Register fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Onboarding fields
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (err) {
      setError('網絡錯誤，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      setError('請填寫所有欄位');
      return;
    }
    
    // Move to onboarding
    setMode('onboarding');
    setError('');
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          profile: {
            gender,
            age: parseInt(age),
            height: parseFloat(height),
            weight: parseFloat(weight),
            activityLevel,
            goal
          }
        })
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || '註冊失敗');
      }
    } catch (err) {
      setError('網絡錯誤，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🍎 Fitness Tracker</h1>
          <p className="text-white/80">AI 智能飲食追蹤</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          {mode === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">登入</h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用戶名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="輸入用戶名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密碼
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="輸入密碼"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '登入中...' : '登入'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  還沒有帳號？立即註冊
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">註冊</h2>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用戶名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="輸入用戶名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電郵
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="輸入電郵地址"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密碼
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="輸入密碼（至少6位）"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  下一步：設定個人資料
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  已有帳號？返回登入
                </button>
              </div>
            </>
          )}

          {mode === 'onboarding' && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">個人資料設定</h2>
              <p className="text-sm text-gray-600 mb-6">我們會根據你的資料計算每日營養目標</p>
              
              <form onSubmit={handleOnboarding} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        gender === 'male'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      👨 男性
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        gender === 'female'
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      👩 女性
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      年齡
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                      placeholder="25"
                      required
                      min="10"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      身高 (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                      placeholder="170"
                      required
                      min="100"
                      max="250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      體重 (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                      placeholder="70"
                      required
                      min="30"
                      max="300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    活動量
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="sedentary">久坐（辦公室工作）</option>
                    <option value="light">輕度活動（每週運動1-3天）</option>
                    <option value="moderate">中度活動（每週運動3-5天）</option>
                    <option value="active">高度活動（每週運動6-7天）</option>
                    <option value="very_active">非常活躍（體力勞動或每天訓練）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目標
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setGoal('lose')}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        goal === 'lose'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔥 減脂
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoal('maintain')}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        goal === 'maintain'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ⚖️ 維持
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoal('gain')}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        goal === 'gain'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💪 增肌
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '註冊中...' : '完成註冊'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← 返回上一步
                </button>
              </div>
            </>
          )}
        </div>

        {/* Demo Account Hint */}
        {mode === 'login' && (
          <div className="mt-4 text-center text-white/80 text-sm">
            測試帳號：demo / demo123
          </div>
        )}
      </div>
    </div>
  );
}

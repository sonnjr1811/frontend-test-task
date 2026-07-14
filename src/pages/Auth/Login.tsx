import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { validateEmail, validatePassword } from '../../utils/validate';
import { Eye, EyeOff, Lock, Mail, GraduationCap, Sparkles, Sun, Moon } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loading, error: authError } = useAuth();
  const [darkMode, setDarkMode] = useTheme();

  // State quản lý giá trị input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State quản lý lỗi validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Kiểm tra form hợp lệ mỗi khi input thay đổi
  useEffect(() => {
    const isEmailOk = email && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordOk = password && password.length >= 6;
    setIsFormValid(!!(isEmailOk && isPasswordOk));
  }, [email, password, emailError, passwordError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    
    if (!eErr && !pErr) {
      login(email, password);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-955 transition-colors duration-300 font-sans">
      {/* Nút chuyển đổi giao diện Dark/Light Mode ở góc trên bên phải */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all duration-200 z-50 cursor-pointer"
        aria-label="Toggle Theme"
      >
        {darkMode ? <Sun className="w-5 h-5 text-amber-500 animate-pulse" /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Cột Trái: Banner thương hiệu & Giới thiệu (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-700 to-blue-800 dark:from-violet-955 dark:via-indigo-955 dark:to-slate-955 p-16 flex-col justify-between">
        {/* Lớp phủ họa tiết vòng tròn nghệ thuật phía sau */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Logo thương hiệu */}
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-wider font-mono">EduPortal</span>
        </div>

        {/* Nội dung giới thiệu */}
        <div className="my-auto z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-200 text-xs font-semibold uppercase tracking-wider animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền tảng học tập thông minh</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Nâng tầm tri thức, <br />
            chinh phục tương lai.
          </h1>
          <p className="text-lg text-indigo-100/90 leading-relaxed font-light">
            EduPortal cung cấp các khóa học Frontend, Backend và UI/UX hàng đầu giúp bạn nhanh chóng trở thành chuyên gia lập trình thực thụ.
          </p>
        </div>

        {/* Chân trang cột trái */}
        <div className="text-sm text-indigo-200/60 z-10">
          &copy; 2026 EduPortal. All rights reserved.
        </div>
      </div>

      {/* Cột Phải: Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo và Tiêu đề trên mobile */}
          <div className="text-center lg:text-left space-y-3">
            <div className="flex items-center justify-center lg:justify-start space-x-3 lg:hidden">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">EduPortal</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Đăng nhập tài khoản
            </h2>
          </div>

          {authError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 text-sm text-rose-700 dark:text-rose-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{authError}</span>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Input Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(validateEmail(e.target.value));
                    }}
                    className={`block w-full h-12 pl-11 pr-4 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-sm ${emailError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20'
                      }`}
                    placeholder="student@example.com"
                  />
                </div>
                {emailError && <p className="text-xs text-rose-500 mt-1 pl-1">{emailError}</p>}
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value));
                    }}
                    className={`block w-full h-12 pl-11 pr-12 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-sm ${passwordError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-rose-500 mt-1 pl-1">{passwordError}</p>}
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-offset-slate-950 cursor-pointer"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full h-12 flex items-center justify-center rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-md ${isFormValid && !loading
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg active:scale-98 cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none'
                }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
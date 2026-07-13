import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Course, Lesson } from '../../types/course';
import { 
  BookOpen, Search, LogOut, Sun, Moon, 
  GraduationCap, Award, CheckCircle, Clock, 
  Play, BookOpenCheck, Sparkles, Menu, X, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

export const Courses: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // State quản lý toàn bộ danh sách khóa học từ API
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý tìm kiếm, lọc theo cấp độ và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State quản lý Sidebar trên mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // State quản lý chế độ Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Gọi API tải toàn bộ 50 khóa học một lần duy nhất khi Component mount
  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://dummyjson.com/recipes?limit=50');
        if (!res.ok) throw new Error('Không thể kết nối API để tải dữ liệu khóa học.');
        const data = await res.json();

        // Ánh xạ dữ liệu từ API sang Interface Course mới
        const mapped: Course[] = data.recipes.map((recipe: any): Course => {
          // 1. Ánh xạ kindOfCourse từ cuisine
          let kindOfCourse: Course['kindOfCourse'] = 'VSTEP';
          const cuisine = recipe.cuisine || '';
          if (['Italian', 'French', 'Greek'].includes(cuisine)) {
            kindOfCourse = 'IELTS';
          } else if (['Asian', 'Japanese', 'Thai', 'Pakistani', 'Indian'].includes(cuisine)) {
            kindOfCourse = 'TOEIC';
          } else if (['Mexican', 'Moroccan', 'American'].includes(cuisine)) {
            kindOfCourse = '4SKILLS';
          }

          // 2. Ánh xạ level từ difficulty
          let level: Course['level'] = 'MTC';
          if (recipe.difficulty === 'Easy') {
            level = 'S';
          } else if (recipe.difficulty === 'Medium') {
            level = 'Pres';
          } else if (recipe.difficulty === 'Hard') {
            level = 'TC';
          }

          // 3. Xây dựng danh sách bài học con và tính toán tiến độ học tập
          const rawInstructions = recipe.instructions || [];
          const totalLessons = rawInstructions.length;
          
          // Đọc map trạng thái chi tiết của các bài học con từ localStorage
          const savedLessonsStatus = JSON.parse(
            localStorage.getItem(`lessons_status_${recipe.id}`) || '{}'
          );

          const lessons: Lesson[] = rawInstructions.map((inst: string, idx: number): Lesson => {
            const lessonId = `${recipe.id}_${idx}`;
            const status = (savedLessonsStatus[lessonId] || 'not-started') as Lesson['status'];
            const duration = Math.max(5, Math.round((recipe.prepTimeMinutes || 30) / totalLessons) + (idx % 3) * 2);

            return {
              id: lessonId,
              courseId: String(recipe.id),
              title: `Bài học ${idx + 1}: ${inst.split(',')[0]}`,
              duration,
              url: `https://example.com/lesson-${idx + 1}`,
              description: inst,
              status,
              order: idx + 1
            };
          });

          // Tính toán lại tiến trình % (chỉ dựa vào số bài học ở trạng thái 'completed')
          const completedCount = lessons.filter(l => l.status === 'completed').length;
          const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
          
          // Trạng thái khóa học
          let status: Course['status'] = 'not-started';
          if (progress === 100) {
            status = 'completed';
          } else if (progress > 0) {
            status = 'in-progress';
          }

          return {
            id: String(recipe.id),
            title: `Khóa học: ${recipe.name}`,
            description: rawInstructions.join(' '),
            thumbnail: recipe.image,
            level,
            kindOfCourse,
            totalLessons,
            progress,
            status,
            lessons
          };
        });

        setAllCourses(mapped);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi gọi dữ liệu khóa học.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  // Thực hiện tìm kiếm và lọc cấp độ Level hoàn chỉnh trên client
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Reset về trang 1 mỗi khi thay đổi từ khóa tìm kiếm hoặc độ khó
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel]);

  // Tính toán số lượng kết quả và trang
  const totalCoursesCount = filteredCourses.length;
  const totalPages = Math.ceil(totalCoursesCount / 9);

  // Phân trang 9 bản ghi/trang
  const startIndex = (currentPage - 1) * 9;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + 9);

  // Hàm Reset bộ lọc về mặc định
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('All');
    setCurrentPage(1);
  };

  // Lấy thông tin user đăng nhập
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{"name": "Học viên", "email": "hocvien@example.com"}');

  const levels = ['All', 'S', 'Pres', 'TC', 'MTC'];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-6 z-20 transition-colors duration-300">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">EduPortal</span>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            <a 
              href="#courses" 
              className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>Khóa học của tôi</span>
            </a>
            <a 
              href="#discover" 
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all group"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              <span>Khám phá</span>
            </a>
            <a 
              href="#docs" 
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
            >
              <BookOpenCheck className="w-5 h-5" />
              <span>Tài liệu học tập</span>
            </a>
            <a 
              href="#achieve" 
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
            >
              <Award className="w-5 h-5" />
              <span>Thành tích</span>
            </a>
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-850 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
              {userInfo.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{userInfo.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR (Drawer) */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 flex flex-col justify-between p-6 shadow-2xl border-r border-slate-200 dark:border-slate-800 transition-transform duration-350 ease-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">EduPortal</span>
            </div>
            {/* Close Button */}
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            <a 
              href="#courses" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              <BookOpen className="w-5 h-5" />
              <span>Khóa học của tôi</span>
            </a>
            <a 
              href="#discover" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <Sparkles className="w-5 h-5" />
              <span>Khám phá</span>
            </a>
            <a 
              href="#docs" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-850"
            >
              <BookOpenCheck className="w-5 h-5" />
              <span>Tài liệu học tập</span>
            </a>
            <a 
              href="#achieve" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <Award className="w-5 h-5" />
              <span>Thành tích</span>
            </a>
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {userInfo.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{userInfo.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              logout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER BAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-10 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            {/* Mobile Hamburger Button (Touch targets >= 44px) */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-855 dark:text-white">Khóa học của tôi</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button (Touch targets >= 44px) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            
            {/* User Avatar Short form */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-755 dark:text-slate-350">Chào, <span className="font-semibold">{userInfo.name}</span> 👋</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          
          {/* WELCOME BANNER & STATS */}
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
              <div className="space-y-2 z-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Học tập hiệu quả mỗi ngày!</h2>
                <p className="text-indigo-100 font-light text-sm sm:text-base">Hôm nay là một ngày tuyệt vời để tiếp tục hoàn thành các mục tiêu lập trình của bạn.</p>
              </div>
              <div className="flex items-center space-x-2.5 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/10 text-sm font-semibold z-10">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tổng kho dữ liệu: {allCourses.length} khóa học</span>
              </div>
            </div>

            {/* QUICK STATS WIDGETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang hiển thị</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{totalCoursesCount} kết quả</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trang hiện tại</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{totalPages === 0 ? 0 : currentPage} / {totalPages || 1}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">API nguồn</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">DummyJSON API</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giới hạn trang</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">9 bản ghi / trang</p>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER & SEARCH */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Level Difficulty Filter Tabs (All / S / Pres / TC / MTC - touch target >= 44px) */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mr-1.5 hidden sm:inline">Mức độ:</span>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`h-11 px-4 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                    selectedLevel === lvl
                      ? 'bg-indigo-650 text-white dark:bg-indigo-600 shadow-md shadow-indigo-650/10'
                      : 'bg-white text-slate-655 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {lvl === 'All' ? 'Tất cả' : `Level: ${lvl}`}
                </button>
              ))}
            </div>

            {/* Search Input (Touch target >= 44px) */}
            <div className="relative w-full md:w-80">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm khóa học theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* ERROR STATUS */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-450 text-sm">
              Lỗi: {error}
            </div>
          )}

          {/* COURSE LIST GRID */}
          {loading ? (
            // Skeleton Loading State
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse space-y-4">
                  <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                    </div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedCourses.map((course) => (
                <div 
                  key={course.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail: Tỉ lệ 16:9 (aspect-video) */}
                    <div className="w-full aspect-video overflow-hidden relative bg-slate-100 dark:bg-slate-950">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Kind Badge */}
                      <span className="absolute top-4 left-4 px-2.5 py-1 bg-indigo-650/90 dark:bg-indigo-600/90 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
                        {course.kindOfCourse}
                      </span>
                      {/* Level Badge */}
                      <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm text-white ${
                        course.level === 'S' 
                          ? 'bg-emerald-600/90' 
                          : course.level === 'Pres' 
                            ? 'bg-amber-600/90' 
                            : 'bg-rose-600/90'
                      }`}>
                        Level: {course.level}
                      </span>
                    </div>

                    {/* Course details */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>
                      
                      {/* Description: Rút gọn 2 dòng (line-clamp-2) */}
                      <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
                        <span>Giảng viên: <span className="font-semibold text-slate-700 dark:text-slate-300">EduPortal</span></span>
                        <span className="flex items-center space-x-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{course.totalLessons} bài học</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course footer (progress & button) */}
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-850 space-y-4">
                    {/* Progress details */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-655 dark:text-slate-400">
                        <span>Tiến độ học</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button (Touch target >= 44px) */}
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center space-x-2.5 shadow-sm transition-all duration-200 cursor-pointer ${
                        course.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'
                      }`}
                    >
                      <Play className={`w-3.5 h-3.5 fill-current ${course.status === 'completed' ? 'text-emerald-700 dark:text-emerald-450' : 'text-white dark:text-slate-950'}`} />
                      <span>
                        {course.status === 'completed' ? 'Học lại' : course.status === 'not-started' ? 'Bắt đầu học' : 'Tiếp tục học'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // NO RESULTS / EMPTY STATE
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-450 dark:text-slate-500 animate-pulse">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-850 dark:text-white">Không tìm thấy kết quả phù hợp</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Không tìm thấy khóa học nào khớp với từ khóa "{searchTerm}" hoặc cấp độ học tập đã chọn.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer inline-flex items-center justify-center"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}

          {/* PAGINATION UI (Touch target >= 44px) */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200 dark:border-slate-800">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page numbers */}
              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-indigo-650 text-white dark:bg-indigo-600 shadow-md shadow-indigo-600/10'
                        : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

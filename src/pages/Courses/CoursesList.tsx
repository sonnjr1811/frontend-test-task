import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/Header';
import { CourseCard } from '../../components/CourseCard';
import { Modal } from '../../components/Custom/Modal';
import type { Course } from '../../types/course';
import { 
  BookOpen, Search, LogOut, 
  GraduationCap, Award, Clock,
  BookOpenCheck, Sparkles, X, ChevronLeft, ChevronRight, AlertCircle, Trophy, Check
} from 'lucide-react';

export const CoursesList: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [darkMode, setDarkMode] = useTheme();
  
  // Custom Hook gọi API lấy danh sách khóa học
  const { courses: allCourses, loading, error } = useCourses();

  // State quản lý Achievements Modal
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null);

  // Tự động mở Modal Thành tích nếu có query param showAchievements
  useEffect(() => {
    if (searchParams.get('showAchievements') === 'true') {
      setIsAchievementsOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('showAchievements');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  // Lọc danh sách các khóa học đã hoàn thành 100%
  const completedCourses = allCourses.filter(c => c.progress === 100);

  // State quản lý tìm kiếm, lọc theo cấp độ và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State quản lý Sidebar trên mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      <aside className="hidden lg:flex lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-6 z-20 transition-colors duration-300">
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
            <button 
              onClick={() => setIsAchievementsOpen(true)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer text-left font-medium"
            >
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5" />
                <span>Thành tích</span>
              </div>
              {completedCourses.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold shrink-0">
                  {completedCourses.length}
                </span>
              )}
            </button>
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
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855"
            >
              <BookOpenCheck className="w-5 h-5" />
              <span>Tài liệu học tập</span>
            </a>
            <button 
              onClick={() => {
                setIsMobileSidebarOpen(false);
                setIsAchievementsOpen(true);
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-left font-medium"
            >
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5" />
                <span>Thành tích</span>
              </div>
              {completedCourses.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold shrink-0">
                  {completedCourses.length}
                </span>
              )}
            </button>
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
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* HEADER BAR */}
        <Header 
          title="Khóa học của tôi"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          userInfo={userInfo}
        />

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
                  <Award className="w-6 h-6" />
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
            {/* Level Difficulty Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mr-1.5 hidden sm:inline">Mức độ:</span>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`h-11 px-4 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                    selectedLevel === lvl
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow-md shadow-indigo-600/10'
                      : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {lvl === 'All' ? 'Tất cả' : `Level: ${lvl}`}
                </button>
              ))}
            </div>

            {/* Search Input */}
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
                <CourseCard 
                  key={course.id}
                  course={course}
                  onNavigateDetail={(id) => navigate(`/courses/${id}`)}
                />
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

          {/* PAGINATION UI */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow-md shadow-indigo-600/10'
                        : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

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

      {/* Modal Thành tích & Chứng chỉ */}
      <Modal
        isOpen={isAchievementsOpen}
        onClose={() => {
          setIsAchievementsOpen(false);
          setSelectedCertCourse(null);
        }}
        title={selectedCertCourse ? "Chứng chỉ hoàn thành" : "Thành tích & Chứng chỉ của tôi"}
      >
        {selectedCertCourse ? (
          /* HIỂN THỊ CHỨNG CHỈ CHI TIẾT (CERTIFICATE VIEW) */
          <div className="space-y-6">
            {/* Khung bằng khen đẹp mắt */}
            <div className="relative p-6 sm:p-10 border-[10px] border-amber-600/35 dark:border-amber-600/45 rounded-3xl bg-amber-50/20 dark:bg-amber-950/10 text-center font-sans space-y-6 overflow-hidden">
              {/* Pattern hoa văn chìm ở góc */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-600/50 m-2 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-600/50 m-2 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-600/50 m-2 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-600/50 m-2 rounded-br-xl pointer-events-none" />

              {/* Logo / Badge của EduPortal */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-amber-600 rounded-full text-white shadow-lg">
                  <Trophy className="w-8 h-8 text-amber-100 fill-amber-100" />
                </div>
                <span className="text-xl font-black text-amber-700 dark:text-amber-500 tracking-widest">EduPortal Academy</span>
              </div>

              {/* Tiêu đề bằng chứng nhận */}
              <div className="space-y-1.5">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-serif italic">CERTIFICATE OF COMPLETION</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chứng nhận hoàn thành khóa học xuất sắc</p>
              </div>

              <div className="py-4 space-y-4">
                <p className="text-sm text-slate-555 dark:text-slate-400 italic">Chứng chỉ này được trao tặng một cách trân trọng cho học viên:</p>
                <h5 className="text-2xl font-black text-indigo-650 dark:text-indigo-455 uppercase tracking-wide decoration-double underline decoration-amber-500 decoration-2 underline-offset-8">
                  {userInfo.name}
                </h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Vì đã nỗ lực hoàn thành xuất sắc lộ trình đào tạo, đạt tỉ lệ 100% tất cả các bài học và bài kiểm tra thực hành của khóa học:
                </p>
                <h6 className="text-lg font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/60 py-2 px-4 rounded-xl inline-block max-w-full truncate">
                  {selectedCertCourse.title}
                </h6>
              </div>

              {/* Ký tên & Dấu */}
              <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-6 max-w-lg mx-auto border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Ngày hoàn thành</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {new Date().toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-center sm:text-right space-y-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">EduPortal Founder</p>
                  <p className="text-base font-extrabold text-amber-600 dark:text-amber-500 font-serif italic">Nguyễn Văn Sơn</p>
                </div>
              </div>
            </div>

            {/* Nút điều hướng */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedCertCourse(null)}
                className="h-11 px-5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-855 cursor-pointer"
              >
                Quay lại danh sách
              </button>
              <button
                onClick={() => {
                  alert("Tính năng in chứng chỉ đang được nâng cấp!");
                }}
                className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Tải chứng chỉ (PDF)
              </button>
            </div>
          </div>
        ) : (
          /* HIỂN THỊ DANH SÁCH CHỨNG CHỈ (LIST VIEW) */
          <div className="space-y-4 py-2">
            {completedCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {completedCourses.map((c) => (
                  <div 
                    key={c.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-955/15 dark:via-transparent border border-emerald-100 dark:border-emerald-900/30 rounded-2xl gap-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      {/* Huy hiệu cúp vàng hoàn thành */}
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-955/30 flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-900/20 shrink-0 shadow-inner">
                        <Trophy className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Đã học xong 100% ({c.totalLessons} bài học)</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCertCourse(c)}
                      className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm hover:shadow active:scale-97 cursor-pointer w-full sm:w-auto shrink-0 transition-all"
                    >
                      <Award className="w-4 h-4" />
                      <span>Xem chứng chỉ</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* TRẠNG THÁI CHƯA CÓ CHỨNG CHỈ */
              <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-450">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-850 dark:text-white">Bạn chưa đạt chứng chỉ nào</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Hãy hoàn thành 100% tất cả bài học trong một khóa học bất kỳ để nhận được chứng nhận danh giá từ học viện.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAchievementsOpen(false);
                    handleResetFilters();
                  }}
                  className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Bắt đầu học ngay
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

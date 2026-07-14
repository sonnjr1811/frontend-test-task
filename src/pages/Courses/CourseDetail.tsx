import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course } from '../../types/course';
import { fetchCourseById } from '../../services/courseService';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/Header';
import { ProgressBar } from '../../components/ProgressBar';
import { LessonItem } from '../../components/LessonItem';
import { 
  ArrowLeft, Clock, BookOpen, Award, Sparkles, Star, Sun, Moon
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useTheme();

  // State quản lý thông tin khóa học
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch thông tin khóa học
  useEffect(() => {
    const fetchDetail = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourseById(courseId);
        // Lưu tiến trình vào localStorage
        localStorage.setItem(`course_progress_${courseId}`, String(data.progress));
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [courseId]);

  // Lấy thông tin user đăng nhập
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{"name": "Học viên", "email": "hocvien@example.com"}');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans pb-12">
        {/* HEADER BAR SKELETON */}
        <Header 
          title="Đang tải..."
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userInfo={userInfo}
        />

        {/* MAIN SKELETON CONTAINER */}
        <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
          {/* COURSE HERO COVER SKELETON */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 aspect-video bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="flex space-x-4">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="h-11 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* DESCRIPTION SKELETON */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>

          {/* LESSONS LIST SKELETON */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-sm">
            <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="text-rose-500 text-lg font-bold">Lỗi tải dữ liệu</div>
          <p className="text-sm text-slate-655 dark:text-slate-400">{error || 'Không tìm thấy thông tin khóa học.'}</p>
          <button 
            onClick={() => navigate('/courses')}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Xác định bài học đầu tiên chưa hoàn thành (hoặc bài đang học dở)
  const firstUncompletedIndex = course.lessons.findIndex(l => l.status !== 'completed');
  const targetLessonIndex = firstUncompletedIndex === -1 ? 0 : firstUncompletedIndex;

  const progressPercentage = course.progress;

  // Xử lý khi nhấn nút học
  const handleStartLearning = () => {
    navigate(`/courses/${course.id}/lessons/${targetLessonIndex}`);
  };

  // Xác định badge trạng thái khóa học
  const getStatusBadge = () => {
    switch (course.status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-emerald-600/90 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
            Đã hoàn thành
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-2.5 py-1 bg-sky-600/90 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
            Đang học
          </span>
        );
      case 'not-started':
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-600/90 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
            Chưa học
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans pb-12">
      
      {/* HEADER BAR */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-10 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/courses')}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-855 dark:text-white">Chi tiết khóa học</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
        
        {/* COURSE HERO COVER HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300 flex flex-col md:flex-row">
          {/* Cover Image 16:9 aspect ratio */}
          <div className="w-full md:w-1/2 aspect-video bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-2.5 py-1 bg-indigo-600/90 dark:bg-indigo-600/90 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
              {course.kindOfCourse} Course
            </span>
          </div>

          {/* Details right side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 flex-1">
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${
                  course.level === 'S' 
                    ? 'bg-emerald-600/90' 
                    : course.level === 'Pres' 
                      ? 'bg-amber-600/90' 
                      : 'bg-rose-600/90'
                }`}>
                  Level: {course.level}
                </span>
                {/* [BONUS] Course Status Badge */}
                {getStatusBadge()}
                <span className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>5.0 (Đánh giá)</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-slate-855 dark:text-white leading-tight">
                {course.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{course.totalLessons} bài học</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Tổng thời gian học: ~180 phút</span>
                </span>
                <span>Giảng viên: <span className="text-slate-700 dark:text-slate-300 font-bold">EduPortal</span></span>
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar progress={progressPercentage} label="Tiến trình hoàn thành khóa học" size="lg" />

            {/* Main Action Button */}
            <button
              onClick={handleStartLearning}
              className="h-11 w-full sm:w-52 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2.5 shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-150 cursor-pointer"
            >
              <Award className="w-5 h-5 text-indigo-200" />
              <span>
                {course.status === 'completed' ? 'Học lại khóa học' : course.status === 'not-started' ? 'Bắt đầu khóa học' : 'Tiếp tục học ngay'}
              </span>
            </button>
          </div>
        </div>

        {/* FULL DESCRIPTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 transition-colors duration-300 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mô tả khóa học</span>
          </h3>
          <p className="text-slate-700 dark:text-slate-350 leading-relaxed text-sm sm:text-base font-light">
            {course.description}
          </p>
        </div>

        {/* LESSONS LIST - TOUCH FRIENDLY LIST */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 transition-colors duration-300 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider flex items-center space-x-2.5">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Danh sách bài học con ({course.totalLessons})</span>
          </h3>

          <div className="space-y-3">
            {course.lessons.map((lesson, idx) => (
              <LessonItem 
                key={lesson.id}
                lesson={lesson}
                index={idx}
                thumbnail={course.thumbnail}
                onNavigateLesson={(index) => navigate(`/courses/${course.id}/lessons/${index}`)}
              />
            ))}
          </div>
        </div>

        {/* 100% Achievement Certificate Banner */}
        {progressPercentage === 100 && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Hoàn thành xuất sắc!</span>
              </div>
              <h3 className="text-xl font-extrabold">Bạn đã hoàn thành 100% tất cả các bài học!</h3>
              <p className="text-emerald-100 font-light text-xs sm:text-sm">Chứng chỉ học tập kỹ năng của bạn đã sẵn sàng được ghi nhận trên hệ thống.</p>
            </div>
            <button 
              onClick={() => navigate('/courses?showAchievements=true')}
              className="w-full sm:w-auto h-11 px-5 bg-white text-emerald-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              Xem chứng nhận
            </button>
          </div>
        )}

      </main>

    </div>
  );
};

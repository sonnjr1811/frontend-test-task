import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course } from '../../types/course';
import { fetchCourseById } from '../../services/courseService';
import { useTheme } from '../../hooks/useTheme';
import { useProgress } from '../../hooks/useProgress';
import { Header } from '../../components/Header';
import { ProgressBar } from '../../components/ProgressBar';
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, 
  BookOpen, Sparkles, ChevronRight, Check, Award, Sun, Moon
} from 'lucide-react';

export const LessonDetail: React.FC = () => {
  const { courseId, lessonIndex } = useParams<{ courseId: string; lessonIndex: string }>();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useTheme();

  // State quản lý dữ liệu khóa học kiểu Course
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chỉ số bài học hiện tại lấy từ URL param :lessonIndex
  const currentLessonIndex = parseInt(lessonIndex || '0', 10);
  
  // Sử dụng custom hook progress
  const { getSavedStatuses, saveLessonStatus } = useProgress(courseId || '');

  // Fetch thông tin chi tiết khóa học và map sang cấu trúc Course
  useEffect(() => {
    const fetchDetail = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        // Tự động chuyển bài học hiện tại sang 'in-progress' nếu nó là 'not-started'
        const savedStatuses = getSavedStatuses();
        const activeLessonId = `${courseId}_${currentLessonIndex}`;
        if (!savedStatuses[activeLessonId] || savedStatuses[activeLessonId] === 'not-started') {
          saveLessonStatus(activeLessonId, 'in-progress');
        }

        const data = await fetchCourseById(courseId);
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi gọi API.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [courseId, currentLessonIndex, getSavedStatuses, saveLessonStatus]);

  // Xử lý chuyển bài học thông qua điều hướng URL
  const handleSelectLesson = (index: number) => {
    if (!course || !courseId) return;
    navigate(`/courses/${courseId}/lessons/${index}`);
  };

  // Xử lý khi nhấn nút Đánh dấu hoàn thành
  const handleMarkAsCompleted = () => {
    if (!course || !courseId) return;

    const currentLesson = course.lessons[currentLessonIndex];
    const activeLessonId = `${course.id}_${currentLessonIndex}`;
    
    if (currentLesson.status !== 'completed') {
      saveLessonStatus(activeLessonId, 'completed');

      // Cập nhật trạng thái bài học con trong state cục bộ
      const updatedLessons = course.lessons.map((l, idx) => {
        if (idx === currentLessonIndex) {
          return { ...l, status: 'completed' as const };
        }
        return l;
      });

      const completedCount = updatedLessons.filter(l => l.status === 'completed').length;
      const newProgress = Math.round((completedCount / course.totalLessons) * 100);
      localStorage.setItem(`course_progress_${courseId}`, String(newProgress));

      let newStatus: Course['status'] = 'in-progress';
      if (newProgress === 100) newStatus = 'completed';

      setCourse({
        ...course,
        progress: newProgress,
        status: newStatus,
        lessons: updatedLessons
      });
    }
  };

  // Lấy thông tin user đăng nhập
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{"name": "Học viên", "email": "hocvien@example.com"}');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải nội dung bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !course || currentLessonIndex >= course.totalLessons) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="text-rose-500 text-lg font-bold">Lỗi tải dữ liệu</div>
          <p className="text-sm text-slate-655 dark:text-slate-400">{error || 'Không tìm thấy thông tin bài học.'}</p>
          <button 
            onClick={() => navigate(courseId ? `/courses/${courseId}` : '/courses')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Quay lại trang chi tiết khóa học
          </button>
        </div>
      </div>
    );
  }

  const lessons = course.lessons;
  const totalLessons = course.totalLessons;
  const currentLesson = lessons[currentLessonIndex];
  const isCurrentLessonCompleted = currentLesson.status === 'completed';
  const progressPercentage = course.progress;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans">
      
      {/* SIDEBAR: Lesson Playlist */}
      <aside className="w-full lg:w-80 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-colors duration-300 z-20">
        
        {/* Top Section */}
        <div>
          {/* Header Sidebar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider">Nội dung khóa học</span>
            </div>
            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-800 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

          {/* Progress bar tổng thể khóa học */}
          <div className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
            <ProgressBar 
              progress={progressPercentage} 
              label={`Tiến độ học tập (${lessons.filter(l => l.status === 'completed').length}/${totalLessons})`}
              size="sm"
            />
          </div>

          {/* Playlist list */}
          <div className="overflow-y-auto max-h-[250px] lg:max-h-[calc(100vh-220px)] p-3 space-y-2.5 scrollbar-thin">
            {lessons.map((lesson, index) => {
              const isActive = index === currentLessonIndex;
              const status = lesson.status;

              let lessonProgress = 0;
              let lessonProgressColor = 'bg-slate-200 dark:bg-slate-750';
              if (status === 'in-progress') {
                lessonProgress = 50;
                lessonProgressColor = 'bg-indigo-500 animate-pulse';
              } else if (status === 'completed') {
                lessonProgress = 100;
                lessonProgressColor = 'bg-emerald-500';
              }

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(index)}
                  className={`w-full flex flex-col p-3 rounded-xl transition-all text-left cursor-pointer group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center space-x-3 pr-2 min-w-0">
                      {/* Icon status chi tiết */}
                      <div className="shrink-0">
                        {status === 'completed' ? (
                          <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                        ) : status === 'in-progress' ? (
                          <Clock className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-550'}`} />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                        )}
                      </div>
                      {/* Title */}
                      <div className="truncate">
                        <p className={`text-[10px] font-bold ${isActive ? 'text-indigo-150' : 'text-slate-400'}`}>BÀI {lesson.order}</p>
                        <p className="text-xs font-semibold truncate leading-normal mt-0.5">{lesson.title.split(': ')[1] || lesson.title}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
                  </div>

                  {/* MINI PROGRESS BAR CHO TỪNG LESSON */}
                  <div className="w-full pl-8 mt-2 space-y-1">
                    <div className="h-1 w-full bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${lessonProgressColor}`}
                        style={{ width: `${lessonProgress}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                      isActive 
                        ? 'text-indigo-200' 
                        : status === 'completed' 
                          ? 'text-emerald-500 dark:text-emerald-400' 
                          : status === 'in-progress' 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-400'
                    }`}>
                      {status === 'completed' ? 'Đã học xong' : status === 'in-progress' ? 'Đang học (50%)' : 'Chưa bắt đầu'}
                    </span>
                  </div>

                </button>
              );
            })}
          </div>
        </div>

        {/* User Info & Back Button in sidebar footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 hidden lg:block">
          <div className="flex items-center space-x-3 px-1 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <div>
              <p className="text-xs font-bold text-slate-855 dark:text-slate-200 truncate">Học viên EduPortal</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-455 truncate">Đang trong bài học</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại khóa học</span>
          </button>
        </div>
      </aside>

      {/* MAIN SECTION: Lesson details */}
      <main className="flex-1 flex flex-col min-w-0 lg:pl-80 transition-colors duration-300">
        
        {/* TOP BAR / BREADCRUMB */}
        <Header 
          title={course.title}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userInfo={userInfo}
        />

        {/* LESSON DETAILS CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* Main Visual Card representation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300 flex flex-col md:flex-row gap-6 p-6">
            {/* Banner/Image */}
            <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Short course overview */}
            <div className="flex flex-col justify-between py-1 space-y-4 flex-1">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">
                  {course.kindOfCourse} • Level {course.level}
                </span>
                <h2 className="text-xl font-extrabold text-slate-855 dark:text-white">{course.title}</h2>
              </div>
              
              <div className="flex items-center gap-6 text-xs text-slate-555 dark:text-slate-400 font-medium flex-wrap">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Thời gian bài học: {currentLesson.duration} phút</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Bài học: {currentLessonIndex + 1} / {totalLessons}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Lesson Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 transition-colors duration-300">
            
            {/* Lesson Title & duration */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nội dung bài học</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-slate-855 dark:text-white">
                  Bài học {currentLesson.order}: {currentLesson.title.split(': ')[1] || currentLesson.title}
                </h3>
              </div>

              {/* Time count */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold shrink-0">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Thời lượng: {currentLesson.duration} phút</span>
              </div>
            </div>

            {/* Lesson description */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Mô tả chi tiết bài học</h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                {currentLesson.description}
              </p>
            </div>

            {/* Action buttons (Mark as completed + Back to course) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              
              {/* Back to course button */}
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="w-full sm:w-auto px-6 h-12 flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 transition-all cursor-pointer order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại khóa học</span>
              </button>

              {/* Mark as Completed / Completed status button */}
              <div className="w-full sm:w-auto order-1 sm:order-2">
                {isCurrentLessonCompleted ? (
                  <div className="w-full sm:w-auto px-6 h-12 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-455 rounded-xl text-sm font-bold flex items-center justify-center space-x-2.5">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>Bài học đã hoàn thành</span>
                  </div>
                ) : (
                  <button
                    onClick={handleMarkAsCompleted}
                    className="w-full sm:w-auto px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2.5 shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                    <span>Đánh dấu hoàn thành</span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Achievement popup card if 100% completed */}
          {progressPercentage === 100 && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Chúc mừng bạn!</span>
                </div>
                <h3 className="text-xl font-extrabold">Bạn đã hoàn thành 100% khóa học này!</h3>
                <p className="text-emerald-100 font-light text-xs sm:text-sm">Hãy tự hào về nỗ lực học tập không ngừng của mình ngày hôm nay.</p>
              </div>
              <button 
                onClick={() => navigate('/courses?showAchievements=true')}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Nhận chứng chỉ khóa học
              </button>
            </div>
          )}

        </div>

        {/* Footer for Mobile only */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:hidden flex justify-center transition-colors duration-300">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center space-x-2 px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại khóa học</span>
          </button>
        </div>

      </main>

    </div>
  );
};

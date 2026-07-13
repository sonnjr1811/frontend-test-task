import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '../../types/course';
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, 
  BookOpen, Sparkles, Sun, Moon,
  ChevronRight, Check, Award
} from 'lucide-react';

export const LessonDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State quản lý dữ liệu khóa học kiểu Course
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý bài học hiện tại đang chọn
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

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

  // Fetch thông tin chi tiết khóa học và map sang cấu trúc Course
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://dummyjson.com/recipes/${courseId}`);
        if (!res.ok) throw new Error('Không thể tải thông tin bài học từ API.');
        const data = await res.json();
        
        // 1. Ánh xạ kindOfCourse từ cuisine
        let kindOfCourse: Course['kindOfCourse'] = 'VSTEP';
        const cuisine = data.cuisine || '';
        if (['Italian', 'French', 'Greek'].includes(cuisine)) {
          kindOfCourse = 'IELTS';
        } else if (['Asian', 'Japanese', 'Thai', 'Pakistani', 'Indian'].includes(cuisine)) {
          kindOfCourse = 'TOEIC';
        } else if (['Mexican', 'Moroccan', 'American'].includes(cuisine)) {
          kindOfCourse = '4SKILLS';
        }

        // 2. Ánh xạ level từ difficulty
        let level: Course['level'] = 'MTC';
        if (data.difficulty === 'Easy') {
          level = 'S';
        } else if (data.difficulty === 'Medium') {
          level = 'Pres';
        } else if (data.difficulty === 'Hard') {
          level = 'TC';
        }

        // 3. Đọc map trạng thái chi tiết của từng bài học con từ localStorage
        const rawInstructions = data.instructions || [];
        const totalLessons = rawInstructions.length;
        const savedLessonsStatus = JSON.parse(
          localStorage.getItem(`lessons_status_${courseId}`) || '{}'
        );

        // Tự động chuyển bài học đầu tiên (active lúc khởi đầu) sang 'in-progress' nếu nó là 'not-started'
        const firstLessonId = `${data.id}_0`;
        if (totalLessons > 0 && (!savedLessonsStatus[firstLessonId] || savedLessonsStatus[firstLessonId] === 'not-started')) {
          savedLessonsStatus[firstLessonId] = 'in-progress';
          localStorage.setItem(`lessons_status_${courseId}`, JSON.stringify(savedLessonsStatus));
        }

        const lessons: Lesson[] = rawInstructions.map((inst: string, idx: number): Lesson => {
          const lessonId = `${data.id}_${idx}`;
          const status = (savedLessonsStatus[lessonId] || 'not-started') as Lesson['status'];
          const duration = Math.max(5, Math.round((data.prepTimeMinutes || 30) / totalLessons) + (idx % 3) * 2);

          return {
            id: lessonId,
            courseId: String(data.id),
            title: `Bài học ${idx + 1}: ${inst.split(',')[0]}`,
            duration,
            url: `https://example.com/lesson-${idx + 1}`,
            description: inst,
            status,
            order: idx + 1
          };
        });

        // Tính toán tiến trình % (chỉ dựa vào số bài học ở trạng thái 'completed')
        const completedCount = lessons.filter(l => l.status === 'completed').length;
        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        localStorage.setItem(`course_progress_${courseId}`, String(progress));

        let status: Course['status'] = 'not-started';
        if (progress === 100) {
          status = 'completed';
        } else if (progress > 0) {
          status = 'in-progress';
        }

        setCourse({
          id: String(data.id),
          title: `Khóa học: ${data.name}`,
          description: rawInstructions.join(' '),
          thumbnail: data.image,
          level,
          kindOfCourse,
          totalLessons,
          progress,
          status,
          lessons
        });
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi gọi API.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  // Xử lý chuyển bài học và tự động chuyển đổi trạng thái sang 'in-progress' nếu cần
  const handleSelectLesson = (index: number) => {
    if (!course || !courseId) return;

    const selectedLesson = course.lessons[index];
    const savedLessonsStatus = JSON.parse(
      localStorage.getItem(`lessons_status_${courseId}`) || '{}'
    );

    // Nếu bài học mới chọn đang ở trạng thái 'not-started', chuyển thành 'in-progress'
    if (selectedLesson.status === 'not-started') {
      savedLessonsStatus[selectedLesson.id] = 'in-progress';
      localStorage.setItem(`lessons_status_${courseId}`, JSON.stringify(savedLessonsStatus));

      const updatedLessons = course.lessons.map((l, idx) => {
        if (idx === index) {
          return { ...l, status: 'in-progress' as const };
        }
        return l;
      });

      setCourse({
        ...course,
        lessons: updatedLessons
      });
    }

    setCurrentLessonIndex(index);
  };

  // Xử lý khi nhấn nút Đánh dấu hoàn thành (Mark as Completed)
  const handleMarkAsCompleted = () => {
    if (!course || !courseId) return;

    const currentLesson = course.lessons[currentLessonIndex];
    const savedLessonsStatus = JSON.parse(
      localStorage.getItem(`lessons_status_${courseId}`) || '{}'
    );
    
    if (currentLesson.status !== 'completed') {
      savedLessonsStatus[currentLesson.id] = 'completed';
      localStorage.setItem(`lessons_status_${courseId}`, JSON.stringify(savedLessonsStatus));

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-indigo-650 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải nội dung bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="text-rose-500 text-lg font-bold">Lỗi tải dữ liệu</div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{error || 'Không tìm thấy thông tin khóa học.'}</p>
          <button 
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  const lessons = course.lessons;
  const totalLessons = course.totalLessons;
  const currentLesson = lessons[currentLessonIndex];
  
  // Trạng thái hoàn thành của bài học hiện tại đang chọn
  const isCurrentLessonCompleted = currentLesson.status === 'completed';

  // Tính toán tiến trình hiện tại để hiển thị trên UI
  const progressPercentage = course.progress;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans">
      
      {/* SIDEBAR: Lesson Playlist (Bên trái trên desktop) */}
      <aside className="w-full lg:w-80 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-colors duration-300">
        
        {/* Top Section */}
        <div>
          {/* Header Sidebar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider">Nội dung khóa học</span>
            </div>
            {/* Theme toggle (Touch target >= 44px) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

          {/* Progress bar tổng thể khóa học */}
          <div className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Tiến độ học tập</span>
              <span>{progressPercentage}% ({lessons.filter(l => l.status === 'completed').length}/{totalLessons})</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Playlist list */}
          <div className="overflow-y-auto max-h-[250px] lg:max-h-[calc(100vh-220px)] p-3 space-y-2.5 scrollbar-thin">
            {lessons.map((lesson, index) => {
              const isActive = index === currentLessonIndex;
              const status = lesson.status;

              // Định nghĩa tỷ lệ % và màu sắc cho thanh tiến độ từng lesson
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
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 stroke-[1.5] stroke-dasharray-[2]" />
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
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                            ? 'text-indigo-650 dark:text-indigo-400' 
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
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">Học viên EduPortal</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-450 truncate">Đang trong bài học</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard</span>
          </button>
        </div>
      </aside>

      {/* MAIN SECTION: Lesson details */}
      <main className="flex-1 flex flex-col min-w-0 transition-colors duration-300">
        
        {/* TOP BAR / BREADCRUMB */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 transition-colors duration-300">
          <div className="flex items-center space-x-4 min-w-0">
            {/* Back button top bar (Touch target >= 44px) */}
            <button 
              onClick={() => navigate('/courses')}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <span className="text-xs font-bold text-indigo-655 dark:text-indigo-400 uppercase tracking-wider">{course.kindOfCourse} Course (Level: {course.level})</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-855 dark:text-white truncate leading-tight mt-0.5">{course.title}</h1>
            </div>
          </div>
        </header>

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
            <div className="flex flex-col justify-between py-1 space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-lg text-xs font-bold">
                  {course.kindOfCourse} • Level {course.level}
                </span>
                <h2 className="text-xl font-extrabold text-slate-850 dark:text-white">{course.title}</h2>
              </div>
              
              <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-indigo-505" />
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
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
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
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto px-6 h-12 flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-850 hover:text-slate-800 transition-all cursor-pointer order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại khóa học</span>
              </button>

              {/* Mark as Completed / Completed status button */}
              <div className="w-full sm:w-auto order-1 sm:order-2">
                {isCurrentLessonCompleted ? (
                  <div className="w-full sm:w-auto px-6 h-12 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-center space-x-2.5">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>Bài học đã hoàn thành</span>
                  </div>
                ) : (
                  <button
                    onClick={handleMarkAsCompleted}
                    className="w-full sm:w-auto px-8 h-12 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2.5 shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer"
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
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-700 hover:bg-slate-55 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Nhận chứng chỉ Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Footer for Mobile only */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:hidden flex justify-center transition-colors duration-300">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Dashboard</span>
          </button>
        </div>

      </main>

    </div>
  );
};

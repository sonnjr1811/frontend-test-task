import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '../../types/course';
import { 
  ArrowLeft, Clock, PlayCircle, BookOpen, CheckCircle2, 
  Circle, ChevronRight, Award, Sun, Moon, Sparkles, Star
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State quản lý thông tin khóa học
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch thông tin khóa học và ánh xạ tương tự Courses
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://dummyjson.com/recipes/${courseId}`);
        if (!res.ok) throw new Error('Không thể kết nối API để tải thông tin khóa học.');
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

        // Tính toán lại tiến trình %
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
        setError(err.message || 'Đã xảy ra lỗi khi tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans pb-12">
        {/* HEADER BAR SKELETON */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </header>

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans pb-12">
      
      {/* HEADER BAR */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-10 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/courses')}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer"
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
            <span className="absolute top-4 left-4 px-2.5 py-1 bg-indigo-650/90 dark:bg-indigo-600/90 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
              {course.kindOfCourse} Course
            </span>
          </div>

          {/* Details right side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${
                  course.level === 'S' 
                    ? 'bg-emerald-600/90' 
                    : course.level === 'Pres' 
                      ? 'bg-amber-600/90' 
                      : 'bg-rose-600/90'
                }`}>
                  Level: {course.level}
                </span>
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
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-400">
                <span>Tiến trình hoàn thành khóa học</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Main Action Button (Touch target >= 44px) */}
            <button
              onClick={handleStartLearning}
              className="h-11 w-full sm:w-52 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2.5 shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-150 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-indigo-200" />
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
            {course.lessons.map((lesson, idx) => {
              const status = lesson.status;
              
              // Cấu hình tỷ lệ % tiến trình của từng lesson
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
                  onClick={() => navigate(`/courses/${course.id}/lessons/${idx}`)}
                  className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-850 border border-slate-200/60 hover:border-slate-200 dark:border-slate-800/80 rounded-2xl transition-all duration-200 text-left group cursor-pointer gap-4"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    {/* Index / Order circle */}
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/30 dark:group-hover:text-indigo-400 transition-colors">
                      {lesson.order}
                    </div>

                    <div className="truncate space-y-1">
                      <p className="text-xs font-semibold text-slate-450 dark:text-slate-400">BÀI HỌC CƠ BẢN</p>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {lesson.title.split(': ')[1] || lesson.title}
                      </h4>
                    </div>
                  </div>

                  {/* Actions & Status row (Touch targets >= 44px) */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-850">
                    <span className="flex items-center space-x-1.5 text-xs text-slate-550 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{lesson.duration} phút</span>
                    </span>

                    {/* Lesson progress & status */}
                    <div className="flex items-center space-x-4 min-w-36 justify-end">
                      <div className="hidden sm:block text-right">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          status === 'completed' 
                            ? 'text-emerald-500 dark:text-emerald-400' 
                            : status === 'in-progress' 
                              ? 'text-indigo-650 dark:text-indigo-400' 
                              : 'text-slate-400'
                        }`}>
                          {status === 'completed' ? 'Đã học xong' : status === 'in-progress' ? 'Đang học (50%)' : 'Chưa học'}
                        </span>
                        
                        {/* Progress bar mini cho từng bài học */}
                        <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${lessonProgressColor}`}
                            style={{ width: `${lessonProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Icon trạng thái */}
                      <div>
                        {status === 'completed' ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : status === 'in-progress' ? (
                          <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 flex items-center justify-center">
                            <Circle className="w-3.5 h-3.5 stroke-[1.5]" />
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
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
              onClick={() => navigate('/courses')}
              className="w-full sm:w-auto h-11 px-5 bg-white text-emerald-700 hover:bg-slate-55 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              Xem chứng nhận
            </button>
          </div>
        )}

      </main>

    </div>
  );
};

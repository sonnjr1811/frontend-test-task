import React from 'react';
import type { Course } from '../types/course';
import { BookOpen, Play } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: Course;
  onNavigateDetail: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onNavigateDetail }) => {
  // Hàm xác định màu sắc và text cho badge trạng thái khóa học (Bonus)
  const getStatusBadge = () => {
    switch (course.status) {
      case 'completed':
        return (
          <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-emerald-600/90 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-sm">
            Đã hoàn thành
          </span>
        );
      case 'in-progress':
        return (
          <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-sky-600/90 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-sm">
            Đang học
          </span>
        );
      case 'not-started':
      default:
        return (
          <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-slate-600/90 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-sm">
            Chưa học
          </span>
        );
    }
  };

  return (
    <div 
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
          <span className="absolute top-4 left-4 px-2.5 py-1 bg-indigo-600/90 dark:bg-indigo-600/90 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-sm">
            {course.kindOfCourse}
          </span>
          {/* Level Badge */}
          <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm text-white ${
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
        <ProgressBar progress={course.progress} label="Tiến độ học" size="md" />

        {/* Action Button (Touch target >= 44px) */}
        <button
          onClick={() => onNavigateDetail(course.id)}
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
  );
};

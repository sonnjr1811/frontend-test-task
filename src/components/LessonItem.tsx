import React from 'react';
import type { Lesson } from '../types/course';
import { Clock, ChevronRight, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  thumbnail: string;
  onNavigateLesson: (index: number) => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({ 
  lesson, 
  index, 
  thumbnail, 
  onNavigateLesson 
}) => {
  const status = lesson.status;

  // Cấu hình tỷ lệ % tiến trình của từng lesson
  let lessonProgress = 0;
  let lessonProgressColor = 'bg-slate-200 dark:bg-slate-750';
  if (status === 'in-progress') {
    lessonProgress = 50;
    lessonProgressColor = 'bg-indigo-500';
  } else if (status === 'completed') {
    lessonProgress = 100;
    lessonProgressColor = 'bg-emerald-500';
  }

  return (
    <button
      onClick={() => onNavigateLesson(index)}
      className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-850 border border-slate-200/60 hover:border-slate-200 dark:border-slate-800/80 rounded-2xl transition-all duration-200 text-left group cursor-pointer gap-4"
    >
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        {/* Index / Order circle */}
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/30 dark:group-hover:text-indigo-400 transition-colors">
          {lesson.order}
        </div>

        {/* Mock Video Thumbnail */}
        <div className="w-20 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hidden sm:block">
          <img 
            src={thumbnail} 
            alt={lesson.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
            <PlayCircle className="w-5 h-5 text-white/90 drop-shadow" />
          </div>
        </div>

        <div className="truncate space-y-1">
          <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider">BÀI HỌC CƠ BẢN</p>
          <h4 className="text-sm font-bold text-slate-855 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                  ? 'text-indigo-600 dark:text-indigo-400' 
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
              <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
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
};

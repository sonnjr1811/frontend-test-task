import { useCallback } from 'react';
import type { Lesson } from '../types/course';

export const useProgress = (courseId: string) => {
  const getSavedStatuses = useCallback(() => {
    return JSON.parse(localStorage.getItem(`lessons_status_${courseId}`) || '{}');
  }, [courseId]);

  const saveLessonStatus = useCallback((lessonId: string, status: Lesson['status']) => {
    const saved = getSavedStatuses();
    saved[lessonId] = status;
    localStorage.setItem(`lessons_status_${courseId}`, JSON.stringify(saved));
  }, [courseId, getSavedStatuses]);

  return { getSavedStatuses, saveLessonStatus };
};

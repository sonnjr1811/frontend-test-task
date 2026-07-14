import type { Course, Lesson } from '../types/course';

export const mapRecipeToCourse = (recipe: any): Course => {
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
  
  // Đọc trạng thái bài học từ localStorage
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

  // Tính toán lại tiến trình %
  const completedCount = lessons.filter(l => l.status === 'completed').length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  // Trạng thái khóa học (not-started | in-progress | completed)
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
};

export const fetchCourses = async (): Promise<Course[]> => {
  const res = await fetch('https://dummyjson.com/recipes?limit=50');
  if (!res.ok) throw new Error('Không thể kết nối API để tải dữ liệu khóa học.');
  const data = await res.json();
  return data.recipes.map(mapRecipeToCourse);
};

export const fetchCourseById = async (courseId: string): Promise<Course> => {
  const res = await fetch(`https://dummyjson.com/recipes/${courseId}`);
  if (!res.ok) throw new Error('Không thể kết nối API để tải thông tin khóa học.');
  const data = await res.json();
  return mapRecipeToCourse(data);
};

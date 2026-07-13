import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Courses } from '../pages/Courses/Courses';
import { CourseDetail } from '../pages/Courses/CourseDetail.tsx';
import { LessonDetail } from '../pages/Courses/LessonDetail.tsx';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn công khai */}
        <Route path="/auth/login" element={<Login />} />

        {/* Đường dẫn bảo vệ bằng ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lessons/:lessonIndex" element={<LessonDetail />} />
        </Route>

        {/* Các điều hướng mặc định */}
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="*" element={<div className="p-8 text-2xl text-red-500 text-center font-bold">404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
};
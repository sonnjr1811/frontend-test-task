import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Courses } from '../pages/Courses/Courses';
import { LessonDetail } from '../pages/Courses/LessonDetail';
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
          <Route path="/courses/:courseId" element={<LessonDetail />} />
        </Route>

        {/* Các điều hướng mặc định */}
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="*" element={<div className="p-8 text-2xl text-red-500">404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
};
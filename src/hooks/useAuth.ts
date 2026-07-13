import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Kiểm tra tài khoản mẫu offline trước
      if (email === 'demo@gmail.com' && password === '123456') {
        localStorage.setItem('auth_token', 'mock_jwt_token_demo_123');
        localStorage.setItem('user_info', JSON.stringify({ email, name: 'Student Demo' }));
        navigate('/courses', { replace: true });
        return;
      }

      // 2. Thử đăng nhập online qua API của dummyjson
      // Gọi API lấy danh sách user để tìm user khớp email
      const usersRes = await fetch('https://dummyjson.com/users?limit=100');
      if (!usersRes.ok) throw new Error('Không thể kết nối với dịch vụ xác thực.');
      const usersData = await usersRes.json();
      
      // Tìm user có email khớp (không phân biệt hoa thường)
      const matchedUser = usersData.users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!matchedUser) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
      }

      // Gửi yêu cầu đăng nhập lấy token thực tế bằng username
      const loginRes = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: matchedUser.username,
          password: password,
          expiresInMins: 60,
        })
      });

      if (!loginRes.ok) {
        throw new Error('Mật khẩu không chính xác.');
      }

      const loginData = await loginRes.json();
      
      // Lưu token và thông tin user thật nhận từ API
      localStorage.setItem('auth_token', loginData.accessToken || 'mock_token_from_api');
      localStorage.setItem('user_info', JSON.stringify({
        email: loginData.email || email,
        name: `${loginData.firstName} ${loginData.lastName}`
      }));
      
      // Chuyển hướng sang trang danh sách khóa học
      navigate('/courses', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    navigate('/auth/login', { replace: true });
  };

  return { login, logout, loading, error };
};
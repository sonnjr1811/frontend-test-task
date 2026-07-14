export const validateEmail = (val: string): string => {
  if (!val) {
    return 'Email không được để trống';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) {
    return 'Email không đúng định dạng (VD: example@gmail.com)';
  }
  return '';
};

export const validatePassword = (val: string): string => {
  if (!val) {
    return 'Mật khẩu không được để trống';
  }
  if (val.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return '';
};

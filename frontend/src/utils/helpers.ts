export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const validateCSVFile = (file: File): { isValid: boolean; message?: string } => {
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    return { isValid: false, message: 'CSV 파일만 업로드 가능합니다.' };
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    return { isValid: false, message: '파일 크기는 10MB를 초과할 수 없습니다.' };
  }
  
  return { isValid: true };
};
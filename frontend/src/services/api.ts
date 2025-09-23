import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 토큰 관리
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
  // axios 기본 헤더에 토큰 추가
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  delete apiClient.defaults.headers.common['Authorization'];
};

// 앱 초기화 시 토큰 확인
const initializeAuth = (): void => {
  const token = getAuthToken();
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// 앱 시작시 인증 초기화
initializeAuth();

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 토큰 삭제 및 로그인 페이지로 리다이렉트
      removeAuthToken();
      window.location.href = '/login';
    }
    
    if (error.response) {
      // 서버 응답 에러
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // 네트워크 에러
      console.error('Network Error:', error.request);
    } else {
      // 기타 에러
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 인터페이스 정의
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface DataSummary {
  total_rows: number;
  total_columns: number;
  numeric_columns: string[];
  categorical_columns: string[];
  missing_values: { [key: string]: number };
  data_types: { [key: string]: string };
}

export interface ProcessingConfig {
  preprocessing_config: {
    missing_strategy: string;
    outlier_strategy: string;
    column_types: { [key: string]: string };
  };
  augmentation_config: {
    method: string;
    target_column?: string;
    augmentation_ratio?: number;
    target_rows?: number;
    k_neighbors?: number;
    sampling_strategy?: string;
  };
}

export interface ProcessingResponse {
  success: boolean;
  message: string;
  original_rows: number;
  augmented_rows: number;
  increase_ratio: number;
  processing_time: number;
  summary: DataSummary;
}

export const authAPI = {
  // 회원가입
  register: async (userData: UserCreate): Promise<User> => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  // 로그인
  login: async (credentials: UserLogin): Promise<Token> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    const token = response.data;
    setAuthToken(token.access_token);
    return token;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
    removeAuthToken();
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // 인증 상태 확인
  isAuthenticated: (): boolean => {
    return getAuthToken() !== null;
  },

  // 토큰 관리 함수들 export
  getToken: getAuthToken,
  setToken: setAuthToken,
  removeToken: removeAuthToken,
};

export const dataAPI = {
  // 파일 업로드
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // 데이터 처리
  processData: async (config: ProcessingConfig): Promise<ProcessingResponse> => {
    const response = await apiClient.post('/api/data/process', config);
    return response.data;
  },

  // 처리된 데이터 조회
  getProcessedData: async (page: number = 0, pageSize: number = 100) => {
    const response = await apiClient.get(`/api/data/processed`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // 데이터 다운로드
  downloadData: async (encoding: string = 'utf-8') => {
    const response = await apiClient.get('/api/data/download', {
      params: { encoding },
      responseType: 'blob',
    });
    
    // 파일 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    let filename = 'augmented_data.csv';
    if (encoding === 'cp949') {
      filename = 'augmented_data_excel.csv';
    } else if (encoding === 'utf-8-bom') {
      filename = 'augmented_data_excel_utf8.csv';
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // 시각화 생성
  createVisualization: async (columnName: string, chartType: string = 'distribution') => {
    const response = await apiClient.post('/api/data/visualize', {
      column_name: columnName,
      chart_type: chartType,
    });
    return response.data;
  },

  // 통계 정보 조회
  getStatistics: async () => {
    const response = await apiClient.get('/api/data/statistics');
    return response.data;
  },

  // 컬럼 정보 조회
  getColumns: async () => {
    const response = await apiClient.get('/api/data/columns');
    return response.data;
  },

  // 헬스 체크
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
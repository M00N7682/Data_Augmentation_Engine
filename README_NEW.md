# Data Augmentation Engine

CSV 데이터 증강 엔진 - React + FastAPI 웹 애플리케이션

## 프로젝트 구조

```
Data_Augmentation/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── api/            # API 라우터
│   │   ├── models/         # 데이터 모델
│   │   ├── services/       # 비즈니스 로직
│   │   └── main.py         # FastAPI 앱
│   ├── requirements.txt    # Python 의존성
│   └── run.py             # 서버 실행 스크립트
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 클라이언트
│   │   └── utils/         # 유틸리티 함수
│   ├── package.json       # Node.js 의존성
│   └── public/            # 정적 파일
├── data_augmentation.py    # 기존 데이터 증강 로직
├── data_preprocessing.py   # 기존 전처리 로직
├── visualization.py        # 기존 시각화 로직
└── README.md              # 이 파일
```

## 기능

- **데이터 업로드**: CSV 파일 업로드 및 자동 인코딩 감지
- **데이터 전처리**: 결측치 처리, 이상치 처리, 데이터 타입 변환
- **데이터 증강**: SMOTE, Gaussian Copula, Bayesian Network 방법 지원
- **시각화**: 원본 vs 증강 데이터 분포 비교
- **데이터 다운로드**: UTF-8, Excel용 (CP949) 형식 지원

## 설치 및 실행

### 1. 백엔드 설정

```bash
cd backend

# 가상환경 생성 (권장)
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python run.py
```

백엔드 서버는 http://localhost:8000 에서 실행됩니다.
- API 문서: http://localhost:8000/docs

### 2. 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

프론트엔드는 http://localhost:3000 에서 실행됩니다.

### 3. 전체 실행 (Windows)

프로젝트 루트에서:

```bash
# 백엔드와 프론트엔드 동시 실행
start-servers.bat
```

## 사용 방법

1. **데이터 업로드**: CSV 파일을 업로드합니다.
2. **설정**: 데이터 타입, 전처리 옵션, 증강 방법을 설정합니다.
3. **처리**: 데이터 증강을 실행합니다.
4. **결과**: 결과를 확인하고 다운로드합니다.

## API 엔드포인트

- `POST /api/data/upload` - 파일 업로드
- `POST /api/data/process` - 데이터 처리
- `GET /api/data/processed` - 처리된 데이터 조회
- `GET /api/data/download` - 데이터 다운로드
- `POST /api/data/visualize` - 시각화 생성
- `GET /api/data/statistics` - 통계 정보 조회

## 기술 스택

### 백엔드
- FastAPI
- Pandas, NumPy
- Scikit-learn, Imbalanced-learn
- Plotly (시각화)

### 프론트엔드
- React 18 (TypeScript)
- Ant Design
- Axios
- React-Plotly.js

## 문의

에러신고 및 문의: dfjk71@khu.ac.kr
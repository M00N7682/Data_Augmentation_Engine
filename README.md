# 📊 CSV 데이터 증강 플랫폼

CSV 데이터를 업로드하여 다양한 통계적/규칙 기반 방법으로 데이터를 증강시켜주는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 데이터 증강 방법
- **SMOTE (Synthetic Minority Over-sampling Technique)**: 불균형 데이터셋의 소수 클래스를 오버샘플링
- **Gaussian Copula**: 가우시안 혼합 모델을 사용한 연속형 데이터 증강
- **Bayesian Network**: 통계적 의존성을 고려한 데이터 생성

### 전처리 기능
- **결측치 처리**: 평균, 중앙값, 최빈값, 삭제, 보간법 지원
- **이상치 처리**: IQR, Z-score, Isolation Forest 방법 지원
- **데이터 타입 설정**: 수치형, 범주형, 날짜형, 텍스트 타입 지원

### 시각화 기능
- 원본 vs 증강된 데이터 분포 비교
- 통계 요약 테이블
- 박스 플롯을 통한 분포 비교
- 데이터 품질 지표 모니터링

## 📋 요구사항

Python 3.8 이상이 필요합니다.

```bash
pip install -r requirements.txt
```

## 🏃‍♂️ 실행 방법

```bash
streamlit run app.py
```

브라우저에서 `http://localhost:8501`로 접속하여 사용할 수 있습니다.

## 🎯 사용 방법

1. **데이터 업로드**: 왼쪽 패널에서 CSV 파일을 업로드합니다.
2. **데이터 타입 설정**: 각 컬럼의 데이터 타입을 지정합니다.
3. **전처리 설정**: 결측치와 이상치 처리 방법을 선택합니다.
4. **증강 방법 선택**: SMOTE, Gaussian Copula, Bayesian Network 중 선택합니다.
5. **파라미터 조정**: 선택한 방법에 따라 관련 파라미터를 설정합니다.
6. **실행**: "데이터 증강 실행" 버튼을 클릭합니다.
7. **결과 확인**: 오른쪽 패널에서 증강된 데이터와 시각화 결과를 확인합니다.
8. **다운로드**: 필요시 증강된 데이터를 CSV 형태로 다운로드합니다.

## 📁 프로젝트 구조

```
Data_Augmentation/
├── app.py                    # 메인 Streamlit 애플리케이션
├── data_preprocessing.py     # 데이터 전처리 모듈
├── data_augmentation.py      # 데이터 증강 모듈
├── visualization.py          # 시각화 모듈
├── requirements.txt          # 필요한 패키지 목록
└── README.md                # 프로젝트 설명서
```

## ⚙️ 기술 스택

- **Frontend**: Streamlit
- **Backend**: Python
- **데이터 처리**: Pandas, NumPy
- **기계학습**: Scikit-learn, Imbalanced-learn
- **시각화**: Plotly, Matplotlib, Seaborn
- **통계**: SciPy

## 🔧 고급 설정

### SMOTE 파라미터
- `k_neighbors`: 근접 이웃의 수 (기본값: 5)
- `sampling_strategy`: 샘플링 전략 (auto, minority, not majority, all)

### Gaussian Copula 파라미터
- `augmentation_ratio`: 원본 데이터 대비 증강 비율 (기본값: 1.0)

### Bayesian Network 파라미터
- `augmentation_ratio`: 원본 데이터 대비 증강 비율 (기본값: 1.0)

## 📊 지원하는 데이터 타입

- **수치형 (Numeric)**: 연속형 및 이산형 수치 데이터
- **범주형 (Categorical)**: 명목형 및 순서형 범주 데이터
- **날짜형 (Datetime)**: 날짜 및 시간 데이터
- **텍스트 (Text)**: 문자열 데이터

## ⚠️ 주의사항

- 큰 데이터셋의 경우 처리 시간이 오래 걸릴 수 있습니다.
- SMOTE 방법은 분류 문제에 특화되어 있으므로 타겟 컬럼이 필요합니다.
- 메모리 부족 시 더 작은 증강 비율을 사용해 보세요.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해 주세요.

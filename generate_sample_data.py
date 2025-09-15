import pandas as pd
import numpy as np

# 샘플 데이터 생성 스크립트
np.random.seed(42)

# 100개의 샘플 데이터 생성
n_samples = 100

data = {
    'age': np.random.randint(18, 80, n_samples),
    'income': np.random.normal(50000, 15000, n_samples),
    'education': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n_samples, p=[0.4, 0.3, 0.2, 0.1]),
    'city': np.random.choice(['Seoul', 'Busan', 'Daegu', 'Incheon'], n_samples, p=[0.5, 0.2, 0.2, 0.1]),
    'satisfaction_score': np.random.randint(1, 11, n_samples),
    'is_married': np.random.choice([True, False], n_samples, p=[0.6, 0.4])
}

# 일부 결측값 추가
missing_indices = np.random.choice(n_samples, 10, replace=False)
for i in missing_indices:
    col = np.random.choice(['income', 'education'])
    data[col][i] = np.nan if col == 'income' else None

df = pd.DataFrame(data)

# CSV 파일로 저장
df.to_csv('sample_data.csv', index=False)
print("샘플 데이터가 'sample_data.csv' 파일로 저장되었습니다.")
print(f"데이터 크기: {df.shape}")
print("\n데이터 미리보기:")
print(df.head())
print("\n데이터 정보:")
print(df.info())

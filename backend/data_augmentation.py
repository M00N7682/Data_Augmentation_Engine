import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from scipy.stats import multivariate_normal
from typing import Optional, Union, Dict, Any
import warnings
warnings.filterwarnings('ignore')

class DataAugmentor:
    """
    데이터 증강을 담당하는 클래스
    SMOTE, Gaussian Copula, Bayesian Network 등의 방법을 지원
    """
    
    def __init__(
        self,
        method: str = "smote",
        target_column: Optional[str] = None,
        augmentation_ratio: float = 1.0,
        target_rows: Optional[int] = None,
        random_state: int = 42,
        **kwargs
    ):
        """
        Args:
            method: 증강 방법 ('smote', 'gaussian_copula', 'bayesian_network')
            target_column: SMOTE용 타겟 컬럼 (분류 문제에서 사용)
            augmentation_ratio: 증강 비율 (원본 대비)
            target_rows: 목표 총 행 수 (augmentation_ratio 대신 사용 가능)
            random_state: 랜덤 시드
            **kwargs: 각 방법별 추가 파라미터
        """
        self.method = method.lower()
        self.target_column = target_column
        self.target_rows = target_rows
        self.augmentation_ratio = augmentation_ratio
        self.random_state = random_state
        self.kwargs = kwargs
        
        self.model = None
        self.label_encoders = {}
        self.original_dtypes = {}
        
    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """데이터에 맞춰 모델을 학습하고 증강된 데이터를 반환"""
        data = data.copy()
        self.original_dtypes = data.dtypes.to_dict()
        
        if self.method == "smote":
            return self._smote_augmentation(data)
        elif self.method == "gaussian_copula":
            return self._gaussian_copula_augmentation(data)
        elif self.method == "bayesian_network":
            return self._bayesian_network_augmentation(data)
        else:
            raise ValueError(f"Unsupported augmentation method: {self.method}")
    
    def _smote_augmentation(self, data: pd.DataFrame) -> pd.DataFrame:
        """SMOTE를 사용한 데이터 증강"""
        if self.target_column is None:
            raise ValueError("SMOTE requires a target column")
        
        if self.target_column not in data.columns:
            raise ValueError(f"Target column '{self.target_column}' not found in data")
        
        # 특성과 타겟 분리
        X = data.drop(columns=[self.target_column])
        y = data[self.target_column]
        
        # 범주형 변수 인코딩
        X_encoded = X.copy()
        for column in X.columns:
            if X[column].dtype == 'object' or X[column].dtype.name == 'category':
                le = LabelEncoder()
                X_encoded[column] = le.fit_transform(X[column].astype(str))
                self.label_encoders[column] = le
        
        # 타겟 변수 인코딩
        if y.dtype == 'object' or y.dtype.name == 'category':
            target_le = LabelEncoder()
            y_encoded = target_le.fit_transform(y.astype(str))
            self.label_encoders[self.target_column] = target_le
        else:
            y_encoded = y
            target_le = None
        
        # SMOTE 적용
        smote_params = {
            'random_state': self.random_state,
            'k_neighbors': self.kwargs.get('k_neighbors', 5),
            'sampling_strategy': self.kwargs.get('sampling_strategy', 'auto')
        }
        
        smote = SMOTE(**smote_params)
        X_resampled, y_resampled = smote.fit_resample(X_encoded, y_encoded)
        
        # 데이터프레임으로 변환
        X_resampled_df = pd.DataFrame(X_resampled, columns=X_encoded.columns)
        
        # 범주형 변수 디코딩
        for column, le in self.label_encoders.items():
            if column != self.target_column:
                X_resampled_df[column] = le.inverse_transform(
                    X_resampled_df[column].astype(int)
                )
        
        # 타겟 변수 디코딩
        if target_le is not None:
            y_resampled = target_le.inverse_transform(y_resampled)
        
        # 결과 결합
        result = X_resampled_df.copy()
        result[self.target_column] = y_resampled
        
        # 컬럼 순서 복원
        result = result[data.columns]
        
        return result
    
    def _gaussian_copula_augmentation(self, data: pd.DataFrame) -> pd.DataFrame:
        """Gaussian Copula를 사용한 데이터 증강 (간단한 구현)"""
        try:
            # 수치형 컬럼만 선택
            numeric_data = data.select_dtypes(include=[np.number])
            categorical_data = data.select_dtypes(exclude=[np.number])
            
            if len(numeric_data.columns) == 0:
                print("Warning: No numeric columns found for Gaussian Copula")
                return data
            
            # 수치형 데이터에 대해 Gaussian Mixture Model 적용
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(numeric_data)
            
            # Gaussian Mixture Model 학습
            n_components = min(5, len(data) // 10)  # 적절한 컴포넌트 수 설정
            if n_components < 1:
                n_components = 1
                
            gmm = GaussianMixture(n_components=n_components, random_state=self.random_state)
            gmm.fit(scaled_data)
            
            # 새로운 샘플 생성
            if self.target_rows is not None:
                num_samples = max(0, self.target_rows - len(data))
            else:
                num_samples = int(len(data) * self.augmentation_ratio)
            
            if num_samples <= 0:
                return data
                
            synthetic_scaled = gmm.sample(num_samples)[0]
            
            # 스케일링 역변환
            synthetic_numeric = scaler.inverse_transform(synthetic_scaled)
            synthetic_numeric_df = pd.DataFrame(synthetic_numeric, columns=numeric_data.columns)
            
            # 범주형 데이터 처리 (원본에서 랜덤 샘플링)
            if len(categorical_data.columns) > 0:
                synthetic_categorical = categorical_data.sample(
                    n=num_samples, 
                    replace=True, 
                    random_state=self.random_state
                ).reset_index(drop=True)
                
                # 합치기
                synthetic_data = pd.concat([synthetic_numeric_df, synthetic_categorical], axis=1)
            else:
                synthetic_data = synthetic_numeric_df
            
            # 컬럼 순서 맞추기
            synthetic_data = synthetic_data[data.columns]
            
            # 원본 데이터와 합치기
            result = pd.concat([data, synthetic_data], ignore_index=True)
            
            self.model = {'scaler': scaler, 'gmm': gmm}
            return result
            
        except Exception as e:
            print(f"Error in Gaussian Copula augmentation: {e}")
            return data
    
    def _bayesian_network_augmentation(self, data: pd.DataFrame) -> pd.DataFrame:
        """Bayesian Network 기반 데이터 증강 (간단한 통계적 구현)"""
        try:
            # 각 컬럼의 통계 정보 계산
            column_stats = {}
            
            for column in data.columns:
                if data[column].dtype in ['int64', 'float64']:
                    # 수치형: 평균, 표준편차
                    column_stats[column] = {
                        'type': 'numeric',
                        'mean': data[column].mean(),
                        'std': data[column].std(),
                        'min': data[column].min(),
                        'max': data[column].max()
                    }
                else:
                    # 범주형: 확률 분포
                    value_counts = data[column].value_counts(normalize=True)
                    column_stats[column] = {
                        'type': 'categorical',
                        'probabilities': value_counts.to_dict(),
                        'values': value_counts.index.tolist()
                    }
            
            # 새로운 샘플 생성
            if self.target_rows is not None:
                num_samples = max(0, self.target_rows - len(data))
            else:
                num_samples = int(len(data) * self.augmentation_ratio)
            
            if num_samples <= 0:
                return data
                
            synthetic_data = []
            
            for _ in range(num_samples):
                sample = {}
                for column, stats in column_stats.items():
                    if stats['type'] == 'numeric':
                        # 정규분포에서 샘플링
                        value = np.random.normal(stats['mean'], stats['std'])
                        # 범위 제한
                        value = np.clip(value, stats['min'], stats['max'])
                        sample[column] = value
                    else:
                        # 범주형은 확률에 따라 샘플링
                        values = stats['values']
                        probs = [stats['probabilities'][v] for v in values]
                        sample[column] = np.random.choice(values, p=probs)
                
                synthetic_data.append(sample)
            
            synthetic_df = pd.DataFrame(synthetic_data)
            
            # 원본 데이터와 합치기
            result = pd.concat([data, synthetic_df], ignore_index=True)
            
            self.model = column_stats
            return result
            
        except Exception as e:
            print(f"Error in Bayesian Network augmentation: {e}")
            return data
    
    def generate_samples(self, num_samples: int) -> pd.DataFrame:
        """학습된 모델로 새로운 샘플 생성"""
        if self.model is None:
            raise ValueError("Model not fitted. Call fit_transform first.")
        
        if self.method == "smote":
            raise NotImplementedError("SMOTE does not support standalone sample generation")
        
        return self.model.sample(num_samples)
    
    def get_augmentation_summary(self) -> Dict[str, Any]:
        """증강 요약 정보 반환"""
        return {
            "method": self.method,
            "target_column": self.target_column,
            "augmentation_ratio": self.augmentation_ratio,
            "target_rows": self.target_rows,
            "random_state": self.random_state,
            "additional_params": self.kwargs
        }

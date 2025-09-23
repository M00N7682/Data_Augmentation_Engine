import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import IsolationForest
from scipy import stats
from typing import Dict, Optional, Any
import warnings
warnings.filterwarnings('ignore')

class DataPreprocessor:
    """
    데이터 전처리를 담당하는 클래스
    결측치 처리, 이상치 처리, 데이터 타입 변환 등을 수행
    """
    
    def __init__(
        self,
        missing_strategy: str = "mean",
        outlier_strategy: str = "none",
        column_types: Optional[Dict[str, str]] = None
    ):
        """
        Args:
            missing_strategy: 결측치 처리 방법 ('mean', 'median', 'mode', 'drop', 'interpolate')
            outlier_strategy: 이상치 처리 방법 ('none', 'iqr', 'zscore', 'isolation_forest')
            column_types: 각 컬럼의 데이터 타입 정보
        """
        self.missing_strategy = missing_strategy
        self.outlier_strategy = outlier_strategy
        self.column_types = column_types or {}
        
        self.scalers = {}
        self.encoders = {}
        self.fill_values = {}
        self.outlier_bounds = {}
        
    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """데이터를 전처리하고 변환"""
        data = data.copy()
        
        # 1. 데이터 타입 변환
        data = self._convert_data_types(data)
        
        # 2. 결측치 처리
        data = self._handle_missing_values(data)
        
        # 3. 이상치 처리
        data = self._handle_outliers(data)
        
        return data
    
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """새로운 데이터에 학습된 전처리 적용"""
        data = data.copy()
        
        # 데이터 타입 변환
        data = self._convert_data_types(data)
        
        # 결측치 처리 (학습된 값 사용)
        for column, fill_value in self.fill_values.items():
            if column in data.columns:
                data[column] = data[column].fillna(fill_value)
        
        # 이상치 처리 (학습된 경계값 사용)
        for column, bounds in self.outlier_bounds.items():
            if column in data.columns:
                data[column] = np.clip(data[column], bounds[0], bounds[1])
        
        return data
    
    def _convert_data_types(self, data: pd.DataFrame) -> pd.DataFrame:
        """데이터 타입 변환"""
        for column, dtype in self.column_types.items():
            if column not in data.columns:
                continue
                
            try:
                if dtype == "numeric":
                    data[column] = pd.to_numeric(data[column], errors='coerce')
                elif dtype == "categorical":
                    data[column] = data[column].astype('category')
                elif dtype == "datetime":
                    data[column] = pd.to_datetime(data[column], errors='coerce')
                elif dtype == "text":
                    data[column] = data[column].astype(str)
            except Exception as e:
                print(f"Warning: Could not convert column {column} to {dtype}: {e}")
        
        return data
    
    def _handle_missing_values(self, data: pd.DataFrame) -> pd.DataFrame:
        """결측치 처리"""
        if self.missing_strategy == "drop":
            return data.dropna()
        
        for column in data.columns:
            if data[column].isna().sum() == 0:
                continue
                
            if self.missing_strategy == "mean" and data[column].dtype in ['int64', 'float64']:
                fill_value = data[column].mean()
            elif self.missing_strategy == "median" and data[column].dtype in ['int64', 'float64']:
                fill_value = data[column].median()
            elif self.missing_strategy == "mode":
                fill_value = data[column].mode().iloc[0] if len(data[column].mode()) > 0 else data[column].iloc[0]
            elif self.missing_strategy == "interpolate" and data[column].dtype in ['int64', 'float64']:
                data[column] = data[column].interpolate()
                continue
            else:
                # 기본값: 수치형은 평균, 범주형은 최빈값
                if data[column].dtype in ['int64', 'float64']:
                    fill_value = data[column].mean()
                else:
                    fill_value = data[column].mode().iloc[0] if len(data[column].mode()) > 0 else "Unknown"
            
            self.fill_values[column] = fill_value
            data[column] = data[column].fillna(fill_value)
        
        return data
    
    def _handle_outliers(self, data: pd.DataFrame) -> pd.DataFrame:
        """이상치 처리"""
        if self.outlier_strategy == "none":
            return data
        
        numeric_columns = data.select_dtypes(include=[np.number]).columns
        
        for column in numeric_columns:
            if self.outlier_strategy == "iqr":
                Q1 = data[column].quantile(0.25)
                Q3 = data[column].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                self.outlier_bounds[column] = (lower_bound, upper_bound)
                data[column] = np.clip(data[column], lower_bound, upper_bound)
                
            elif self.outlier_strategy == "zscore":
                z_scores = np.abs(stats.zscore(data[column].dropna()))
                threshold = 3
                
                mean_val = data[column].mean()
                std_val = data[column].std()
                lower_bound = mean_val - threshold * std_val
                upper_bound = mean_val + threshold * std_val
                
                self.outlier_bounds[column] = (lower_bound, upper_bound)
                data[column] = np.clip(data[column], lower_bound, upper_bound)
                
            elif self.outlier_strategy == "isolation_forest":
                iso_forest = IsolationForest(contamination=0.1, random_state=42)
                outliers = iso_forest.fit_predict(data[[column]].dropna())
                
                # 이상치가 아닌 값들의 범위 계산
                normal_data = data[column][outliers == 1]
                lower_bound = normal_data.min()
                upper_bound = normal_data.max()
                
                self.outlier_bounds[column] = (lower_bound, upper_bound)
                data[column] = np.clip(data[column], lower_bound, upper_bound)
        
        return data
    
    def get_preprocessing_summary(self) -> Dict[str, Any]:
        """전처리 요약 정보 반환"""
        return {
            "missing_strategy": self.missing_strategy,
            "outlier_strategy": self.outlier_strategy,
            "column_types": self.column_types,
            "fill_values": self.fill_values,
            "outlier_bounds": self.outlier_bounds
        }

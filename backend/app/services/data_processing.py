from fastapi import HTTPException
import pandas as pd
import numpy as np
import io
import time
import json
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder
from typing import Dict, Any, Optional, Tuple

# 기존 클래스들을 import
import sys
import os

# 현재 디렉토리의 부모 디렉토리를 path에 추가 (backend 폴더)
current_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(current_dir)

from data_augmentation import DataAugmentor
from data_preprocessing import DataPreprocessor
from visualization import DataVisualizer

class DataProcessingService:
    """데이터 처리 서비스"""
    
    def __init__(self):
        self.current_data = None
        self.original_data = None
        self.preprocessor = None
        self.augmentor = None
        self.visualizer = DataVisualizer()
        
    def load_csv_data(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """CSV 파일 로드 및 기본 정보 반환"""
        try:
            # 인코딩 자동 감지해서 로드
            try:
                df = pd.read_csv(io.BytesIO(file_content), encoding='utf-8')
            except UnicodeDecodeError:
                try:
                    df = pd.read_csv(io.BytesIO(file_content), encoding='cp949')
                except UnicodeDecodeError:
                    try:
                        df = pd.read_csv(io.BytesIO(file_content), encoding='latin-1')
                    except Exception:
                        df = pd.read_csv(io.BytesIO(file_content), encoding='utf-8', errors='ignore')
            
            self.original_data = df.copy()
            self.current_data = df.copy()
            
            # 데이터 요약 정보 생성
            summary = self._generate_data_summary(df)
            
            # 샘플 데이터 (처음 10행)
            sample_data = df.head(10).to_dict('records')
            
            return {
                'success': True,
                'message': '파일이 성공적으로 로드되었습니다.',
                'summary': summary,
                'sample_data': sample_data,
                'columns': df.columns.tolist()
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"파일 로드 중 오류 발생: {str(e)}")
    
    def _generate_data_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """데이터 요약 정보 생성"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns = df.select_dtypes(exclude=[np.number]).columns.tolist()
        
        missing_values = df.isnull().sum().to_dict()
        data_types = df.dtypes.astype(str).to_dict()
        
        return {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'numeric_columns': numeric_columns,
            'categorical_columns': categorical_columns,
            'missing_values': missing_values,
            'data_types': data_types
        }
    
    def process_data(self, processing_config: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 전처리 및 증강 실행"""
        if self.original_data is None:
            raise HTTPException(status_code=400, detail="먼저 데이터를 업로드해주세요.")
        
        try:
            start_time = time.time()
            
            # 전처리 설정
            preprocessing_config = processing_config.get('preprocessing_config', {})
            augmentation_config = processing_config.get('augmentation_config', {})
            
            # 전처리 실행
            self.preprocessor = DataPreprocessor(
                missing_strategy=preprocessing_config.get('missing_strategy', 'mean'),
                outlier_strategy=preprocessing_config.get('outlier_strategy', 'none'),
                column_types=preprocessing_config.get('column_types', {})
            )
            
            processed_data = self.preprocessor.fit_transform(self.original_data)
            
            # 증강 실행
            method = augmentation_config.get('method', 'gaussian_copula')
            
            if method == 'smote':
                self.augmentor = DataAugmentor(
                    method=method,
                    target_column=augmentation_config.get('target_column'),
                    k_neighbors=augmentation_config.get('k_neighbors', 5),
                    sampling_strategy=augmentation_config.get('sampling_strategy', 'auto')
                )
            else:
                self.augmentor = DataAugmentor(
                    method=method,
                    augmentation_ratio=augmentation_config.get('augmentation_ratio', 1.0),
                    target_rows=augmentation_config.get('target_rows')
                )
            
            self.current_data = self.augmentor.fit_transform(processed_data)
            
            processing_time = time.time() - start_time
            original_rows = len(self.original_data)
            augmented_rows = len(self.current_data)
            increase_ratio = ((augmented_rows - original_rows) / original_rows) * 100
            
            return {
                'success': True,
                'message': '데이터 처리가 완료되었습니다.',
                'original_rows': original_rows,
                'augmented_rows': augmented_rows,
                'increase_ratio': round(increase_ratio, 2),
                'processing_time': round(processing_time, 2),
                'summary': self._generate_data_summary(self.current_data)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"데이터 처리 중 오류 발생: {str(e)}")
    
    def get_processed_data(self, page: int = 0, page_size: int = 100) -> Dict[str, Any]:
        """처리된 데이터 페이징해서 반환"""
        if self.current_data is None:
            raise HTTPException(status_code=400, detail="처리된 데이터가 없습니다.")
        
        start_idx = page * page_size
        end_idx = start_idx + page_size
        
        page_data = self.current_data.iloc[start_idx:end_idx]
        
        return {
            'data': page_data.to_dict('records'),
            'total_rows': len(self.current_data),
            'page': page,
            'page_size': page_size,
            'total_pages': (len(self.current_data) + page_size - 1) // page_size
        }
    
    def download_data(self, encoding: str = 'utf-8') -> bytes:
        """데이터 다운로드"""
        if self.current_data is None:
            raise HTTPException(status_code=400, detail="다운로드할 데이터가 없습니다.")
        
        try:
            if encoding == 'cp949':
                csv_content = self.current_data.to_csv(index=False, encoding='cp949')
            elif encoding == 'utf-8-bom':
                csv_content = '\ufeff' + self.current_data.to_csv(index=False, encoding='utf-8')
                return csv_content.encode('utf-8')
            else:
                csv_content = self.current_data.to_csv(index=False, encoding='utf-8')
            
            return csv_content.encode(encoding)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"다운로드 중 오류 발생: {str(e)}")
    
    def generate_visualization(self, column_name: str, chart_type: str = 'distribution') -> Dict[str, Any]:
        """시각화 생성"""
        if self.current_data is None or self.original_data is None:
            raise HTTPException(status_code=400, detail="시각화할 데이터가 없습니다.")
        
        if column_name not in self.current_data.columns:
            raise HTTPException(status_code=400, detail=f"컬럼 '{column_name}'을 찾을 수 없습니다.")
        
        try:
            if chart_type == 'distribution':
                fig = self.visualizer.plot_distribution_comparison(
                    self.original_data, self.current_data, column_name
                )
            elif chart_type == 'correlation':
                fig = self.visualizer.plot_correlation_heatmap(self.current_data)
            else:
                raise HTTPException(status_code=400, detail="지원하지 않는 차트 타입입니다.")
            
            # Plotly figure를 JSON으로 변환
            fig_json = fig.to_json()
            
            return {
                'success': True,
                'chart_data': json.loads(fig_json),
                'column_name': column_name,
                'chart_type': chart_type
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"시각화 생성 중 오류 발생: {str(e)}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """통계 정보 반환"""
        if self.current_data is None or self.original_data is None:
            raise HTTPException(status_code=400, detail="통계를 계산할 데이터가 없습니다.")
        
        try:
            original_stats = self.original_data.describe().to_dict()
            augmented_stats = self.current_data.describe().to_dict()
            
            return {
                'original_statistics': original_stats,
                'augmented_statistics': augmented_stats,
                'comparison': {
                    'original_rows': len(self.original_data),
                    'augmented_rows': len(self.current_data),
                    'increase_ratio': ((len(self.current_data) - len(self.original_data)) / len(self.original_data)) * 100
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"통계 계산 중 오류 발생: {str(e)}")

# 전역 서비스 인스턴스
data_service = DataProcessingService()
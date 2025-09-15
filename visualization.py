import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import seaborn as sns
import matplotlib.pyplot as plt
from typing import Optional, List, Tuple
import warnings
warnings.filterwarnings('ignore')

class DataVisualizer:
    """
    데이터 시각화를 담당하는 클래스
    분포 비교, 상관관계, 통계 요약 등을 시각화
    """
    
    def __init__(self, theme: str = "plotly_white"):
        """
        Args:
            theme: Plotly 테마 설정
        """
        self.theme = theme
        
    def plot_distribution_comparison(
        self, 
        original_data: pd.DataFrame, 
        augmented_data: pd.DataFrame, 
        column: str,
        bins: int = 50
    ) -> go.Figure:
        """원본과 증강된 데이터의 분포 비교 플롯"""
        
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=[
                f'원본 데이터 - {column}',
                f'증강된 데이터 - {column}',
                '박스 플롯 비교',
                '통계 요약'
            ],
            specs=[[{"type": "histogram"}, {"type": "histogram"}],
                   [{"type": "box"}, {"type": "table"}]]
        )
        
        # 원본 데이터 히스토그램
        fig.add_trace(
            go.Histogram(
                x=original_data[column],
                nbinsx=bins,
                name='원본',
                opacity=0.7,
                marker_color='blue'
            ),
            row=1, col=1
        )
        
        # 증강된 데이터 히스토그램 (새로 추가된 부분만)
        original_len = len(original_data)
        new_data = augmented_data.iloc[original_len:][column]
        
        fig.add_trace(
            go.Histogram(
                x=new_data,
                nbinsx=bins,
                name='증강된 부분',
                opacity=0.7,
                marker_color='red'
            ),
            row=1, col=2
        )
        
        # 박스 플롯
        fig.add_trace(
            go.Box(
                y=original_data[column],
                name='원본',
                marker_color='blue'
            ),
            row=2, col=1
        )
        
        fig.add_trace(
            go.Box(
                y=new_data,
                name='증강된 부분',
                marker_color='red'
            ),
            row=2, col=1
        )
        
        # 통계 요약 테이블
        original_stats = original_data[column].describe()
        augmented_stats = new_data.describe()
        
        stats_table = go.Table(
            header=dict(
                values=['통계', '원본', '증강된 부분'],
                fill_color='lightblue',
                align='center'
            ),
            cells=dict(
                values=[
                    ['평균', '표준편차', '최솟값', '25%', '50%', '75%', '최댓값'],
                    [f"{original_stats['mean']:.3f}", 
                     f"{original_stats['std']:.3f}",
                     f"{original_stats['min']:.3f}",
                     f"{original_stats['25%']:.3f}",
                     f"{original_stats['50%']:.3f}",
                     f"{original_stats['75%']:.3f}",
                     f"{original_stats['max']:.3f}"],
                    [f"{augmented_stats['mean']:.3f}",
                     f"{augmented_stats['std']:.3f}",
                     f"{augmented_stats['min']:.3f}",
                     f"{augmented_stats['25%']:.3f}",
                     f"{augmented_stats['50%']:.3f}",
                     f"{augmented_stats['75%']:.3f}",
                     f"{augmented_stats['max']:.3f}"]
                ],
                fill_color='white',
                align='center'
            )
        )
        
        fig.add_trace(stats_table, row=2, col=2)
        
        fig.update_layout(
            height=800,
            title=f"{column} 컬럼의 분포 비교",
            template=self.theme,
            showlegend=True
        )
        
        return fig
    
    def plot_correlation_heatmap(
        self, 
        data: pd.DataFrame, 
        title: str = "상관관계 히트맵"
    ) -> go.Figure:
        """상관관계 히트맵"""
        
        numeric_data = data.select_dtypes(include=[np.number])
        corr_matrix = numeric_data.corr()
        
        fig = go.Figure(data=go.Heatmap(
            z=corr_matrix.values,
            x=corr_matrix.columns,
            y=corr_matrix.columns,
            colorscale='RdBu',
            zmid=0,
            text=corr_matrix.round(2).values,
            texttemplate="%{text}",
            textfont={"size": 10},
            hoverongaps=False
        ))
        
        fig.update_layout(
            title=title,
            template=self.theme,
            width=600,
            height=600
        )
        
        return fig
    
    def plot_categorical_comparison(
        self,
        original_data: pd.DataFrame,
        augmented_data: pd.DataFrame,
        column: str
    ) -> go.Figure:
        """범주형 데이터의 분포 비교"""
        
        # 원본 데이터 분포
        original_counts = original_data[column].value_counts()
        
        # 증강된 부분의 분포
        original_len = len(original_data)
        new_data = augmented_data.iloc[original_len:]
        new_counts = new_data[column].value_counts()
        
        # 비교 차트
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=['원본 데이터', '증강된 부분'],
            specs=[[{"type": "bar"}, {"type": "bar"}]]
        )
        
        fig.add_trace(
            go.Bar(
                x=original_counts.index,
                y=original_counts.values,
                name='원본',
                marker_color='blue'
            ),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Bar(
                x=new_counts.index,
                y=new_counts.values,
                name='증강된 부분',
                marker_color='red'
            ),
            row=1, col=2
        )
        
        fig.update_layout(
            title=f"{column} 범주형 변수의 분포 비교",
            template=self.theme,
            height=400
        )
        
        return fig
    
    def plot_data_quality_metrics(
        self,
        original_data: pd.DataFrame,
        augmented_data: pd.DataFrame
    ) -> go.Figure:
        """데이터 품질 지표 비교"""
        
        # 결측값 비율
        original_missing = (original_data.isnull().sum() / len(original_data) * 100)
        augmented_missing = (augmented_data.isnull().sum() / len(augmented_data) * 100)
        
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=[
                '결측값 비율 (%)',
                '데이터 타입 분포',
                '수치 데이터 범위',
                '데이터 크기 비교'
            ]
        )
        
        # 결측값 비율 비교
        columns = original_missing.index
        fig.add_trace(
            go.Bar(
                x=columns,
                y=original_missing.values,
                name='원본',
                marker_color='blue'
            ),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Bar(
                x=columns,
                y=augmented_missing.values,
                name='증강 후',
                marker_color='red'
            ),
            row=1, col=1
        )
        
        # 데이터 타입 분포
        original_types = original_data.dtypes.value_counts()
        fig.add_trace(
            go.Pie(
                labels=original_types.index.astype(str),
                values=original_types.values,
                name="데이터 타입"
            ),
            row=1, col=2
        )
        
        # 데이터 크기 비교
        sizes = ['원본', '증강 후']
        counts = [len(original_data), len(augmented_data)]
        
        fig.add_trace(
            go.Bar(
                x=sizes,
                y=counts,
                marker_color=['blue', 'red'],
                text=counts,
                textposition='auto'
            ),
            row=2, col=2
        )
        
        fig.update_layout(
            title="데이터 품질 지표 비교",
            template=self.theme,
            height=800,
            showlegend=True
        )
        
        return fig
    
    def create_summary_dashboard(
        self,
        original_data: pd.DataFrame,
        augmented_data: pd.DataFrame,
        numeric_column: Optional[str] = None
    ) -> go.Figure:
        """종합 대시보드"""
        
        if numeric_column is None:
            numeric_columns = augmented_data.select_dtypes(include=[np.number]).columns
            numeric_column = numeric_columns[0] if len(numeric_columns) > 0 else None
        
        if numeric_column is None:
            # 수치형 컬럼이 없는 경우
            fig = go.Figure()
            fig.add_annotation(
                text="수치형 데이터가 없어 시각화를 표시할 수 없습니다.",
                xref="paper", yref="paper",
                x=0.5, y=0.5, xanchor='center', yanchor='middle',
                showarrow=False,
                font=dict(size=16)
            )
            return fig
        
        return self.plot_distribution_comparison(
            original_data, augmented_data, numeric_column
        )

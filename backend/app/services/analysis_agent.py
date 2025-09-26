import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder
import json
import os
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
import pathlib

# .env 파일을 절대 경로로 로드
backend_dir = pathlib.Path(__file__).parent.parent.parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

# 추가적으로 현재 디렉토리에서도 시도
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from langchain.agents.agent_types import AgentType
from langchain_community.callbacks import get_openai_callback
import tempfile
import io
import base64

class CSVAnalysisAgent:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        self.llm = ChatOpenAI(
            temperature=0.1,
            openai_api_key=self.openai_api_key,
            model="gpt-4o"  # 최신 모델로 변경
        )
        
        # 세션별 데이터 저장
        self.session_data: Dict[str, pd.DataFrame] = {}
        
    def load_csv_data(self, session_id: str, csv_content: bytes) -> Dict[str, Any]:
        """CSV 데이터를 로드하고 세션에 저장"""
        try:
            # CSV 파일을 DataFrame으로 읽기
            df = pd.read_csv(io.BytesIO(csv_content), encoding='utf-8')
        except UnicodeDecodeError:
            # UTF-8로 실패하면 다른 인코딩 시도
            try:
                df = pd.read_csv(io.BytesIO(csv_content), encoding='cp949')
            except:
                df = pd.read_csv(io.BytesIO(csv_content), encoding='latin-1')
        
        # 세션에 데이터 저장
        self.session_data[session_id] = df
        
        # 데이터 기본 정보 반환
        return {
            "success": True,
            "data_info": {
                "shape": df.shape,
                "columns": df.columns.tolist(),
                "dtypes": df.dtypes.astype(str).to_dict(),
                "sample_data": df.head(5).to_dict('records'),
                "missing_values": df.isnull().sum().to_dict(),
                "summary_stats": df.describe().to_dict() if len(df.select_dtypes(include=['number']).columns) > 0 else {}
            }
        }
    
    def analyze_query(self, session_id: str, query: str) -> Dict[str, Any]:
        """자연어 쿼리를 분석하여 결과 반환"""
        if session_id not in self.session_data:
            return {
                "success": False,
                "error": "데이터가 업로드되지 않았습니다. 먼저 CSV 파일을 업로드해주세요."
            }
        
        df = self.session_data[session_id]
        
        try:
            # LangChain Agent 생성 (Python REPL 활성화)
            agent = create_pandas_dataframe_agent(
                llm=self.llm,
                df=df,
                verbose=True,
                agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
                handle_parsing_errors=True,
                max_iterations=5,
                allow_dangerous_code=True  # Python REPL 기능 활성화
            )
            
            # 한국어 프롬프트 개선
            enhanced_query = f"""
            다음 질문에 대해 데이터를 분석하고 한국어로 친절하게 답변해주세요:
            
            질문: {query}
            
            분석 시 다음 사항을 고려해주세요:
            1. 결과를 명확하고 이해하기 쉽게 설명
            2. 필요한 경우 구체적인 수치 제시
            3. 데이터의 특성이나 패턴이 있다면 언급
            4. 한국어로 자연스럽게 답변
            
            답변 형식: 분석 결과를 문장으로 설명하고, 필요시 주요 수치나 발견사항을 포함해주세요.
            """
            
            # API 사용량 추적 (최신 버전에서는 invoke 사용)
            try:
                result = agent.invoke({"input": enhanced_query})
                if isinstance(result, dict):
                    result = result.get("output", str(result))
            except Exception:
                # Fallback to older method
                result = agent.run(enhanced_query)
                
            # 시각화가 필요한지 판단하고 차트 생성
            chart_data = self._generate_visualization_if_needed(df, query, result)
            
            return {
                "success": True,
                "response": result,
                "chart_data": chart_data,
                "api_usage": {
                    "total_tokens": 0,  # 추후 구현
                    "total_cost": 0.0   # 추후 구현
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"분석 중 오류가 발생했습니다: {str(e)}"
            }
    
    def _generate_visualization_if_needed(self, df: pd.DataFrame, query: str, analysis_result: str) -> Optional[Dict[str, Any]]:
        """쿼리 내용에 따라 적절한 시각화 생성"""
        query_lower = query.lower()
        
        # 시각화 키워드 감지
        visualization_keywords = {
            'distribution': ['분포', '히스토그램', 'distribution', 'hist'],
            'correlation': ['상관관계', '상관', 'correlation', 'corr'],
            'trend': ['트렌드', '추세', '변화', 'trend', 'time'],
            'comparison': ['비교', '차이', 'compare', 'vs', '대비'],
            'top': ['상위', '높은', '최대', 'top', 'high', 'max'],
            'pie': ['비율', '구성', '점유율', 'ratio', 'proportion', 'pie']
        }
        
        try:
            numeric_columns = df.select_dtypes(include=['number']).columns.tolist()
            categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
            
            # 상관관계 분석
            if any(keyword in query_lower for keyword in visualization_keywords['correlation']) and len(numeric_columns) >= 2:
                corr_matrix = df[numeric_columns].corr()
                fig = px.imshow(corr_matrix, 
                              text_auto=True, 
                              aspect="auto",
                              title="상관관계 히트맵",
                              color_continuous_scale='RdYlBu')
                return {"type": "correlation", "data": fig.to_json()}
            
            # 분포 분석
            elif any(keyword in query_lower for keyword in visualization_keywords['distribution']) and len(numeric_columns) > 0:
                col = numeric_columns[0]  # 첫 번째 숫자 컬럼 사용
                fig = px.histogram(df, x=col, title=f"{col} 분포")
                return {"type": "distribution", "data": fig.to_json()}
            
            # 비율/파이 차트
            elif any(keyword in query_lower for keyword in visualization_keywords['pie']) and len(categorical_columns) > 0:
                col = categorical_columns[0]
                value_counts = df[col].value_counts().head(10)  # 상위 10개만
                fig = px.pie(values=value_counts.values, 
                           names=value_counts.index, 
                           title=f"{col} 구성 비율")
                return {"type": "pie", "data": fig.to_json()}
            
            # 상위 N개 분석
            elif any(keyword in query_lower for keyword in visualization_keywords['top']) and len(numeric_columns) > 0 and len(categorical_columns) > 0:
                num_col = numeric_columns[0]
                cat_col = categorical_columns[0]
                top_data = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False).head(10)
                fig = px.bar(x=top_data.index, y=top_data.values, 
                           title=f"{cat_col}별 {num_col} 상위 항목",
                           labels={'x': cat_col, 'y': num_col})
                return {"type": "bar", "data": fig.to_json()}
            
            return None
            
        except Exception as e:
            # 시각화 생성 실패 시 None 반환 (분석 결과는 유지)
            print(f"Visualization generation failed: {str(e)}")
            return None
    
    def get_suggested_queries(self, session_id: str) -> List[str]:
        """데이터에 기반한 추천 질문 생성"""
        if session_id not in self.session_data:
            return []
        
        df = self.session_data[session_id]
        suggestions = [
            "데이터의 전체적인 요약을 보여주세요",
            "결측값이 있는 컬럼들을 알려주세요",
        ]
        
        numeric_columns = df.select_dtypes(include=['number']).columns.tolist()
        categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        if numeric_columns:
            suggestions.extend([
                f"{numeric_columns[0]}의 평균과 최댓값을 알려주세요",
                f"숫자형 컬럼들 간의 상관관계를 분석해주세요"
            ])
        
        if categorical_columns:
            suggestions.extend([
                f"{categorical_columns[0]}의 고유값 개수를 알려주세요",
                f"{categorical_columns[0]}별 데이터 분포를 보여주세요"
            ])
        
        if len(numeric_columns) > 0 and len(categorical_columns) > 0:
            suggestions.append(f"{categorical_columns[0]}별 {numeric_columns[0]}의 평균을 비교해주세요")
        
        return suggestions[:8]  # 최대 8개 제한
    
    def clear_session_data(self, session_id: str):
        """세션 데이터 삭제"""
        if session_id in self.session_data:
            del self.session_data[session_id]
    
    def get_data_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """세션의 데이터 정보 반환"""
        if session_id not in self.session_data:
            return None
        
        df = self.session_data[session_id]
        return {
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "memory_usage": df.memory_usage(deep=True).sum()
        }
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import uuid
from datetime import datetime

from ..models.schemas import User
from ..services.analysis_agent import CSVAnalysisAgent
from .auth import get_current_user

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# 글로벌 분석 에이전트 인스턴스
analysis_agent = CSVAnalysisAgent()

# 사용자별 세션 매핑 (사용자 ID -> 세션 ID)
user_sessions: Dict[str, str] = {}

@router.post("/upload")
async def upload_csv_for_analysis(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """CSV 파일을 업로드하고 분석 준비"""
    
    # 파일 확장자 검증
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSV 파일만 업로드 가능합니다.")
    
    # 파일 크기 검증 (50MB 제한)
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(status_code=400, detail="파일 크기는 50MB를 초과할 수 없습니다.")
    
    try:
        # 기존 세션이 있으면 데이터 삭제
        if current_user.username in user_sessions:
            old_session_id = user_sessions[current_user.username]
            analysis_agent.clear_session_data(old_session_id)
        
        # 새 세션 ID 생성
        session_id = f"{current_user.username}_{uuid.uuid4().hex[:8]}"
        user_sessions[current_user.username] = session_id
        
        # CSV 데이터 로드
        result = analysis_agent.load_csv_data(session_id, content)
        
        if result["success"]:
            # 추천 질문 생성
            suggestions = analysis_agent.get_suggested_queries(session_id)
            result["suggested_queries"] = suggestions
            result["session_id"] = session_id
            result["filename"] = file.filename
            result["upload_time"] = datetime.now().isoformat()
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 처리 중 오류가 발생했습니다: {str(e)}")

@router.post("/query")
async def analyze_data_query(
    query: str = Form(...),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """자연어 질문으로 데이터 분석"""
    
    # 사용자의 세션 확인
    if current_user.username not in user_sessions:
        raise HTTPException(status_code=400, detail="업로드된 데이터가 없습니다. 먼저 CSV 파일을 업로드해주세요.")
    
    session_id = user_sessions[current_user.username]
    
    if not query.strip():
        raise HTTPException(status_code=400, detail="질문을 입력해주세요.")
    
    try:
        # 분석 실행
        result = analysis_agent.analyze_query(session_id, query.strip())
        
        if result["success"]:
            result["query"] = query
            result["timestamp"] = datetime.now().isoformat()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류가 발생했습니다: {str(e)}")

@router.get("/suggestions")
async def get_query_suggestions(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """데이터 기반 추천 질문 조회"""
    
    if current_user.username not in user_sessions:
        return {"suggestions": []}
    
    session_id = user_sessions[current_user.username]
    suggestions = analysis_agent.get_suggested_queries(session_id)
    
    return {"suggestions": suggestions}

@router.get("/data-info")
async def get_current_data_info(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """현재 업로드된 데이터 정보 조회"""
    
    if current_user.username not in user_sessions:
        raise HTTPException(status_code=404, detail="업로드된 데이터가 없습니다.")
    
    session_id = user_sessions[current_user.username]
    data_info = analysis_agent.get_data_info(session_id)
    
    if not data_info:
        raise HTTPException(status_code=404, detail="데이터 정보를 찾을 수 없습니다.")
    
    return data_info

@router.delete("/clear")
async def clear_analysis_data(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """현재 사용자의 분석 데이터 삭제"""
    
    if current_user.username in user_sessions:
        session_id = user_sessions[current_user.username]
        analysis_agent.clear_session_data(session_id)
        del user_sessions[current_user.username]
        
        return {"success": True, "message": "분석 데이터가 삭제되었습니다."}
    
    return {"success": True, "message": "삭제할 데이터가 없습니다."}
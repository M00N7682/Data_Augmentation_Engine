from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
import io

from ..models.schemas import ProcessingRequest, ProcessingResponse, DataSummary, VisualizationRequest
from ..services.data_processing import data_service

router = APIRouter(prefix="/api/data", tags=["data"])

@router.post("/upload", response_model=Dict[str, Any])
async def upload_file(file: UploadFile = File(...)):
    """CSV 파일 업로드"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSV 파일만 업로드 가능합니다.")
    
    try:
        content = await file.read()
        result = data_service.load_csv_data(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 중 오류 발생: {str(e)}")

@router.post("/process", response_model=Dict[str, Any])
async def process_data(request: ProcessingRequest):
    """데이터 전처리 및 증강 실행"""
    try:
        config = {
            'preprocessing_config': request.preprocessing_config.dict(),
            'augmentation_config': request.augmentation_config.dict()
        }
        result = data_service.process_data(config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 처리 중 오류 발생: {str(e)}")

@router.get("/processed", response_model=Dict[str, Any])
async def get_processed_data(
    page: int = Query(0, ge=0),
    page_size: int = Query(100, ge=1, le=1000)
):
    """처리된 데이터 조회 (페이징)"""
    try:
        result = data_service.get_processed_data(page, page_size)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 조회 중 오류 발생: {str(e)}")

@router.get("/download")
async def download_data(encoding: str = Query("utf-8", regex="^(utf-8|cp949|utf-8-bom)$")):
    """증강된 데이터 다운로드"""
    try:
        csv_bytes = data_service.download_data(encoding)
        
        # 파일명 설정
        if encoding == "cp949":
            filename = "augmented_data_excel.csv"
        elif encoding == "utf-8-bom":
            filename = "augmented_data_excel_utf8.csv"
        else:
            filename = "augmented_data_utf8.csv"
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"다운로드 중 오류 발생: {str(e)}")

@router.post("/visualize", response_model=Dict[str, Any])
async def create_visualization(request: VisualizationRequest):
    """시각화 생성"""
    try:
        result = data_service.generate_visualization(
            request.column_name, 
            request.chart_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시각화 생성 중 오류 발생: {str(e)}")

@router.get("/statistics", response_model=Dict[str, Any])
async def get_statistics():
    """통계 정보 조회"""
    try:
        result = data_service.get_statistics()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 중 오류 발생: {str(e)}")

@router.get("/columns", response_model=Dict[str, Any])
async def get_columns():
    """컬럼 정보 조회"""
    try:
        if data_service.current_data is None:
            raise HTTPException(status_code=400, detail="데이터가 로드되지 않았습니다.")
        
        columns = data_service.current_data.columns.tolist()
        numeric_columns = data_service.current_data.select_dtypes(include=['number']).columns.tolist()
        categorical_columns = data_service.current_data.select_dtypes(exclude=['number']).columns.tolist()
        
        return {
            'all_columns': columns,
            'numeric_columns': numeric_columns,
            'categorical_columns': categorical_columns
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"컬럼 정보 조회 중 오류 발생: {str(e)}")
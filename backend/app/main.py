from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .api.data import router as data_router

def create_app() -> FastAPI:
    """FastAPI 앱 생성 및 설정"""
    
    app = FastAPI(
        title="Data Augmentation API",
        description="CSV 데이터 증강 엔진 API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # CORS 미들웨어 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3001", "http://127.0.0.1:3000"],  # React 개발 서버
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # API 라우터 등록
    app.include_router(data_router)
    
    # 헬스 체크 엔드포인트
    @app.get("/")
    async def root():
        return {
            "message": "Data Augmentation API", 
            "version": "1.0.0",
            "docs": "/docs"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    return app

app = create_app()
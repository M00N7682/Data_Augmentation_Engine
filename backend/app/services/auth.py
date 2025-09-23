from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from ..models.schemas import User, UserCreate

# 설정
SECRET_KEY = "your-secret-key-here"  # 실제 환경에서는 환경변수로 관리
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 비밀번호 해싱
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 임시 사용자 데이터베이스 (실제 환경에서는 DB 사용)
fake_users_db = {}
user_id_counter = 1

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """비밀번호 해시화"""
    return pwd_context.hash(password)

def create_user(user_data: UserCreate) -> User:
    """새 사용자 생성"""
    global user_id_counter
    
    # 이메일 중복 체크
    for user in fake_users_db.values():
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 등록된 이메일입니다."
            )
    
    # 사용자명 중복 체크
    for user in fake_users_db.values():
        if user["username"] == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 사용자명입니다."
            )
    
    # 새 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "id": user_id_counter,
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    fake_users_db[user_data.username] = user_dict
    user_id_counter += 1
    
    return User(**user_dict)

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """사용자 인증"""
    user = fake_users_db.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    """JWT 토큰 디코딩"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def get_user(username: str) -> Optional[User]:
    """사용자 정보 조회"""
    user_dict = fake_users_db.get(username)
    if user_dict:
        return User(**user_dict)
    return None

# 기본 관리자 계정 생성
def create_default_admin():
    """기본 관리자 계정 생성"""
    admin_username = "admin"
    if admin_username not in fake_users_db:
        admin_data = UserCreate(
            email="admin@dddb.com",
            username=admin_username,
            password="admin123",
            full_name="관리자"
        )
        create_user(admin_data)
        print("기본 관리자 계정이 생성되었습니다. (username: admin, password: admin123)")

# 시작 시 기본 관리자 계정 생성
create_default_admin()
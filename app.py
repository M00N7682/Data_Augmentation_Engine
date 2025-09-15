import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import seaborn as sns
import matplotlib.pyplot as plt
from io import StringIO
import warnings
warnings.filterwarnings('ignore')

from data_augmentation import DataAugmentor
from data_preprocessing import DataPreprocessor
from visualization import DataVisualizer

# 페이지 설정
st.set_page_config(
    page_title="Data Augmentation Platform",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 제목
st.markdown("""
    <div style='text-align: center;'>
        <h1>CSV 데이터 증강 엔진</h1>
        <p style='font-size:16px;'>기존의 원본 데이터와 통계적 분포가 유사하게 데이터를 증강해주는 서비스입니다.<br>에러신고 및 문의는 dfjk71@khu.ac.kr로 부탁드립니다.</p>
    </div>
    <hr>
""", unsafe_allow_html=True)

# 사이드바 - 파라미터 설정
st.sidebar.header("🔧 설정")

# 세션 상태 초기화
if 'original_data' not in st.session_state:
    st.session_state.original_data = None
if 'augmented_data' not in st.session_state:
    st.session_state.augmented_data = None
if 'preprocessor' not in st.session_state:
    st.session_state.preprocessor = None

# 메인 레이아웃
col1, col2 = st.columns([1, 1])

with col1:
    st.header("📁 데이터 업로드 및 설정")
    
    # 파일 업로드
    uploaded_file = st.file_uploader(
        "CSV 파일을 업로드하세요",
        type=['csv'],
        help="CSV 형식의 데이터 파일을 업로드해주세요."
    )
    
    if uploaded_file is not None:
        try:
            # 데이터 로드 (자동 인코딩 감지)
            def load_csv_with_encoding(file):
                # 먼저 UTF-8로 시도
                try:
                    file.seek(0)  # 파일 포인터를 처음으로 리셋
                    return pd.read_csv(file, encoding='utf-8')
                except UnicodeDecodeError:
                    # UTF-8이 실패하면 CP949(한글 Windows 기본) 시도
                    try:
                        file.seek(0)
                        return pd.read_csv(file, encoding='cp949')
                    except UnicodeDecodeError:
                        # CP949도 실패하면 Latin-1(거의 모든 바이트 허용) 시도
                        try:
                            file.seek(0)
                            return pd.read_csv(file, encoding='latin-1')
                        except Exception:
                            # 마지막 시도: 에러 무시하고 UTF-8
                            file.seek(0)
                            return pd.read_csv(file, encoding='utf-8', errors='ignore')
            
            df = load_csv_with_encoding(uploaded_file)
            st.session_state.original_data = df
            
            st.success(f"✅ 데이터가 성공적으로 로드되었습니다! (행: {len(df)}, 열: {len(df.columns)})")
            
            # 데이터 미리보기
            with st.expander("📋 데이터 미리보기", expanded=True):
                st.dataframe(df.head(10), use_container_width=True)
            
            # 데이터 타입 설정
            st.subheader("데이터 타입 설정")
            
            column_types = {}
            for col in df.columns:
                col_type = st.selectbox(
                    f"{col}",
                    options=["numeric", "categorical", "datetime", "text"],
                    index=0 if df[col].dtype in ['int64', 'float64'] else 1,
                    key=f"type_{col}"
                )
                column_types[col] = col_type
            
            # 전처리 파라미터 설정
            st.subheader("전처리 설정")
            
            # 결측치 처리
            missing_strategy = st.selectbox(
                "결측치 처리 방법",
                options=["mean", "median", "mode", "drop", "interpolate"],
                index=0,
                help="결측치를 처리할 방법을 선택하세요."
            )
            
            # 이상치 처리
            outlier_strategy = st.selectbox(
                "이상치 처리 방법",
                options=["none", "iqr", "zscore", "isolation_forest"],
                index=0,
                help="이상치를 처리할 방법을 선택하세요."
            )
            
            # 데이터 증강 설정
            st.subheader("증강 엔진 설정")
            
            augmentation_method = st.selectbox(
                "증강 방법",
                options=["SMOTE", "Gaussian Copula", "Bayesian Network"],
                index=0,
                help="데이터 증강에 사용할 방법을 선택하세요."
            )
            
            # 증강 방식 선택
            augmentation_type = st.radio(
                "증강 방식",
                options=["비율로 설정", "목표 행 수 설정"],
                index=0,
                help="증강할 데이터의 양을 어떻게 설정할지 선택하세요."
            )
            
            if augmentation_method == "SMOTE":
                target_column = st.selectbox(
                    "타겟 컬럼 (분류용)",
                    options=df.columns.tolist(),
                    help="SMOTE를 적용할 타겟 컬럼을 선택하세요."
                )
                k_neighbors = st.slider("K-neighbors", 1, 10, 5)
                sampling_strategy = st.selectbox(
                    "샘플링 전략",
                    options=["auto", "minority", "not majority", "all"],
                    index=0
                )
            else:
                if augmentation_type == "비율로 설정":
                    augmentation_ratio = st.slider(
                        "증강 비율",
                        min_value=0.1,
                        max_value=5.0,
                        value=1.0,
                        step=0.1,
                        help="원본 데이터 대비 증강할 데이터의 비율"
                    )
                    target_rows = None
                else:
                    current_rows = len(df)
                    target_rows = st.number_input(
                        "목표 총 행 수",
                        min_value=current_rows + 1,
                        max_value=current_rows * 10,
                        value=current_rows * 2,
                        step=10,
                        help=f"현재 데이터: {current_rows}행. 증강 후 목표 총 행 수를 입력하세요."
                    )
                    augmentation_ratio = (target_rows - current_rows) / current_rows
                    st.info(f"📊 증강될 행 수: {target_rows - current_rows}행 (비율: {augmentation_ratio:.2f})")
            
            # 실행 버튼
            if st.button("🚀 데이터 증강 실행", type="primary"):
                with st.spinner("데이터를 처리 중입니다..."):
                    # 전처리
                    preprocessor = DataPreprocessor(
                        missing_strategy=missing_strategy,
                        outlier_strategy=outlier_strategy,
                        column_types=column_types
                    )
                    
                    processed_data = preprocessor.fit_transform(df)
                    st.session_state.preprocessor = preprocessor
                    
                    # 데이터 증강
                    if augmentation_method == "SMOTE":
                        augmentor = DataAugmentor(
                            method="smote",
                            target_column=target_column,
                            k_neighbors=k_neighbors,
                            sampling_strategy=sampling_strategy
                        )
                    else:
                        augmentor = DataAugmentor(
                            method=augmentation_method.lower().replace(" ", "_"),
                            augmentation_ratio=augmentation_ratio,
                            target_rows=target_rows if augmentation_type == "목표 행 수 설정" else None
                        )
                    
                    augmented_data = augmentor.fit_transform(processed_data)
                    st.session_state.augmented_data = augmented_data
                
                st.success("✅ 데이터 증강이 완료되었습니다!")
        
        except Exception as e:
            st.error(f"❌ 파일 처리 중 오류가 발생했습니다: {str(e)}")

with col2:
    st.header("📈 결과 및 시각화")
    
    if st.session_state.augmented_data is not None:
        augmented_df = st.session_state.augmented_data
        original_df = st.session_state.original_data
        
        # 결과 통계
        col2_1, col2_2, col2_3 = st.columns(3)
        
        with col2_1:
            st.metric(
                "원본 데이터",
                f"{len(original_df):,} 행",
                help="업로드된 원본 데이터의 행 수"
            )
        
        with col2_2:
            st.metric(
                "증강된 데이터",
                f"{len(augmented_df):,} 행",
                delta=f"+{len(augmented_df) - len(original_df):,}",
                help="증강 후 총 데이터 행 수"
            )
        
        with col2_3:
            increase_ratio = ((len(augmented_df) - len(original_df)) / len(original_df)) * 100
            st.metric(
                "증가율",
                f"{increase_ratio:.1f}%",
                help="원본 데이터 대비 증가 비율"
            )
        
        # 탭으로 구분된 결과 표시
        tab1, tab2, tab3 = st.tabs(["📊 데이터 테이블", "📈 분포 비교", "📋 상세 통계"])
        
        with tab1:
            st.subheader("증강된 데이터")
            
            # 데이터 필터링 옵션
            show_original_only = st.checkbox("원본 데이터만 표시")
            show_augmented_only = st.checkbox("증강된 데이터만 표시")
            
            if show_original_only:
                display_df = augmented_df.head(len(original_df))
                st.info("원본 데이터만 표시 중")
            elif show_augmented_only:
                display_df = augmented_df.tail(len(augmented_df) - len(original_df))
                st.info("증강된 데이터만 표시 중")
            else:
                display_df = augmented_df
            
            st.dataframe(display_df, use_container_width=True, height=400)
            
            # 데이터 다운로드
            col_download1, col_download2 = st.columns(2)
            
            with col_download1:
                # UTF-8 CSV (일반적인 용도)
                csv_utf8 = augmented_df.to_csv(index=False, encoding='utf-8')
                st.download_button(
                    label="📥 CSV 다운로드 (UTF-8)",
                    data=csv_utf8,
                    file_name="augmented_data_utf8.csv",
                    mime="text/csv",
                    help="일반적인 CSV 형식. 메모장, VS Code 등에서 올바르게 표시됩니다."
                )
            
            with col_download2:
                # CP949 CSV (Excel용)
                try:
                    csv_cp949 = augmented_df.to_csv(index=False, encoding='cp949')
                    st.download_button(
                        label="📥 CSV 다운로드 (Excel용)",
                        data=csv_cp949,
                        file_name="augmented_data_excel.csv",
                        mime="text/csv",
                        help="Excel에서 한글이 깨지지 않도록 인코딩된 CSV 파일입니다."
                    )
                except UnicodeEncodeError:
                    # CP949로 인코딩할 수 없는 문자가 있는 경우 UTF-8 BOM 사용
                    csv_utf8_bom = '\ufeff' + augmented_df.to_csv(index=False, encoding='utf-8')
                    st.download_button(
                        label="📥 CSV 다운로드 (Excel용 UTF-8)",
                        data=csv_utf8_bom.encode('utf-8'),
                        file_name="augmented_data_excel_utf8.csv",
                        mime="text/csv",
                        help="Excel에서 한글이 깨지지 않는 UTF-8 BOM 형식입니다."
                    )
        
        with tab2:
            st.subheader("데이터 분포 비교 (Before vs After)")
            
            # 수치형 컬럼 선택
            numeric_columns = augmented_df.select_dtypes(include=[np.number]).columns.tolist()
            
            if len(numeric_columns) > 0:
                selected_column = st.selectbox(
                    "시각화할 컬럼 선택",
                    options=numeric_columns,
                    key="viz_column"
                )
                
                visualizer = DataVisualizer()
                fig = visualizer.plot_distribution_comparison(
                    original_df, augmented_df, selected_column
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("수치형 데이터가 없어 분포 비교를 표시할 수 없습니다.")
        
        with tab3:
            st.subheader("상세 통계 정보")
            
            col3_1, col3_2 = st.columns(2)
            
            with col3_1:
                st.write("**원본 데이터 통계**")
                st.dataframe(
                    original_df.describe(),
                    use_container_width=True
                )
            
            with col3_2:
                st.write("**증강된 데이터 통계**")
                st.dataframe(
                    augmented_df.describe(),
                    use_container_width=True
                )
    
    else:
        st.info("왼쪽 패널에서 데이터를 업로드하고 증강을 실행해주세요.")

# 푸터
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center'>
        <p>📊 Data Augmentation Platform | Powered by Streamlit</p>
    </div>
    """,
    unsafe_allow_html=True
)

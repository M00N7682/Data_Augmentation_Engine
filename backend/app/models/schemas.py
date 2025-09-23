from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from enum import Enum

class AugmentationMethod(str, Enum):
    SMOTE = "smote"
    GAUSSIAN_COPULA = "gaussian_copula"
    BAYESIAN_NETWORK = "bayesian_network"

class MissingStrategy(str, Enum):
    MEAN = "mean"
    MEDIAN = "median"
    MODE = "mode"
    DROP = "drop"
    INTERPOLATE = "interpolate"

class OutlierStrategy(str, Enum):
    NONE = "none"
    IQR = "iqr"
    ZSCORE = "zscore"
    ISOLATION_FOREST = "isolation_forest"

class DataTypeEnum(str, Enum):
    NUMERIC = "numeric"
    CATEGORICAL = "categorical"
    DATETIME = "datetime"
    TEXT = "text"

class PreprocessingConfig(BaseModel):
    missing_strategy: MissingStrategy = MissingStrategy.MEAN
    outlier_strategy: OutlierStrategy = OutlierStrategy.NONE
    column_types: Dict[str, DataTypeEnum] = {}

class AugmentationConfig(BaseModel):
    method: AugmentationMethod = AugmentationMethod.GAUSSIAN_COPULA
    target_column: Optional[str] = None
    augmentation_ratio: Optional[float] = 1.0
    target_rows: Optional[int] = None
    k_neighbors: Optional[int] = 5
    sampling_strategy: Optional[str] = "auto"

class ProcessingRequest(BaseModel):
    preprocessing_config: PreprocessingConfig
    augmentation_config: AugmentationConfig

class ProcessingResponse(BaseModel):
    success: bool
    message: str
    original_rows: int
    augmented_rows: int
    increase_ratio: float
    processing_time: float

class DataSummary(BaseModel):
    total_rows: int
    total_columns: int
    numeric_columns: List[str]
    categorical_columns: List[str]
    missing_values: Dict[str, int]
    data_types: Dict[str, str]

class VisualizationRequest(BaseModel):
    column_name: str
    chart_type: str = "distribution"
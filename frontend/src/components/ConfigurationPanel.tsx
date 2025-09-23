import { useState } from 'react';
import { Card, Select, Slider, Radio, Button, InputNumber, Typography, Row, Col, Space } from 'antd';
import { ProcessingConfig } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface ConfigurationPanelProps {
  columns: string[];
  numericColumns: string[];
  onConfigChange: (config: ProcessingConfig) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  columns,
  numericColumns,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<ProcessingConfig>({
    preprocessing_config: {
      missing_strategy: 'mean',
      outlier_strategy: 'none',
      column_types: {},
    },
    augmentation_config: {
      method: 'gaussian_copula',
      augmentation_ratio: 1.0,
    },
  });

  const [augmentationType, setAugmentationType] = useState<'ratio' | 'target_rows'>('ratio');
  const [targetRows, setTargetRows] = useState<number>(1000);

  const updateConfig = (newConfig: Partial<ProcessingConfig>) => {
    const updatedConfig = {
      ...config,
      ...newConfig,
      preprocessing_config: {
        ...config.preprocessing_config,
        ...newConfig.preprocessing_config,
      },
      augmentation_config: {
        ...config.augmentation_config,
        ...newConfig.augmentation_config,
      },
    };
    setConfig(updatedConfig);
    onConfigChange(updatedConfig);
  };

  const handleColumnTypeChange = (column: string, type: string) => {
    updateConfig({
      preprocessing_config: {
        ...config.preprocessing_config,
        column_types: {
          ...config.preprocessing_config.column_types,
          [column]: type,
        },
      },
    });
  };

  const handleAugmentationTypeChange = (type: 'ratio' | 'target_rows') => {
    setAugmentationType(type);
    if (type === 'ratio') {
      updateConfig({
        augmentation_config: {
          ...config.augmentation_config,
          target_rows: undefined,
          augmentation_ratio: 1.0,
        },
      });
    } else {
      updateConfig({
        augmentation_config: {
          ...config.augmentation_config,
          target_rows: targetRows,
          augmentation_ratio: undefined,
        },
      });
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 데이터 타입 설정 */}
      <Card title="🔧 데이터 타입 설정" size="small">
        <Row gutter={[16, 16]}>
          {columns.map((column) => (
            <Col span={12} key={column}>
              <Text strong>{column}</Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                defaultValue={numericColumns.includes(column) ? 'numeric' : 'categorical'}
                onChange={(value) => handleColumnTypeChange(column, value)}
              >
                <Option value="numeric">숫자형</Option>
                <Option value="categorical">범주형</Option>
                <Option value="datetime">날짜형</Option>
                <Option value="text">텍스트</Option>
              </Select>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 전처리 설정 */}
      <Card title="🛠️ 전처리 설정" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>결측값 처리 방법</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={config.preprocessing_config.missing_strategy}
              onChange={(value) =>
                updateConfig({
                  preprocessing_config: { ...config.preprocessing_config, missing_strategy: value },
                })
              }
            >
              <Option value="mean">평균값</Option>
              <Option value="median">중앙값</Option>
              <Option value="mode">최빈값</Option>
              <Option value="drop">제거</Option>
              <Option value="interpolate">보간</Option>
            </Select>
          </div>

          <div>
            <Text strong>이상치 처리 방법</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={config.preprocessing_config.outlier_strategy}
              onChange={(value) =>
                updateConfig({
                  preprocessing_config: { ...config.preprocessing_config, outlier_strategy: value },
                })
              }
            >
              <Option value="none">처리하지 않음</Option>
              <Option value="iqr">IQR 방법</Option>
              <Option value="zscore">Z-Score 방법</Option>
              <Option value="isolation_forest">Isolation Forest</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* 증강 설정 */}
      <Card title="🚀 데이터 증강 설정" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>증강 방법</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={config.augmentation_config.method}
              onChange={(value) => {
                if (value === 'smote') {
                  updateConfig({
                    augmentation_config: {
                      ...config.augmentation_config,
                      method: value,
                      target_column: columns[0],
                      k_neighbors: 5,
                      sampling_strategy: 'auto',
                    },
                  });
                } else {
                  updateConfig({
                    augmentation_config: {
                      ...config.augmentation_config,
                      method: value,
                      target_column: undefined,
                      k_neighbors: undefined,
                      sampling_strategy: undefined,
                    },
                  });
                }
              }}
            >
              <Option value="smote">SMOTE</Option>
              <Option value="gaussian_copula">Gaussian Copula</Option>
              <Option value="bayesian_network">Bayesian Network</Option>
            </Select>
          </div>

          {config.augmentation_config.method === 'smote' && (
            <>
              <div>
                <Text strong>타겟 컬럼</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={config.augmentation_config.target_column}
                  onChange={(value) =>
                    updateConfig({
                      augmentation_config: { ...config.augmentation_config, target_column: value },
                    })
                  }
                >
                  {columns.map((col) => (
                    <Option key={col} value={col}>
                      {col}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>K-Neighbors: {config.augmentation_config.k_neighbors}</Text>
                <Slider
                  min={1}
                  max={10}
                  value={config.augmentation_config.k_neighbors}
                  onChange={(value) =>
                    updateConfig({
                      augmentation_config: { ...config.augmentation_config, k_neighbors: value },
                    })
                  }
                />
              </div>

              <div>
                <Text strong>샘플링 전략</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={config.augmentation_config.sampling_strategy}
                  onChange={(value) =>
                    updateConfig({
                      augmentation_config: { ...config.augmentation_config, sampling_strategy: value },
                    })
                  }
                >
                  <Option value="auto">자동</Option>
                  <Option value="minority">소수 클래스</Option>
                  <Option value="not majority">다수 클래스 제외</Option>
                  <Option value="all">모든 클래스</Option>
                </Select>
              </div>
            </>
          )}

          {config.augmentation_config.method !== 'smote' && (
            <>
              <div>
                <Text strong>증강 방식</Text>
                <Radio.Group
                  value={augmentationType}
                  onChange={(e) => handleAugmentationTypeChange(e.target.value)}
                  style={{ marginTop: 4 }}
                >
                  <Radio value="ratio">비율로 설정</Radio>
                  <Radio value="target_rows">목표 행 수 설정</Radio>
                </Radio.Group>
              </div>

              {augmentationType === 'ratio' ? (
                <div>
                  <Text strong>
                    증강 비율: {config.augmentation_config.augmentation_ratio?.toFixed(1)}
                  </Text>
                  <Slider
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    value={config.augmentation_config.augmentation_ratio}
                    onChange={(value) =>
                      updateConfig({
                        augmentation_config: { ...config.augmentation_config, augmentation_ratio: value },
                      })
                    }
                  />
                </div>
              ) : (
                <div>
                  <Text strong>목표 총 행 수</Text>
                  <InputNumber
                    style={{ width: '100%', marginTop: 4 }}
                    value={targetRows}
                    min={100}
                    max={100000}
                    step={100}
                    onChange={(value) => {
                      setTargetRows(value || 1000);
                      updateConfig({
                        augmentation_config: { ...config.augmentation_config, target_rows: value ?? undefined },
                      });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default ConfigurationPanel;
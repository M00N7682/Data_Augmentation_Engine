import React, { useState, useEffect } from 'react';
import { Layout, Typography, Steps, Button, message, Spin, Alert } from 'antd';
import FileUpload from '../components/FileUpload';
import ConfigurationPanel from '../components/ConfigurationPanel';
import ResultsPanel from '../components/ResultsPanel';
import { dataAPI, ProcessingConfig, DataSummary } from '../services/api';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;
const { Step } = Steps;

const MainPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [visualization, setVisualization] = useState<any>(null);
  const [processingConfig, setProcessingConfig] = useState<ProcessingConfig | null>(null);

  const steps = [
    {
      title: '데이터 업로드',
      description: 'CSV 파일을 업로드하세요',
    },
    {
      title: '설정',
      description: '전처리 및 증강 옵션을 설정하세요',
    },
    {
      title: '처리',
      description: '데이터를 처리합니다',
    },
    {
      title: '결과',
      description: '결과를 확인하고 다운로드하세요',
    },
  ];

  const handleUploadSuccess = (data: any) => {
    setUploadedData(data);
    setCurrentStep(1);
  };

  const handleDataSummary = (summary: DataSummary) => {
    setDataSummary(summary);
  };

  const handleConfigChange = (config: ProcessingConfig) => {
    setProcessingConfig(config);
  };

  const handleProcessData = async () => {
    if (!processingConfig) {
      message.error('처리 설정을 완료해주세요.');
      return;
    }

    setLoading(true);
    setCurrentStep(2);

    try {
      // 데이터 처리 실행
      const response = await dataAPI.processData(processingConfig);
      message.success(response.message);

      // 결과 데이터 가져오기
      const processedResult = await dataAPI.getProcessedData(0, 100);
      setProcessedData(processedResult);

      // 통계 정보 가져오기
      const statsResult = await dataAPI.getStatistics();
      setStatistics(statsResult);

      // 시각화 생성 (첫 번째 숫자형 컬럼 사용)
      if (dataSummary && Array.isArray(dataSummary.numeric_columns) && dataSummary.numeric_columns.length > 0) {
        try {
          const vizResult = await dataAPI.createVisualization(
            dataSummary.numeric_columns[0],
            'distribution'
          );
          setVisualization(vizResult);
        } catch (error) {
          console.warn('시각화 생성 중 오류:', error);
        }
      }

      setCurrentStep(3);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || '데이터 처리 중 오류가 발생했습니다.';
      message.error(errorMessage);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onDataSummary={handleDataSummary}
          />
        );
      
      case 1:
        return dataSummary ? (
          <div>
            <ConfigurationPanel
              columns={Object.keys(dataSummary.data_types)}
              numericColumns={dataSummary.numeric_columns}
              onConfigChange={handleConfigChange}
            />
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={handleProcessData}
                disabled={!processingConfig}
              >
                🚀 데이터 증강 실행
              </Button>
            </div>
          </div>
        ) : null;

      case 2:
        return (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Title level={3}>데이터를 처리 중입니다...</Title>
              <Paragraph>잠시만 기다려주세요. 데이터 크기에 따라 시간이 걸릴 수 있습니다.</Paragraph>
            </div>
          </div>
        );

      case 3:
        return (
          <ResultsPanel
            processedData={processedData}
            statistics={statistics}
            visualization={visualization}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px #f0f1f2' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            📊 CSV 데이터 증강 엔진
          </Title>
        </div>
      </Header>

      <Content style={{ padding: '24px 50px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={3}>기존의 원본 데이터와 통계적 분포가 유사하게 데이터를 증강해주는 서비스입니다</Title>
            <Paragraph type="secondary">
              에러신고 및 문의는 dfjk71@khu.ac.kr로 부탁드립니다.
            </Paragraph>
          </div>

          <Steps current={currentStep} style={{ marginBottom: '32px' }}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} description={step.description} />
            ))}
          </Steps>

          {renderStepContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default MainPage;
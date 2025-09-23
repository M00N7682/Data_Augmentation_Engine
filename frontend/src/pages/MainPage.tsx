import React, { useState } from 'react';
import { Layout, Typography } from 'antd';
import NavBar from '../components/NavBar';
import DataAugmentationPage from './DataAugmentationPage';
import PublicDataPage from './PublicDataPage';
import DataAnalysisPage from './DataAnalysisPage';
import OptionsPage from './OptionsPage';
import LoginPage from './LoginPage';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const MainPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const renderSelectedTool = () => {
    switch (selectedTool) {
      case 'public-data':
        return <PublicDataPage />;
      case 'data-augmentation':
        return <DataAugmentationPage />;
      case 'data-analysis':
        return <DataAnalysisPage />;
      case 'options':
        return <OptionsPage />;
      case 'login':
        return <LoginPage />;
      default:
        return (
          <Content style={{ padding: '24px 50px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px' }}>
              <Title level={1} style={{ fontSize: '3em', marginBottom: '24px' }}>
                🏛️ DDDB Platform
              </Title>
              <Title level={3} style={{ color: '#666', fontWeight: 'normal', marginBottom: '32px' }}>
                Data-Driven Decision-making Bureau
              </Title>
              <Paragraph style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '40px' }}>
                공공데이터 저장소, CSV 데이터 증강 엔진, AI 분석 Agent 등 다양한 데이터 분석 도구를 제공합니다.
                <br />
                상단의 메뉴에서 원하는 도구를 선택하여 시작하세요.
              </Paragraph>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '40px' }}>
                <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
                  <Title level={4}>🏛️ 공공데이터</Title>
                  <Paragraph>다양한 공공데이터 검색 및 활용</Paragraph>
                </div>
                <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
                  <Title level={4}>📊 데이터 증강</Title>
                  <Paragraph>CSV 데이터의 통계적 증강</Paragraph>
                </div>
                <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
                  <Title level={4}>🤖 AI 분석</Title>
                  <Paragraph>인공지능 기반 데이터 분석</Paragraph>
                </div>
              </div>
            </div>
          </Content>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <NavBar selectedTool={selectedTool} onToolSelect={handleToolSelect} />
      {renderSelectedTool()}
    </Layout>
  );
};

export default MainPage;
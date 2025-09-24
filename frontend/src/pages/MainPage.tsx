import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Space, Divider, Timeline, Statistic } from 'antd';
import { DatabaseOutlined, BarChartOutlined, RobotOutlined, SafetyCertificateOutlined, ThunderboltOutlined, GlobalOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/SimpleAuthContext';
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
  const { isAuthenticated, user } = useAuth();

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const renderSelectedTool = () => {
    // 로그인이 필요한 도구들
    const authRequiredTools = ['data-augmentation', 'data-analysis'];
    
    if (authRequiredTools.includes(selectedTool || '') && !isAuthenticated) {
      return <LoginPage />;
    }

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
          <Content style={{ padding: '0', minHeight: 'calc(100vh - 64px)' }}>
            {/* Hero Section */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '100px 50px',
              textAlign: 'center'
            }}>
              <Title level={1} style={{ 
                color: 'white', 
                fontSize: '3.5em', 
                marginBottom: '16px',
                fontWeight: '700'
              }}>
                🏛️ D-Craft
              </Title>
              <Title level={2} style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontWeight: '300', 
                marginBottom: '32px',
                fontSize: '1.5em'
              }}>
                데이터, 누구나 쉽게. 디크래프트에서 시작하세요.
              </Title>
              {isAuthenticated && (
                <div style={{ marginBottom: '20px', padding: '12px 24px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'inline-block' }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  <span>{user?.username}님, 환영합니다!</span>
                </div>
              )}
              <Paragraph style={{ 
                fontSize: '20px', 
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '48px',
                maxWidth: '800px',
                margin: '0 auto 48px',
                lineHeight: '1.6'
              }}>
                데이터 분석의 모든 과정을 하나의 플랫폼에서 경험하세요. 
                공공데이터 활용부터 AI 기반 인사이트 도출까지, 
                전문적인 데이터 분석 도구를 웹에서 간편하게 이용할 수 있습니다.
              </Paragraph>
              <Space size="large">
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ height: '48px', fontSize: '16px', borderRadius: '24px', padding: '0 32px' }}
                  onClick={() => handleToolSelect('public-data')}
                >
                  시작하기
                </Button>
                {!isAuthenticated && (
                  <Button 
                    size="large" 
                    style={{ 
                      height: '48px', 
                      fontSize: '16px', 
                      borderRadius: '24px', 
                      padding: '0 32px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      color: 'white'
                    }}
                    onClick={() => handleToolSelect('login')}
                  >
                    로그인
                  </Button>
                )}
              </Space>
            </div>

            {/* Features Section */}
            <div style={{ padding: '80px 50px', background: '#fff' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '16px', fontSize: '2.5em' }}>
                  🌟 핵심 기능
                </Title>
                <Paragraph style={{ 
                  textAlign: 'center', 
                  fontSize: '18px', 
                  color: '#666', 
                  marginBottom: '64px',
                  maxWidth: '600px',
                  margin: '0 auto 64px'
                }}>
                  전문적인 데이터 분석 도구들을 직관적인 웹 인터페이스로 제공합니다
                </Paragraph>
                
                <Row gutter={[32, 32]}>
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ 
                        height: '100%', 
                        textAlign: 'center',
                        border: '1px solid #f0f0f0',
                        borderRadius: '16px',
                        transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ padding: '40px 24px' }}
                      onClick={() => handleToolSelect('public-data')}
                    >
                      <DatabaseOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                      <Title level={3} style={{ marginBottom: '16px' }}>공공데이터 저장소</Title>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
                        정부 및 공공기관의 다양한 오픈데이터를 통합 검색하고 활용하세요. 
                        정책 연구부터 비즈니스 분석까지 풍부한 데이터를 제공합니다.
                      </Paragraph>
                      <div style={{ marginTop: '24px' }}>
                        <Button type="link" size="large">
                          자세히 보기 →
                        </Button>
                      </div>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ 
                        height: '100%', 
                        textAlign: 'center',
                        border: '1px solid #f0f0f0',
                        borderRadius: '16px',
                        transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ padding: '40px 24px' }}
                      onClick={() => isAuthenticated ? handleToolSelect('data-augmentation') : handleToolSelect('login')}
                    >
                      <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                      <Title level={3} style={{ marginBottom: '16px' }}>CSV 데이터 증강 엔진</Title>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
                        Gaussian Copula, SMOTE 등 고급 알고리즘으로 기존 데이터의 통계적 특성을 보존하며 
                        데이터를 증강합니다. 머신러닝 학습 성능을 획기적으로 향상시키세요.
                      </Paragraph>
                      <div style={{ marginTop: '24px' }}>
                        {!isAuthenticated && <SafetyCertificateOutlined style={{ color: '#faad14', marginRight: '8px' }} />}
                        <Button type="link" size="large">
                          {isAuthenticated ? '사용하기' : '로그인 필요'} →
                        </Button>
                      </div>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ 
                        height: '100%', 
                        textAlign: 'center',
                        border: '1px solid #f0f0f0',
                        borderRadius: '16px',
                        transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ padding: '40px 24px' }}
                      onClick={() => isAuthenticated ? handleToolSelect('data-analysis') : handleToolSelect('login')}
                    >
                      <RobotOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                      <Title level={3} style={{ marginBottom: '16px' }}>AI 데이터 분석 Agent</Title>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
                        업로드한 CSV 데이터를 AI가 자동으로 분석하여 패턴을 발견하고 
                        비즈니스 인사이트를 도출합니다. 전문 지식 없이도 고급 분석이 가능합니다.
                      </Paragraph>
                      <div style={{ marginTop: '24px' }}>
                        {!isAuthenticated && <SafetyCertificateOutlined style={{ color: '#faad14', marginRight: '8px' }} />}
                        <Button type="link" size="large">
                          {isAuthenticated ? '분석하기' : '로그인 필요'} →
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Statistics Section */}
            <div style={{ padding: '80px 50px', background: '#f8f9fa' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <Title level={2} style={{ marginBottom: '48px', fontSize: '2.5em' }}>
                  📊 신뢰할 수 있는 플랫폼
                </Title>
                <Row gutter={[32, 32]}>
                  <Col xs={12} md={6}>
                    <Statistic 
                      title="지원 데이터 형식" 
                      value={10} 
                      suffix="+" 
                      valueStyle={{ color: '#1890ff', fontSize: '2.5em' }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic 
                      title="AI 분석 알고리즘" 
                      value={15} 
                      suffix="+" 
                      valueStyle={{ color: '#52c41a', fontSize: '2.5em' }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic 
                      title="데이터 증강 방법" 
                      value={8} 
                      suffix="+" 
                      valueStyle={{ color: '#722ed1', fontSize: '2.5em' }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic 
                      title="보안 수준" 
                      value={99.9} 
                      suffix="%" 
                      valueStyle={{ color: '#fa8c16', fontSize: '2.5em' }}
                    />
                  </Col>
                </Row>
              </div>
            </div>

            {/* Process Section */}
            <div style={{ padding: '80px 50px', background: '#fff' }}>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.5em' }}>
                  🚀 간단한 사용 과정
                </Title>
                <Timeline 
                  mode="alternate"
                  style={{ marginTop: '48px' }}
                  items={[
                    {
                      children: (
                        <Card style={{ borderRadius: '12px' }}>
                          <Title level={4}>1. 데이터 업로드</Title>
                          <Paragraph>CSV 파일을 드래그 앤 드롭으로 간편하게 업로드하세요</Paragraph>
                        </Card>
                      ),
                      dot: <DatabaseOutlined style={{ fontSize: '16px' }} />
                    },
                    {
                      children: (
                        <Card style={{ borderRadius: '12px' }}>
                          <Title level={4}>2. 분석 옵션 설정</Title>
                          <Paragraph>원하는 전처리 방법과 분석 알고리즘을 선택하세요</Paragraph>
                        </Card>
                      ),
                      dot: <BarChartOutlined style={{ fontSize: '16px' }} />
                    },
                    {
                      children: (
                        <Card style={{ borderRadius: '12px' }}>
                          <Title level={4}>3. AI 자동 분석</Title>
                          <Paragraph>고성능 서버에서 AI가 데이터를 분석하고 인사이트를 도출합니다</Paragraph>
                        </Card>
                      ),
                      dot: <RobotOutlined style={{ fontSize: '16px' }} />
                    },
                    {
                      children: (
                        <Card style={{ borderRadius: '12px' }}>
                          <Title level={4}>4. 결과 확인 및 다운로드</Title>
                          <Paragraph>시각화된 분석 결과를 확인하고 증강된 데이터를 다운로드하세요</Paragraph>
                        </Card>
                      ),
                      dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />
                    }
                  ]}
                />
              </div>
            </div>

            {/* Technology Section */}
            <div style={{ padding: '80px 50px', background: '#001529', color: 'white' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <Title level={2} style={{ color: 'white', marginBottom: '48px', fontSize: '2.5em' }}>
                  🛠️ 최신 기술 스택
                </Title>
                <Row gutter={[32, 32]}>
                  <Col xs={24} md={8}>
                    <ThunderboltOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                    <Title level={3} style={{ color: 'white' }}>고성능 처리</Title>
                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      FastAPI와 Python을 기반으로 한 비동기 처리로 대용량 데이터도 빠르게 분석합니다
                    </Paragraph>
                  </Col>
                  <Col xs={24} md={8}>
                    <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                    <Title level={3} style={{ color: 'white' }}>엔터프라이즈 보안</Title>
                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      JWT 토큰 기반 인증과 데이터 암호화로 기업급 보안 수준을 제공합니다
                    </Paragraph>
                  </Col>
                  <Col xs={24} md={8}>
                    <GlobalOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                    <Title level={3} style={{ color: 'white' }}>클라우드 네이티브</Title>
                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      어디서나 접속 가능한 웹 기반 플랫폼으로 별도 설치 없이 바로 이용 가능합니다
                    </Paragraph>
                  </Col>
                </Row>
              </div>
            </div>

            {/* CTA Section */}
            <div style={{ padding: '80px 50px', background: '#f0f2f5', textAlign: 'center' }}>
              <Title level={2} style={{ marginBottom: '24px', fontSize: '2.5em' }}>
                🎯 지금 시작해보세요
              </Title>
              <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
                DDDB Platform과 함께 데이터 기반 의사결정의 새로운 경험을 시작하세요
              </Paragraph>
              <Space size="large">
                {!isAuthenticated ? (
                  <>
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ height: '48px', fontSize: '16px', borderRadius: '24px', padding: '0 32px' }}
                      onClick={() => handleToolSelect('login')}
                    >
                      로그인하기
                    </Button>
                    <Button 
                      size="large" 
                      style={{ height: '48px', fontSize: '16px', borderRadius: '24px', padding: '0 32px' }}
                      onClick={() => handleToolSelect('public-data')}
                    >
                      둘러보기
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ height: '48px', fontSize: '16px', borderRadius: '24px', padding: '0 32px' }}
                      onClick={() => handleToolSelect('data-augmentation')}
                    >
                      데이터 증강하기
                    </Button>
                    <Button 
                      size="large" 
                      style={{ height: '48px', fontSize: '16px', borderRadius: '24px', padding: '0 32px' }}
                      onClick={() => handleToolSelect('data-analysis')}
                    >
                      AI 분석하기
                    </Button>
                  </>
                )}
              </Space>
              <Divider style={{ margin: '48px 0 24px' }} />
              <Paragraph style={{ color: '#999', fontSize: '14px' }}>
                문의: dfjk71@khu.ac.kr | Data-Driven Decision-making Bureau
              </Paragraph>
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
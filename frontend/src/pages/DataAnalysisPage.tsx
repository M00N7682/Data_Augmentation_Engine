import React from 'react';
import { Layout, Typography, Card, Space } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const DataAnalysisPage: React.FC = () => {
  return (
    <Content style={{ padding: '24px 50px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>🤖 CSV 데이터 분석 Agent</Title>
          <Paragraph type="secondary">
            AI 기반으로 CSV 데이터를 자동 분석하고 인사이트를 제공합니다.
          </Paragraph>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="데이터 업로드" size="small">
            <Paragraph>분석할 CSV 파일을 업로드하세요.</Paragraph>
          </Card>

          <Card title="자동 분석" size="small">
            <Paragraph>AI Agent가 데이터를 분석하고 패턴을 찾아드립니다.</Paragraph>
          </Card>

          <Card title="인사이트 리포트" size="small">
            <Paragraph>분석 결과와 데이터 인사이트를 제공합니다.</Paragraph>
          </Card>
        </Space>
      </div>
    </Content>
  );
};

export default DataAnalysisPage;
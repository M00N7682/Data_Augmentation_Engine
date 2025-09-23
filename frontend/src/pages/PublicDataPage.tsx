import React from 'react';
import { Layout, Typography, Card, Space } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PublicDataPage: React.FC = () => {
  return (
    <Content style={{ padding: '24px 50px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>🏛️ 공공데이터 저장소</Title>
          <Paragraph type="secondary">
            다양한 공공데이터를 검색하고 활용할 수 있습니다.
          </Paragraph>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="데이터 검색" size="small">
            <Paragraph>공공데이터 검색 기능이 여기에 구현됩니다.</Paragraph>
          </Card>

          <Card title="인기 데이터셋" size="small">
            <Paragraph>인기있는 공공데이터셋 목록이 여기에 표시됩니다.</Paragraph>
          </Card>

          <Card title="최근 업데이트" size="small">
            <Paragraph>최근에 업데이트된 데이터셋 정보가 여기에 표시됩니다.</Paragraph>
          </Card>
        </Space>
      </div>
    </Content>
  );
};

export default PublicDataPage;
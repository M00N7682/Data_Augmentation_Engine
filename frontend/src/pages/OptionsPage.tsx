import React from 'react';
import { Layout, Typography, Card, Space, Switch, Select, Button } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

const OptionsPage: React.FC = () => {
  return (
    <Content style={{ padding: '24px 50px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>⚙️ 옵션</Title>
          <Paragraph type="secondary">
            시스템 설정을 관리할 수 있습니다.
          </Paragraph>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="일반 설정" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>다크 모드</span>
                <Switch />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>언어 설정</span>
                <Select defaultValue="ko" style={{ width: 120 }}>
                  <Option value="ko">한국어</Option>
                  <Option value="en">English</Option>
                </Select>
              </div>
            </Space>
          </Card>

          <Card title="알림 설정" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>이메일 알림</span>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>브라우저 알림</span>
                <Switch />
              </div>
            </Space>
          </Card>

          <Card title="데이터 설정" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>자동 저장</span>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>캐시 사용</span>
                <Switch defaultChecked />
              </div>
            </Space>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Space>
              <Button type="primary">설정 저장</Button>
              <Button>초기화</Button>
            </Space>
          </div>
        </Space>
      </div>
    </Content>
  );
};

export default OptionsPage;
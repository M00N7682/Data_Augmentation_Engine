import React from 'react';
import { Layout, Typography, Card, Form, Input, Button, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('로그인 시도:', values);
  };

  return (
    <Content style={{ padding: '24px 50px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>🔐 로그인</Title>
          <Paragraph type="secondary">
            DDDB 플랫폼에 로그인하세요.
          </Paragraph>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '사용자명을 입력해주세요!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="사용자명" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="비밀번호" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              로그인
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical">
            <Button type="link">비밀번호 찾기</Button>
            <Button type="link">회원가입</Button>
          </Space>
        </div>
      </Card>
    </Content>
  );
};

export default LoginPage;
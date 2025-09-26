import React from 'react';
import { Layout, Typography, Card, Form, Input, Button, Space, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
}

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      message.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.full_name || ''
      };

      await authAPI.register(registerData);
      message.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        if (onNavigateToLogin) {
          onNavigateToLogin();
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = '회원가입에 실패했습니다.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content style={{ 
      padding: '24px 50px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 64px)' 
    }}>
      <Card style={{ 
        width: 450, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>🚀 회원가입</Title>
          <Paragraph type="secondary">
            DDDB 플랫폼에 가입하여 데이터 분석을 시작하세요.
          </Paragraph>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            label="사용자명"
            rules={[
              { required: true, message: '사용자명을 입력해주세요!' },
              { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다.' },
              { max: 30, message: '사용자명은 최대 30자까지 가능합니다.' },
              { 
                pattern: /^[a-zA-Z0-9_]+$/, 
                message: '사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.' 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="사용자명 (영문, 숫자, _ 만 사용)" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요!' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="example@email.com" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="전체 이름 (선택사항)"
            rules={[
              { max: 100, message: '이름은 최대 100자까지 가능합니다.' }
            ]}
          >
            <Input 
              prefix={<TeamOutlined />} 
              placeholder="홍길동" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요!' },
              { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
              {
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
                message: '비밀번호는 영문과 숫자를 포함해야 합니다.'
              }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="영문+숫자 조합, 6자 이상" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="비밀번호 확인"
            dependencies={['password']}
            rules={[
              { required: true, message: '비밀번호 확인을 입력해주세요!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="비밀번호를 다시 입력해주세요" 
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Space>
            <span>이미 계정이 있으신가요?</span>
            <Button 
              type="link" 
              onClick={onNavigateToLogin}
              style={{ padding: 0 }}
            >
              로그인
            </Button>
          </Space>
        </div>
      </Card>
    </Content>
  );
};

export default RegisterPage;
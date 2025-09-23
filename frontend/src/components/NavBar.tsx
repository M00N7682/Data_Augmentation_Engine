import React from 'react';
import { Menu, Layout, Button, Space } from 'antd';
import { DatabaseOutlined, BarChartOutlined, RobotOutlined, SettingOutlined, LoginOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface NavBarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ selectedTool, onToolSelect }) => {
  const menuItems = [
    {
      key: 'public-data',
      icon: <DatabaseOutlined />,
      label: '공공데이터 저장소',
    },
    {
      key: 'data-augmentation',
      icon: <BarChartOutlined />,
      label: 'CSV 데이터 증강 엔진',
    },
    {
      key: 'data-analysis',
      icon: <RobotOutlined />,
      label: 'CSV 데이터 분석 Agent',
    },
    {
      key: 'options',
      icon: <SettingOutlined />,
      label: '옵션',
    },
    {
      key: 'login',
      icon: <LoginOutlined />,
      label: '로그인',
    },
  ];

  return (
    <Header style={{ 
      background: '#fff', 
      padding: '0 50px', 
      boxShadow: '0 2px 8px #f0f1f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ 
          margin: 0, 
          color: '#1890ff', 
          fontSize: '24px',
          fontWeight: 'bold',
          marginRight: '40px'
        }}>
          📊 DDDB Platform
        </h1>
      </div>
      
      <Space size="large">
        {menuItems.map((item) => (
          <Button
            key={item.key}
            type={selectedTool === item.key ? 'primary' : 'text'}
            icon={item.icon}
            onClick={() => onToolSelect(item.key)}
            style={{
              height: '40px',
              fontSize: '14px',
              fontWeight: selectedTool === item.key ? 'bold' : 'normal',
            }}
          >
            {item.label}
          </Button>
        ))}
      </Space>
    </Header>
  );
};

export default NavBar;
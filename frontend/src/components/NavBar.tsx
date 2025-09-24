import { Menu, Layout, Button, Space } from 'antd';
import { DatabaseOutlined, BarChartOutlined, RobotOutlined, SettingOutlined, LoginOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/SimpleAuthContext';

const { Header } = Layout;

interface NavBarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ selectedTool, onToolSelect }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onToolSelect(''); // 메인 페이지로 이동
  };

  const menuItems = [
    {
      key: 'public-data',
      icon: <DatabaseOutlined />,
      label: '공공데이터 저장소',
      authRequired: false,
    },
    {
      key: 'data-augmentation',
      icon: <BarChartOutlined />,
      label: 'CSV 데이터 증강 엔진',
      authRequired: true,
    },
    {
      key: 'data-analysis',
      icon: <RobotOutlined />,
      label: 'CSV 데이터 분석 Agent', 
      authRequired: true,
    },
    {
      key: 'options',
      icon: <SettingOutlined />,
      label: '옵션',
      authRequired: false,
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
        <h1 
          style={{ 
            margin: 0, 
            color: '#1890ff', 
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '40px',
            cursor: 'pointer'
          }}
          onClick={() => onToolSelect('')}
        >
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
            disabled={item.authRequired && !isAuthenticated}
            style={{
              height: '40px',
              fontSize: '14px',
              fontWeight: selectedTool === item.key ? 'bold' : 'normal',
            }}
          >
            {item.label}
          </Button>
        ))}
        
        {/* 로그인/로그아웃 버튼 */}
        {isAuthenticated ? (
          <Space>
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{ height: '40px' }}
            >
              {user?.username}
            </Button>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ height: '40px' }}
            >
              로그아웃
            </Button>
          </Space>
        ) : (
          <Button
            type={selectedTool === 'login' ? 'primary' : 'text'}
            icon={<LoginOutlined />}
            onClick={() => onToolSelect('login')}
            style={{
              height: '40px',
              fontSize: '14px',
              fontWeight: selectedTool === 'login' ? 'bold' : 'normal',
            }}
          >
            로그인
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default NavBar;
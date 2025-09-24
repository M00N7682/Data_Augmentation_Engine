import { useState, useRef, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Upload, 
  Button, 
  Input, 
  Space, 
  message, 
  Spin, 
  Tag, 
  List, 
  Empty,
  Row,
  Col,
  Divider,
  Avatar,
  Alert,
  Tooltip,
  Modal
} from 'antd';
import { 
  UploadOutlined, 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined, 
  FileTextOutlined,
  BulbOutlined,
  ClearOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Plot from 'react-plotly.js';
import { analysisAPI } from '../services/api';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
  chart?: any;
}

interface DataInfo {
  shape: [number, number];
  columns: string[];
  dtypes: Record<string, string>;
  memory_usage: number;
}

const DataAnalysisPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 파일 업로드
  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      message.error('CSV 파일만 업로드 가능합니다.');
      return false;
    }

    setIsUploading(true);
    try {
      const result = await analysisAPI.uploadCSVForAnalysis(file);
      
      if (result.success) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          ...result
        });
        setSuggestions(result.suggested_queries || []);
        
        message.success('파일이 성공적으로 업로드되었습니다!');
        
        // 환영 메시지 추가
        const welcomeMessage: ChatMessage = {
          id: `welcome_${Date.now()}`,
          type: 'assistant',
          message: `안녕하세요! "${file.name}" 파일이 성공적으로 업로드되었습니다.\n\n📊 데이터 정보:\n• 행 수: ${result.data_info.shape[0].toLocaleString()}개\n• 열 수: ${result.data_info.shape[1]}개\n• 컬럼: ${result.data_info.columns.join(', ')}\n\n아래 추천 질문을 클릭하거나 직접 질문을 입력해보세요!`,
          timestamp: new Date().toISOString()
        };
        setChatMessages([welcomeMessage]);
        
      } else {
        message.error(result.error || '파일 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
    
    return false; // 자동 업로드 방지
  };

  // 질문 분석
  const handleAnalyzeQuery = async (query: string) => {
    if (!query.trim()) {
      message.warning('질문을 입력해주세요.');
      return;
    }

    if (!uploadedFile) {
      message.warning('먼저 CSV 파일을 업로드해주세요.');
      return;
    }

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: query,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsAnalyzing(true);

    try {
      const result = await analysisAPI.analyzeQuery(query);
      
      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          message: result.response,
          timestamp: new Date().toISOString(),
          chart: result.chart_data
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
        
      } else {
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          type: 'assistant',
          message: `죄송합니다. 분석 중 오류가 발생했습니다:\n${result.error}`,
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'assistant',
        message: `분석 요청 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 추천 질문 클릭
  const handleSuggestionClick = (suggestion: string) => {
    setInputQuery(suggestion);
    inputRef.current?.focus();
  };

  // 데이터 정보 조회
  const fetchDataInfo = async () => {
    try {
      const info = await analysisAPI.getDataInfo();
      setDataInfo(info);
      setShowDataModal(true);
    } catch (error: any) {
      message.error('데이터 정보를 가져오는데 실패했습니다.');
    }
  };

  // 채팅 초기화
  const clearChat = () => {
    setChatMessages([]);
  };

  // 데이터 삭제
  const clearAllData = async () => {
    Modal.confirm({
      title: '데이터 삭제',
      content: '업로드된 데이터와 모든 대화 내역이 삭제됩니다. 계속하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          await analysisAPI.clearAnalysisData();
          setUploadedFile(null);
          setDataInfo(null);
          setChatMessages([]);
          setSuggestions([]);
          message.success('모든 데이터가 삭제되었습니다.');
        } catch (error) {
          message.error('데이터 삭제에 실패했습니다.');
        }
      }
    });
  };

  const uploadProps = {
    accept: '.csv',
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  return (
    <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 64px)' }}>
      <Row gutter={24} style={{ height: '100%' }}>
        {/* 왼쪽 업로드 및 정보 패널 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 헤더 */}
            <Card>
              <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
                🤖 AI 데이터 분석 Agent
              </Title>
              <Paragraph style={{ textAlign: 'center', margin: '8px 0 0', color: '#666' }}>
                LangChain과 OpenAI를 활용한 자연어 데이터 분석
              </Paragraph>
            </Card>

            {/* 파일 업로드 */}
            <Card title={<><UploadOutlined /> CSV 파일 업로드</>}>
              {!uploadedFile ? (
                <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
                  <p className="ant-upload-drag-icon">
                    <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text">CSV 파일을 클릭하거나 드래그해서 업로드</p>
                  <p className="ant-upload-hint">최대 50MB까지 지원</p>
                </Dragger>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    message="업로드 완료"
                    description={
                      <div>
                        <Text strong>{uploadedFile.filename}</Text><br />
                        <Text type="secondary">
                          {uploadedFile.data_info.shape[0].toLocaleString()}행 × {uploadedFile.data_info.shape[1]}열
                        </Text>
                      </div>
                    }
                    type="success"
                    showIcon
                  />
                  <Space>
                    <Button 
                      icon={<InfoCircleOutlined />} 
                      onClick={fetchDataInfo}
                      size="small"
                    >
                      데이터 정보
                    </Button>
                    <Button 
                      icon={<DeleteOutlined />} 
                      onClick={clearAllData}
                      danger
                      size="small"
                    >
                      삭제
                    </Button>
                  </Space>
                </Space>
              )}
              
              {isUploading && <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '20px' }} />}
            </Card>

            {/* 추천 질문 */}
            {suggestions.length > 0 && (
              <Card title={<><BulbOutlined /> 추천 질문</> }>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      type="text"
                      size="small"
                      style={{ 
                        height: 'auto', 
                        padding: '8px 12px',
                        textAlign: 'left',
                        whiteSpace: 'normal',
                        wordBreak: 'keep-all'
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      💡 {suggestion}
                    </Button>
                  ))}
                </Space>
              </Card>
            )}
          </Space>
        </Col>

        {/* 오른쪽 채팅 패널 */}
        <Col xs={24} lg={16}>
          <Card 
            style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {/* 채팅 헤더 */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Space>
                <BarChartOutlined />
                <Text strong>데이터 분석 대화</Text>
                {chatMessages.length > 0 && (
                  <Tag color="blue">{chatMessages.length}개 메시지</Tag>
                )}
              </Space>
              {chatMessages.length > 0 && (
                <Button 
                  icon={<ClearOutlined />} 
                  size="small" 
                  onClick={clearChat}
                >
                  대화 초기화
                </Button>
              )}
            </div>

            {/* 채팅 메시지 영역 */}
            <div style={{ 
              flex: 1, 
              padding: '16px 24px', 
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 350px)'
            }}>
              {chatMessages.length === 0 ? (
                <Empty
                  description={
                    uploadedFile 
                      ? "질문을 입력하거나 추천 질문을 클릭해보세요" 
                      : "CSV 파일을 업로드하여 분석을 시작하세요"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={chatMessages}
                  renderItem={(item) => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <div style={{ 
                        width: '100%',
                        display: 'flex',
                        justifyContent: item.type === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          flexDirection: item.type === 'user' ? 'row-reverse' : 'row'
                        }}>
                          <Avatar 
                            icon={item.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                            style={{ 
                              backgroundColor: item.type === 'user' ? '#1890ff' : '#52c41a',
                              flexShrink: 0
                            }}
                          />
                          <div style={{
                            backgroundColor: item.type === 'user' ? '#e6f7ff' : '#f6ffed',
                            border: `1px solid ${item.type === 'user' ? '#91d5ff' : '#b7eb8f'}`,
                            borderRadius: '12px',
                            padding: '12px 16px',
                            wordBreak: 'break-word'
                          }}>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                              {item.message}
                            </div>
                            {item.chart && (
                              <div style={{ marginTop: '12px' }}>
                                <Plot
                                  data={JSON.parse(item.chart.data).data}
                                  layout={{
                                    ...JSON.parse(item.chart.data).layout,
                                    width: 400,
                                    height: 300,
                                    margin: { l: 40, r: 40, t: 40, b: 40 }
                                  }}
                                  config={{ displayModeBar: false }}
                                />
                              </div>
                            )}
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#999', 
                              marginTop: '4px',
                              textAlign: item.type === 'user' ? 'right' : 'left'
                            }}>
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
              {isAnalyzing && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '16px',
                  color: '#666'
                }}>
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                  <Spin size="small" />
                  <Text type="secondary">AI가 분석 중입니다...</Text>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#fafafa'
            }}>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  ref={inputRef}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={uploadedFile ? "데이터에 대해 궁금한 것을 물어보세요..." : "먼저 CSV 파일을 업로드해주세요"}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={!uploadedFile || isAnalyzing}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleAnalyzeQuery(inputQuery);
                    }
                  }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  loading={isAnalyzing}
                  disabled={!uploadedFile || !inputQuery.trim()}
                  onClick={() => handleAnalyzeQuery(inputQuery)}
                  style={{ height: 'auto' }}
                >
                  분석
                </Button>
              </Space.Compact>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                Shift + Enter로 줄바꿈, Enter로 전송
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 데이터 정보 모달 */}
      <Modal
        title="📊 데이터 정보"
        open={showDataModal}
        onCancel={() => setShowDataModal(false)}
        footer={null}
        width={600}
      >
        {dataInfo && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small" title="기본 정보">
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>행 수:</Text> {dataInfo.shape[0].toLocaleString()}
                </Col>
                <Col span={12}>
                  <Text strong>열 수:</Text> {dataInfo.shape[1]}
                </Col>
              </Row>
              <div style={{ marginTop: '8px' }}>
                <Text strong>메모리 사용량:</Text> {(dataInfo.memory_usage / 1024 / 1024).toFixed(2)} MB
              </div>
            </Card>
            
            <Card size="small" title="컬럼 정보">
              <List
                size="small"
                dataSource={dataInfo.columns}
                renderItem={(column) => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{column}</Tag>
                      <Text type="secondary">{dataInfo.dtypes[column]}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        )}
      </Modal>
    </Content>
  );
};

export default DataAnalysisPage;
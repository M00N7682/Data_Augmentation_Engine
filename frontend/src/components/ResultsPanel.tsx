import React from 'react';
import { Card, Table, Statistic, Row, Col, Button, Space, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import Plot from 'react-plotly.js';
import { dataAPI } from '../services/api';

const { Title } = Typography;

interface ResultsPanelProps {
  processedData: any;
  statistics: any;
  visualization: any;
  loading: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  processedData,
  statistics,
  visualization,
  loading,
}) => {
  const handleDownload = async (encoding: string) => {
    try {
      await dataAPI.downloadData(encoding);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getTableColumns = () => {
    if (!processedData?.data || processedData.data.length === 0) return [];
    
    const firstRow = processedData.data[0];
    return Object.keys(firstRow).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true,
      width: 150,
    }));
  };

  const getTableData = () => {
    if (!processedData?.data) return [];
    
    return processedData.data.map((row: any, index: number) => ({
      ...row,
      key: index,
    }));
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 결과 통계 */}
      {statistics && (
        <Card title="📊 처리 결과">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="원본 데이터"
                value={statistics.comparison.original_rows}
                suffix="행"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="증강된 데이터"
                value={statistics.comparison.augmented_rows}
                suffix="행"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="증가율"
                value={statistics.comparison.increase_ratio.toFixed(1)}
                suffix="%"
              />
            </Col>
            <Col span={6}>
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload('utf-8')}
                >
                  UTF-8 다운로드
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload('cp949')}
                >
                  Excel용 다운로드
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* 데이터 테이블 */}
      {processedData && (
        <Card title="📋 증강된 데이터" extra={
          <span>
            총 {processedData.total_rows?.toLocaleString()} 행 
            (페이지 {processedData.page + 1} / {processedData.total_pages})
          </span>
        }>
          <Table
            columns={getTableColumns()}
            dataSource={getTableData()}
            pagination={{
              current: processedData.page + 1,
              pageSize: processedData.page_size,
              total: processedData.total_rows,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 1000, y: 400 }}
            loading={loading}
            size="small"
          />
        </Card>
      )}

      {/* 시각화 */}
      {visualization && (
        <Card title="📈 분포 비교">
          <Plot
            data={visualization.chart_data.data}
            layout={{
              ...visualization.chart_data.layout,
              autosize: true,
              height: 600,
            }}
            useResizeHandler={true}
            style={{ width: '100%' }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
            }}
          />
        </Card>
      )}

      {/* 상세 통계 */}
      {statistics && (
        <Card title="📋 상세 통계">
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>원본 데이터 통계</Title>
              <div style={{ overflow: 'auto', maxHeight: 300 }}>
                {Object.entries(statistics.original_statistics).map(([column, stats]: [string, any]) => (
                  <div key={column} style={{ marginBottom: 16 }}>
                    <Title level={5}>{column}</Title>
                    <Row gutter={8}>
                      <Col span={6}>평균: {stats.mean?.toFixed(3)}</Col>
                      <Col span={6}>표준편차: {stats.std?.toFixed(3)}</Col>
                      <Col span={6}>최솟값: {stats.min?.toFixed(3)}</Col>
                      <Col span={6}>최댓값: {stats.max?.toFixed(3)}</Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Col>
            <Col span={12}>
              <Title level={5}>증강된 데이터 통계</Title>
              <div style={{ overflow: 'auto', maxHeight: 300 }}>
                {Object.entries(statistics.augmented_statistics).map(([column, stats]: [string, any]) => (
                  <div key={column} style={{ marginBottom: 16 }}>
                    <Title level={5}>{column}</Title>
                    <Row gutter={8}>
                      <Col span={6}>평균: {stats.mean?.toFixed(3)}</Col>
                      <Col span={6}>표준편차: {stats.std?.toFixed(3)}</Col>
                      <Col span={6}>최솟값: {stats.min?.toFixed(3)}</Col>
                      <Col span={6}>최댓값: {stats.max?.toFixed(3)}</Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </Space>
  );
};

export default ResultsPanel;
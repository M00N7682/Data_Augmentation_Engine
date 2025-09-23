import { useState } from 'react';
import { Upload, message, Card, Button, Select, Table, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { dataAPI, DataSummary } from '../services/api';

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
  onDataSummary: (summary: DataSummary) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onDataSummary }) => {
  const [uploading, setUploading] = useState(false);
  const [fileData, setFileData] = useState<any>(null);

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    beforeUpload: async (file: File) => {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      if (!isCSV) {
        message.error('CSV 파일만 업로드 가능합니다.');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('파일 크기는 10MB를 초과할 수 없습니다.');
        return false;
      }

      setUploading(true);

      try {
        const response = await dataAPI.uploadFile(file);
        setFileData(response);
        onUploadSuccess(response);
        onDataSummary(response.summary);
        message.success('파일이 성공적으로 업로드되었습니다.');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || '파일 업로드 중 오류가 발생했습니다.';
        message.error(errorMessage);
      } finally {
        setUploading(false);
      }

      return false; // 자동 업로드 방지
    },
  };

  const columns = [
    {
      title: '컬럼명',
      dataIndex: 'column',
      key: 'column',
    },
    {
      title: '데이터 타입',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '결측값 수',
      dataIndex: 'missing',
      key: 'missing',
    },
  ];

  const getTableData = () => {
    if (!fileData?.summary) return [];
    
    const { data_types, missing_values } = fileData.summary;
    
    return Object.keys(data_types).map((column) => ({
      key: column,
      column,
      type: data_types[column],
      missing: missing_values[column] || 0,
    }));
  };

  return (
    <Card title="📁 데이터 업로드" style={{ marginBottom: 24 }}>
      <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">CSV 파일을 클릭하거나 드래그해서 업로드하세요</p>
        <p className="ant-upload-hint">
          CSV 형식의 데이터 파일만 지원됩니다. (최대 10MB)
        </p>
      </Dragger>

      {uploading && <Text>파일을 업로드하는 중...</Text>}

      {fileData && (
        <>
          <Title level={4} style={{ marginTop: 24 }}>📋 데이터 미리보기</Title>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>총 행 수: </Text>
            <Text>{fileData.summary.total_rows.toLocaleString()}</Text>
            <Text strong style={{ marginLeft: 16 }}>총 열 수: </Text>
            <Text>{fileData.summary.total_columns}</Text>
          </div>

          <Table
            columns={columns}
            dataSource={getTableData()}
            pagination={false}
            size="small"
            style={{ marginBottom: 16 }}
          />

          {fileData.sample_data && (
            <>
              <Title level={5}>샘플 데이터</Title>
              <div style={{ overflow: 'auto', maxHeight: 300 }}>
                <table className="ant-table-tbody" style={{ width: '100%', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {Object.keys(fileData.sample_data[0] || {}).map((key) => (
                        <th key={key} style={{ padding: '8px', borderBottom: '1px solid #d9d9d9' }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.sample_data.slice(0, 5).map((row: any, index: number) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td
                            key={cellIndex}
                            style={{
                              padding: '8px',
                              borderBottom: '1px solid #d9d9d9',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {value?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default FileUpload;
import React from 'react';
import { Card, Typography, Divider, Space } from 'antd';
import { CodeBlock } from './CodeBlock';
import { InteractiveDemo } from './InteractiveDemo';

const { Title, Paragraph } = Typography;

interface KnowledgePointProps {
  title: string;
  theory: string;
  codeExample?: string;
  demoConfig?: {
    type: 'code' | 'visualization';
    content: any;
  };
}

export const KnowledgePoint: React.FC<KnowledgePointProps> = ({
  title,
  theory,
  codeExample,
  demoConfig
}) => {
  return (
    <Card className="knowledge-point" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Title level={3}>{title}</Title>
        
        <div className="theory-section">
          <Title level={4}>理论讲解</Title>
          <Paragraph>{theory}</Paragraph>
        </div>

        {codeExample && (
          <div className="code-section">
            <Title level={4}>示例代码</Title>
            <CodeBlock code={codeExample} />
          </div>
        )}

        {demoConfig && (
          <div className="demo-section">
            <Title level={4}>互动演示</Title>
            <InteractiveDemo {...demoConfig} />
          </div>
        )}
      </Space>
    </Card>
  );
};
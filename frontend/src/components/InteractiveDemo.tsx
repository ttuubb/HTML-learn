import React, { useState } from 'react';
import { Card, Tabs, Button, Space } from 'antd';
import { CodeBlock } from './CodeBlock';

interface InteractiveDemoProps {
  type: 'code' | 'visualization';
  content: {
    initialCode?: string;
    finalCode?: string;
    steps?: Array<{
      description: string;
      code?: string;
      visualization?: React.ReactNode;
    }>;
  };
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ type, content }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = content.steps || [];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (type === 'code') {
    return (
      <Card>
        <Tabs
          items={[
            {
              key: 'initial',
              label: '初始代码',
              children: content.initialCode && (
                <CodeBlock code={content.initialCode} />
              ),
            },
            {
              key: 'steps',
              label: '演示步骤',
              children: steps.length > 0 && (
                <div>
                  <p>{steps[currentStep].description}</p>
                  {steps[currentStep].code && (
                    <CodeBlock code={steps[currentStep].code} />
                  )}
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                    >
                      上一步
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={currentStep === steps.length - 1}
                    >
                      下一步
                    </Button>
                  </Space>
                </div>
              ),
            },
            {
              key: 'final',
              label: '最终代码',
              children: content.finalCode && (
                <CodeBlock code={content.finalCode} />
              ),
            },
          ]}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div>
        <p>{steps[currentStep].description}</p>
        {steps[currentStep].visualization}
        <Space style={{ marginTop: 16 }}>
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            上一步
          </Button>
          <Button
            type="primary"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            下一步
          </Button>
        </Space>
      </div>
    </Card>
  );
};
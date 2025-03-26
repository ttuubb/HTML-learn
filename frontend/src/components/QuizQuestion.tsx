import React, { useState } from 'react';
import { Card, Radio, Checkbox, Input, Space, Typography, Button } from 'antd';

const { Text, Paragraph } = Typography;

export type QuestionType = 'single' | 'multiple' | 'text';

export interface Option {
  id: string;
  content: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: Option[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface QuizQuestionProps {
  question: Question;
  mode?: 'practice' | 'test';
  onAnswer?: (answer: string | string[]) => void;
  showResult?: boolean;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  mode = 'practice',
  onAnswer,
  showResult = false,
}) => {
  const [answer, setAnswer] = useState<string | string[]>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (onAnswer) {
      onAnswer(answer);
    }
    setSubmitted(true);
  };

  const isCorrect = () => {
    if (Array.isArray(question.correctAnswer)) {
      return (
        Array.isArray(answer) &&
        answer.length === question.correctAnswer.length &&
        answer.every((a) => question.correctAnswer.includes(a))
      );
    }
    return answer === question.correctAnswer;
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'single':
        return (
          <Radio.Group
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            disabled={submitted}
          >
            <Space direction="vertical">
              {question.options?.map((option) => (
                <Radio key={option.id} value={option.id}>
                  {option.content}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );

      case 'multiple':
        return (
          <Checkbox.Group
            onChange={(values) => setAnswer(values as string[])}
            value={answer as string[]}
            disabled={submitted}
          >
            <Space direction="vertical">
              {question.options?.map((option) => (
                <Checkbox key={option.id} value={option.id}>
                  {option.content}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        );

      case 'text':
        return (
          <Input.TextArea
            rows={4}
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="quiz-question" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Paragraph strong>{question.content}</Paragraph>

        {renderQuestion()}

        {!submitted && (
          <Button type="primary" onClick={handleSubmit}>
            提交答案
          </Button>
        )}

        {submitted && showResult && (
          <div className="result-section">
            <Text
              type={isCorrect() ? 'success' : 'danger'}
              strong
            >
              {isCorrect() ? '回答正确！' : '回答错误'}
            </Text>
            {question.explanation && (
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                解释：{question.explanation}
              </Paragraph>
            )}
          </div>
        )}
      </Space>
    </Card>
  );
};
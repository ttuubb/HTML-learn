import React from 'react';
import { List, Card, Button, Space, Typography } from 'antd';
import { QuizQuestion, Question } from './QuizQuestion';

const { Title } = Typography;

interface QuizListProps {
  title: string;
  questions: Question[];
  mode?: 'practice' | 'test';
  onQuestionAnswer?: (questionId: string, answer: string | string[]) => void;
  showResults?: boolean;
}

export const QuizList: React.FC<QuizListProps> = ({
  title,
  questions,
  mode = 'practice',
  onQuestionAnswer,
  showResults = true,
}) => {
  return (
    <Card className="quiz-list" style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Title level={3}>{title}</Title>

        <List
          dataSource={questions}
          renderItem={(question) => (
            <List.Item>
              <QuizQuestion
                question={question}
                mode={mode}
                onAnswer={(answer) => onQuestionAnswer?.(question.id, answer)}
                showResult={showResults}
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
};
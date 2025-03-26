import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateCourseData } from '../types/course';
import { courseService } from '../services/courseService';

const { TextArea } = Input;

const CourseForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      const response = await courseService.getCourses();
      const course = response.find((c) => c._id === id);
      if (course) {
        form.setFieldsValue({
          title: course.title,
          description: course.description,
          content: course.content
        });
      }
    } catch (error) {
      message.error('加载课程信息失败');
    }
  };

  const onFinish = async (values: CreateCourseData) => {
    setLoading(true);
    try {
      if (id) {
        await courseService.updateCourse({ ...values, id });
        message.success('课程更新成功');
      } else {
        await courseService.createCourse(values);
        message.success('课程创建成功');
      }
      navigate('/courses');
    } catch (error) {
      message.error(id ? '更新课程失败' : '创建课程失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>{id ? '编辑课程' : '创建课程'}</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="title"
          label="课程标题"
          rules={[{ required: true, message: '请输入课程标题' }]}
        >
          <Input placeholder="请输入课程标题" />
        </Form.Item>

        <Form.Item
          name="description"
          label="课程描述"
          rules={[{ required: true, message: '请输入课程描述' }]}
        >
          <TextArea rows={4} placeholder="请输入课程描述" />
        </Form.Item>

        <Form.Item
          name="content"
          label="课程内容"
          rules={[{ required: true, message: '请输入课程内容' }]}
        >
          <TextArea rows={8} placeholder="请输入课程内容" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {id ? '更新课程' : '创建课程'}
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate('/courses')}
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CourseForm;
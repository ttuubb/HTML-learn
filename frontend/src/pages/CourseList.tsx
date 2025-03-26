import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, message } from 'antd';
import { Course } from '../types/course';
import { courseService } from '../services/courseService';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (error) {
      message.error('加载课程列表失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      message.success('课程删除成功');
      loadCourses();
    } catch (error) {
      message.error('删除课程失败');
    }
  };

  return (
    <div className="course-list-container" style={{ padding: '24px' }}>
      <h1>课程列表</h1>
      <Row gutter={[16, 16]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
            <Card
              title={course.title}
              extra={<Button type="link" href={`/courses/${course._id}`}>查看</Button>}
              actions={[
                <Button key="edit" type="link" href={`/courses/${course._id}/edit`}>编辑</Button>,
                <Button key="delete" type="link" danger onClick={() => handleDelete(course._id)}>删除</Button>
              ]}
            >
              <p>{course.description}</p>
              <p>作者：{course.author.name}</p>
              <p>更新时间：{new Date(course.updatedAt).toLocaleDateString()}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <Button
        type="primary"
        style={{ marginTop: '20px' }}
        href="/courses/create"
      >
        创建新课程
      </Button>
    </div>
  );
};

export default CourseList;
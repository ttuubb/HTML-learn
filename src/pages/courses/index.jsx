import { Box, Heading, SimpleGrid, Card, CardBody, Text } from '@chakra-ui/react';

function CoursesPage() {
  const courses = [
    {
      title: 'JavaScript基础语法',
      description: '学习变量、数据类型、运算符等基础知识'
    },
    {
      title: '控制流程',
      description: '掌握条件语句、循环语句等流程控制'
    },
    {
      title: '函数',
      description: '深入理解函数定义、调用、作用域等概念'
    },
    {
      title: '对象与数组',
      description: '学习数组操作和对象的创建与使用'
    },
    {
      title: 'DOM操作',
      description: '掌握网页元素的选择、修改和事件处理'
    },
    {
      title: '异步编程',
      description: '理解Promise、async/await等异步概念'
    }
  ];

  return (
    <Box>
      <Heading mb={6}>课程学习</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {courses.map((course, index) => (
          <Card key={index} cursor="pointer" _hover={{ transform: 'scale(1.02)' }}>
            <CardBody>
              <Heading size="md" mb={2}>{course.title}</Heading>
              <Text>{course.description}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default CoursesPage;
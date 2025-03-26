import { Box, Heading, SimpleGrid, Card, CardBody, Text, Badge, Stack } from '@chakra-ui/react';

function PracticePage() {
  const practices = [
    {
      title: '数组求和',
      description: '实现一个函数计算数组所有元素的和',
      difficulty: '初级',
      type: '算法题'
    },
    {
      title: '字符串反转',
      description: '编写一个函数将字符串反转',
      difficulty: '初级',
      type: '功能实现'
    },
    {
      title: '对象深拷贝',
      description: '实现对象的深拷贝功能',
      difficulty: '中级',
      type: '功能实现'
    },
    {
      title: '异步请求处理',
      description: '处理多个异步请求的并发执行',
      difficulty: '高级',
      type: 'Bug修复'
    },
    {
      title: '购物车实现',
      description: '实现一个简单的购物车功能',
      difficulty: '中级',
      type: '小项目练习'
    },
    {
      title: '表单验证',
      description: '实现一个带验证的表单提交功能',
      difficulty: '中级',
      type: '功能实现'
    }
  ];

  const difficultyColor = {
    '初级': 'green',
    '中级': 'orange',
    '高级': 'red'
  };

  return (
    <Box>
      <Heading mb={6}>代码练习</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {practices.map((practice, index) => (
          <Card key={index} cursor="pointer" _hover={{ transform: 'scale(1.02)' }}>
            <CardBody>
              <Stack spacing={2}>
                <Heading size="md">{practice.title}</Heading>
                <Text>{practice.description}</Text>
                <Stack direction="row" spacing={2}>
                  <Badge colorScheme={difficultyColor[practice.difficulty]}>
                    {practice.difficulty}
                  </Badge>
                  <Badge colorScheme="purple">{practice.type}</Badge>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default PracticePage;
import { Box, VStack, Text, Progress, useColorModeValue } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const progress = {
    courses: 30,
    practice: 20,
    editor: 50
  };

  return (
    <Box
      w="250px"
      h="calc(100vh - 60px)"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Box>
          <Text mb={2} fontWeight="bold">学习进度</Text>
          <Text fontSize="sm" mb={1}>课程学习</Text>
          <Progress value={progress.courses} size="sm" colorScheme="blue" mb={3} />
          <Text fontSize="sm" mb={1}>代码练习</Text>
          <Progress value={progress.practice} size="sm" colorScheme="green" mb={3} />
          <Text fontSize="sm" mb={1}>编辑器使用</Text>
          <Progress value={progress.editor} size="sm" colorScheme="purple" />
        </Box>
      </VStack>
    </Box>
  );
}

export default Sidebar;
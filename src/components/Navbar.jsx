import { Box, Flex, Heading, Button, useColorMode } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box as="nav" bg="blue.500" px={4} py={2} color="white">
      <Flex align="center" justify="space-between">
        <Link to="/">
          <Heading size="md">JS学习平台</Heading>
        </Link>
        <Flex gap={4}>
          <Link to="/courses">
            <Button variant="ghost" _hover={{ bg: 'blue.600' }}>课程学习</Button>
          </Link>
          <Link to="/practice">
            <Button variant="ghost" _hover={{ bg: 'blue.600' }}>代码练习</Button>
          </Link>
          <Link to="/editor">
            <Button variant="ghost" _hover={{ bg: 'blue.600' }}>在线编辑器</Button>
          </Link>
          <Button onClick={toggleColorMode} variant="ghost" _hover={{ bg: 'blue.600' }}>
            {colorMode === 'light' ? '🌙' : '☀️'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;
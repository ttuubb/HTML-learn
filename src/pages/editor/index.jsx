import { useEffect, useState } from 'react';
import { Box, Heading, HStack, Select, Button } from '@chakra-ui/react';
import Editor from '@monaco-editor/react';

function EditorPage() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(
    '// 在这里编写你的JavaScript代码\n\nfunction example() {\n  console.log("Hello, World!");\n}\n'
  );

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleRunCode = () => {
    try {
      // 使用Function构造器来执行代码
      const result = new Function(code)();
      console.log('执行结果:', result);
    } catch (error) {
      console.error('执行错误:', error);
    }
  };

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Heading>在线编辑器</Heading>
        <HStack spacing={4}>
          <Select value={language} onChange={handleLanguageChange} w="200px">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </Select>
          <Button colorScheme="green" onClick={handleRunCode}>
            运行代码
          </Button>
        </HStack>
      </HStack>
      <Box border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
        <Editor
          height="70vh"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
      </Box>
    </Box>
  );
}

export default EditorPage;
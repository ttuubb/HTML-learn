import express from 'express';
import connectDB from './config/database';

const app = express();

// Connect to database
connectDB();

// ... 其他中间件和路由设置 ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';


dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors(
  {
    origin : 'https://hrmfrontend-cfkj.onrender.com',
    methods : ['POST', 'GET','PUT','PATCH','DELETE'],
    credentials : true
  }
));

// API routes
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/leaves', leaveRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import dotenv from 'dotenv';
import { PORT } from './constants';
import subjectRouter from './routes/subjects';
import cors from 'cors';
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/subjects', subjectRouter);
app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});

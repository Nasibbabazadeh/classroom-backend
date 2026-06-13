import express from 'express';
import dotenv from 'dotenv';
import { PORT } from './constants';
import subjectRouter from './routes/subjects';
import cors from 'cors';
dotenv.config();
const app = express();

if (!process.env.FRONTEND_ORIGIN) throw new Error('FRONTEND_ORIGIN isn`t set in .env file');

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/subjects', subjectRouter);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

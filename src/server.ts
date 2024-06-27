import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import projectRoutes from './routes/projectRoutes';
import authRoutes from './routes/authRoutes';

// https://jwt.io/

dotenv.config()

//Conexion a base de datos
connectDB()

//Iniciar el servidor
const app = express();

//Permitir cors
app.use(cors(corsConfig))

//Logging o archivos de logs
app.use(morgan('dev'))

//Permitir leer archivos JSON o datos de formularios
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app;
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'; // 1. Importar cors
import creditRoutes from './infrastructure/adapters/routes';
import authRoutes from './app/api/auth/route'; 
import { authMiddleware } from './infrastructure/middleware/authMiddleware';

dotenv.config(); 
const app = express();


app.use(cors({
  origin: "http://localhost:3001", 
  methods: ["GET", "POST", "PUT", "DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json()); 

// Rutas
app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/credits', authMiddleware, creditRoutes); 


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(` Servidor en puerto ${PORT}`);
});

export default app;
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Manejo de errores para evitar que la app se detenga si Redis falla
redisClient.on('error', (err: Error) => {
    console.error('Error en el cliente de Redis:', err.message);
});

redisClient.on('connect', () => {
    console.log('Redis: Conexión establecida correctamente para el sistema de caché.');
});

redisClient.on('reconnecting', () => {
    console.log('Redis: Intentando reconectarse al servidor...');
});

// Inicialización de la conexión asíncrona con manejo de reintentos
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Error crítico: No fue posible establecer la conexión con Redis durante el inicio de la aplicación.', error);       
    }
})();

export default redisClient;
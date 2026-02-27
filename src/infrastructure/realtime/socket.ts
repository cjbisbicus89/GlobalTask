import { Server } from 'socket.io';

export let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET_CONNECTED] Cliente conectado: ${socket.id}`);

    socket.on('join_credit', (creditId: string) => {
      socket.join(`credit_${creditId}`);
      console.log(`[SOCKET_JOIN] Cliente ${socket.id} siguiendo crédito: ${creditId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET_DISCONNECTED] Cliente desconectado`);
    });
  });

  return io;
};
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { CONFIG } from './config';
import { authRouter } from './routes/authRoutes';
import { foodRouter } from './routes/foodRoutes';
import { orderRouter } from './routes/orderRoutes';
import { paymentRouter } from './routes/paymentRoutes';
import { reviewRouter } from './routes/reviewRoutes';
import { couponRouter } from './routes/couponRoutes';
import { settingsRouter } from './routes/settingsRoutes';
import { uploadRouter } from './routes/uploadRoutes';

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media files
app.use('/uploads', express.static(CONFIG.UPLOADS_DIR));

// Configure Socket.IO
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', socket => {
  // Customer joining specific order room
  socket.on('join-order-room', (orderId: string) => {
    if (orderId) {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
    }
  });

  // Admin joining global admin broadcast room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  socket.on('disconnect', () => {
    // Clean disconnection
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    restaurant: 'Neelam Ki Gharelu Rasoi',
    time: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/food', foodRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);

// Start Server
server.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`  NEELAM KI GHARELU RASOI — BACKEND API SERVER RUNNING `);
  console.log(`  Port: ${CONFIG.PORT} | Environment: ${CONFIG.NODE_ENV}  `);
  console.log(`  Health Check: http://localhost:${CONFIG.PORT}/api/health `);
  console.log(`=======================================================`);
});

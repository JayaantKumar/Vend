require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // <-- Added for Socket.io
const { Server } = require('socket.io'); // <-- Added for Socket.io
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());

// --- Webhook Route (Must parse RAW body for security signature) ---
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// Standard JSON parser for all other routes
app.use(express.json()); 

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Vend HydraFuel API is online and waiting for hardware.',
    machineId: process.env.MACHINE_ID
  });
});

// Mount Routes
app.use('/api/payments', paymentRoutes);

// Add this under your paymentRoutes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// ---------------------------------------------------------
// 📡 Socket.io Initialization (Real-Time Magic)
// ---------------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow the Electron frontend to connect
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`📡 Kiosk Connected via WebSockets: ${socket.id}`);
  
  // A kiosk will identify itself by its Machine ID when it connects
  socket.on('register_machine', (machineId) => {
    socket.join(machineId); // Join a specific room for this machine
    console.log(`📠 Machine ${machineId} registered for real-time updates.`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Kiosk Disconnected: ${socket.id}`);
  });
});

// Make 'io' accessible inside our webhook controller
app.set('socketio', io);

// ---------------------------------------------------------
// 🛠️ [HARDWARE HANDOVER POINT]
// Hardware Engineer: 
// Require your MQTT Service here and initialize the connection
// Example: const mqttService = require('./services/mqttService');
// mqttService.connect();
// ---------------------------------------------------------

// ⚠️ IMPORTANT: We must use server.listen now, NOT app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server & WebSockets running on http://localhost:${PORT}`);
});
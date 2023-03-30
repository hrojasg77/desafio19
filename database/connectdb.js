import mongoose from "mongoose";

const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 450000, // Close sockets after 45 minutos of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };

try {
    // console.log('Puerto: ' + process.env.URI_MONGO)    
    await mongoose.connect('mongodb://127.0.0.1:27017/terceraentrega',options)
    console.log('   -- conexión DB Ok')    
} catch (error) {
    console.log('  --  Error DB de conexión')
}


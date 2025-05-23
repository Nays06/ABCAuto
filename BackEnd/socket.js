let io = null;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("📡 Клиент подключён");

      socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log(`Клиент зашёл в комнату ${chatId}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ Клиент отключён");
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.io не инициализирован!");
    return io;
  }
};

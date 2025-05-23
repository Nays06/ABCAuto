const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const http = require("http");
const socket = require("./socket");

const authRoute = require("./routes/authRoute");
const carRoute = require("./routes/carRoute");
const favoriteRoute = require("./routes/favoriteRoute");
const chatRoute = require("./routes/chatRoute");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express({ limit: "100mb" });

const server = http.createServer(app);
socket.init(server);

app.use(cors());

app.use(express.json());
app.use("/auth", authRoute);
app.use("/cars", carRoute);
app.use("/favorites", favoriteRoute);
app.use("/chat", chatRoute);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("static"));

const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ABCAuto");
    server.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
start();

const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const http = require("http");
const socket = require("./socket");
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/authRoute");
const carRoute = require("./routes/carRoute");
const favoriteRoute = require("./routes/favoriteRoute");
const chatRoute = require("./routes/chatRoute");
const reviewRoute = require("./routes/reviewRoute");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express({ limit: "100mb" });

const server = http.createServer(app);
socket.init(server);

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:4200",
  })
);

app.use("/auth", authRoute);
app.use("/cars", carRoute);
app.use("/favorites", favoriteRoute);
app.use("/chat", chatRoute);
app.use("/review", reviewRoute);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("static"));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ABCAuto");
    server.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
start();

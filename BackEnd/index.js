const express = require("express");
const cors = require('cors')
const { default: mongoose } = require("mongoose");
const authRoute = require("./routes/authRoute")
const carRoute = require("./routes/carRoute");

require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express({ limit: "100mb" });

app.use(cors())

app.use(express.json())
app.use('/auth' , authRoute)
app.use('/cars', carRoute)
app.use("/uploads" , express.static("uploads"))
app.use("/static" , express.static("static"))

const start = async () => {
  try {

    await mongoose.connect('mongodb://localhost:27017/ABCAuto')
    app.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start()
const express = require("express");
const cors = require('cors')
const { default: mongoose } = require("mongoose");
// const authRouter = require("./routes/authRoute");
const carRoute = require("./routes/carRoute");
const PORT = process.env.PORT || 5000;

const app = express({ limit: "100mb" });

app.use(cors())

app.use(express.json())
// app.use('/auth' , authRouter)
app.use('/cars', carRoute)
// app.use("/uploads" , express.static("uploads"))

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
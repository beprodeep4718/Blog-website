require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoStore = require('connect-mongo');

const router = require("./server/routes/main");
const admin = require("./server/routes/admin");
const connectDB = require("./server/config/db");

const app = express();

//^ PORT ------>>>>

const PORT = process.env.PORT || 3000;

//^ Middleware configuration

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'))

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    autoReconnect: true,
    autoIndex: true,
  })
}))

app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

//* response handlers ------->>>>>

app.use("/", router);
app.use("/", admin);

//& Starting server ------>

const start = () => {
  try {
    app.listen(PORT, () => console.log(`Starting server on port ${PORT} ...`));
    connectDB(process.env.MONGO_URI);
  } catch (error) {
    console.log(error.message);
  }
};

start();

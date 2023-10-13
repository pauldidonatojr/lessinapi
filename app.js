const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(fileUpload());
const port = process.env.PORT;
const username = process.env.DB_USER_NAME;
const password = process.env.DB_USER_PASS;
const auth = require("./routes/auth");
const checkout = require("./routes/checkout");
const misc = require("./routes/misc");
const redeem = require("./routes/redeem");
const products = require("./routes/products");
const chat = require("./routes/chat");
const uri = `mongodb+srv://${username}:${password}@cluster0.cvvdng2.mongodb.net/?retryWrites=true&w=majority`;



mongoose
  .connect(uri, { useNewUrlParser: true }, { useUnifiedTopology: true })
  .then(() => console.log("Monogo with auth service is running"))
  .catch((error) => console.log("Error while connecting to atlas", error));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use("/auth", auth);
app.use("/products", products);
app.use("/checkout", checkout);
app.use("/redeem", redeem);
app.use("/misc", misc);
app.use("/chat", chat);

app.use("/", (req, res) => {
  // Create a JSON response
  const jsonResponse = { message: 'Hello, this is a JSON response!' };
  
  // Send the JSON response to the client
  res.json(jsonResponse);
});


module.exports = app;

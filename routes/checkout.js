const app = require("express");
const checkoutrouter = app.Router();

const checkoutontroller = require("../controller/checkout");
const checkoutMiddleware = require("../middleware/checkout");
//const emailService = require("../utils/emailService");

checkoutrouter.post("/process", checkoutontroller.process);
checkoutrouter.get("/success", checkoutontroller.success);
checkoutrouter.get("/failure", checkoutontroller.failure);

//router.get("/send-token/:email/:verify_token", emailService.sendEmail);
//router.get("/api/verify", authMiddleware.verifyUserEmail);



module.exports = checkoutrouter;

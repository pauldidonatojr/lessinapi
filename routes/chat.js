const app = require("express");
const chat = app.Router();

const chatController = require("../controller/chat");
//const checkoutMiddleware = require("../middleware/checkout");
//const emailService = require("../utils/emailService");

chat.post("/create-lead", chatController.CreateLead);
chat.post("/send-msg", chatController.SendMessage);
chat.post("/fetch-leads", chatController.FetchLeads);
chat.post("/get-lead-responder", chatController.FetchLeadsResponse);
// chat.get("/success", chatController.success);
// chat.get("/failure", chatController.failure);

//router.get("/send-token/:email/:verify_token", emailService.sendEmail);
//router.get("/api/verify", authMiddleware.verifyUserEmail);



module.exports = chat;

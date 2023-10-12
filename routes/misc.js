const app = require("express");
const misc = app.Router();

const MiscController = require("../controller/misc");
//const checkoutMiddleware = require("../middleware/checkout");
//const emailService = require("../utils/emailService");

misc.post("/content", MiscController.ContentManagement);
misc.post("/getcontent", MiscController.GetContentManagement);
// misc.get("/success", MiscController.success);
// misc.get("/failure", MiscController.failure);

//router.get("/send-token/:email/:verify_token", emailService.sendEmail);
//router.get("/api/verify", authMiddleware.verifyUserEmail);



module.exports = misc;

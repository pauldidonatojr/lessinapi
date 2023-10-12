const app = require("express");
const router = app.Router();

const redeemController = require("../controller/redeem");
const redeemMiddleware = require("../middleware/redeem");
const emailService = require("../utils/emailService");

router.post("/addredeemcode", redeemController.addRedeemCode);


router.post("/Productsummary", redeemController.ProductSummary);

router.post("/Validityproductcount", redeemController.ValidityProductCount);


// router.post("/addredeemcodebulk", redeemController.addRedeemCodeBulk);

// router.post("/updredeemcode", redeemController.updRedeemCode);
router.post("/availredeemcode", redeemController.availRedeemCode);

router.post("/deleteredeemcode", redeemController.deleteRedeemCode);

router.post("/availtrialcode", redeemController.availTrialCode);

router.post("/getusersubscription", redeemController.getUserSubscription);

router.post("/getredeemcodes", redeemController.getRedeemCode);



module.exports = router;

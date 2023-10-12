const mongoose = require('mongoose');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
require("dotenv").config();

const Checkout  = require("../models/checkout");
const { User } = require("../models/user");
const Subscription  = require("../models/subscription");
const RedeemCode = require('../models/redeem');

// Comment out the validation imports if you want to remove validation temporarily
const {
    validateFields
  } = require("../middleware/checkout");

  const { sendEmails } = require("../utils/emailService");

exports.process = async (req, res) => {
  const { error } = validateFields(req.body);
  var product_id = '';
  if (error) return res.status(400).send({ message: "Enter data correctly" });

  const user = await User.findOne({ email: req.body.email });

  if (user)
  try {
    const get_customer = await stripe.customers.search({
      query: 'email:\''+req.body.email+'\' ',
    });

    if (get_customer.data && get_customer.data.length > 0) {
      customerId = get_customer.data[0].id;
    }
    else{
      const customer = await stripe.customers.create({
        name: req.body.customer_name,
        phone: req.body.customer_phone,
        email: req.body.customer_email,
        customer_email: req.body.customer_email,
        customer_details: {
          email: req.body.customer_email
        },
      });
      customerId = customer.id;
      
    }

    const line_items = req.body.cartItems.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Plan ID: ${item.id}\nPlan Name: ${item.name}\nValidity: ${item.validity} months`,
            description: item.description,
            metadata: {
              'product_id': item.id,
              'itemvalidity': item.validity,
            },
          },
          unit_amount: item.price * 100,
        },
        
        quantity: 1,
      };
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      phone_number_collection: {
        enabled: false,
      },
      line_items,
      mode: "payment",
      customer: customerId,
      success_url: `${process.env.CLIENT_URL}checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/UserProfile`,
    });
    
    res.send(session.url);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
  else
   return res.status(404).send({ message: "User doesn't exists" });
  };
exports.success = async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const session_items = await stripe.checkout.sessions.listLineItems(req.query.session_id);
  // console.log(session_items.data[0].description);
  // Split the output into lines
  const lines = session_items.data[0].description.split('\n');

  // Extract the "Validity" number and "Plan ID" from the lines
  let validity = null;
  let planId = null;

  lines.forEach(line => {
    if (line.startsWith('Validity:')) {
      // Extract the "Validity" number (assuming it's always a number followed by " months")
      validity = parseInt(line.match(/\d+/)[0]);
    } else if (line.startsWith('Plan ID:')) {
      // Extract the "Plan ID" (assuming it's the value after "Plan ID:")
      planId = line.split('Plan ID: ')[1];
    }
  });


  // console.log(session);
  const email = session.customer_details.email;
  const admin_email = process.env.ADMIN_EMAIL;

  const redeemcode = await RedeemCode.findOne({
    status: 'Pending',
    itemID: planId,
    validity: validity,
  });

  const checkouthistory = new Checkout({
    userID: email,
    checkoutID: req.query.session_id,
    itemPrice: session.amount_total,
    itemID: planId,
    validity: validity,
    status: 'success'
  });
  await checkouthistory.save();
  if (redeemcode) {
    const newSubscription = new Subscription({
      user: email,
      subscription_code: redeemcode.code
    });
    try {
      redeemcode.status = 'Availed';
      redeemcode.purchase_date = new Date();
      const savedSubscription = await newSubscription.save();
      const updateredeem = await redeemcode.save();
      const subject = 'NCN subscription'
      const message = 'Thank you for purchasing! To redeem your subscription, please log into portal, goto subscription section and click on redeem subscription button';
      await sendEmails(email,admin_email,message,subject);

      console.log("Thank you for purchasing! To redeem your subscription, please log into portal, goto subscription section and click on redeem subscription button");
      // return res.status(200).send({ message: "Subscription purchased" });
      res.redirect(`${process.env.FRONTEND_URL}/SuccessfulPayment`);

      
    } catch (err) {
      const subject = 'NCN subscription'
      const message = 'Something went wrong during subscription purchase we are looking into it';
      await sendEmails(email,admin_email,message,subject);

      console.log("something went wrong",err);
      res.redirect(`${process.env.FRONTEND_URL}/FailedPayment`);
      // return res.status(400).send({ message: "something went wrong" });
    }
  } else {
    const subject = 'NCN subscription'
    const message = 'Subscription purchased but no redeemable code availale please contact admin';
    await sendEmails(email,admin_email,message,subject);
    res.redirect(`${process.env.FRONTEND_URL}/FailedPayment`);
    // return res.status(404).send({ message: "Subscription purchased but no redeemable code availale please contact admin" });
  }

  // try {
  //   const savedRedeemCode = await newRedeemCode.save();
  //   console.log("Code saved");
  //   return res.status(200).send({ message: "Code saved!" });
  // } catch (err) {
  //   console.log("Code not saved", err);
  //   return res.status(400).send({ message: "Code not saved" });
  // }
  // res.send(`<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`);
};

exports.failure = async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);

  res.send(`<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`);
};
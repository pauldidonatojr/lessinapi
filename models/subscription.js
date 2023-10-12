const mongoose = require('mongoose');

// Define the User schema
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  subscription_code: {
    type: String,
    required: true,
  },
  purchase_date: {
    type: Date,
    default: Date.now,
  },
  date_availed: {
    type: Date,
    required: false,
  },
  date_of_expiry: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ['expired', 'active', 'redeemable'],
    default: 'redeemable',
  }
});

// Create a User Subscription model based on the schema
const Subscription = mongoose.model('user_subscription', subscriptionSchema);

module.exports = Subscription;

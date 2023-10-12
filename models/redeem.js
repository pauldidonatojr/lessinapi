const mongoose = require('mongoose');

const redeemCodeSchema  = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  itemID: {
    type: String,
    required: true,
  },
  validity: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  purchase_date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Availed','Pending'], // You can customize the enum values
    default: 'Pending',
  },
});

const RedeemCode = mongoose.model('RedeemCode', redeemCodeSchema);


module.exports = RedeemCode;

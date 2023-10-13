const mongoose = require('mongoose');

const leads = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: false,
  },
  responder_id: {
    type: String,
    required: false,
    unique: false,
  },
  client_id: {
    type: String,
    required: true,
    unique: false,
  },
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'close'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    unique: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  close_date: {
    type: Date,
  },
  chathistory: [{
    uid: String,
    message: String,
    status: String,
    date: {
        type: Date,
        default: Date.now,
      },
  },
],
});

const Leads = mongoose.model('leads', leads);

module.exports = {
    Leads
};

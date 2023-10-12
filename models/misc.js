const mongoose = require('mongoose');

const miscSchema = new mongoose.Schema({
  metakey: {
    type: String,
    required: true,
  },
  metavalue: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const Misc = mongoose.model('Misc', miscSchema);

module.exports = Misc;

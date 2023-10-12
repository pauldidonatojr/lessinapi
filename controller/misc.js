const mongoose = require('mongoose');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();

const Misc  = require("../models/misc");
const { User } = require("../models/user");

exports.ContentManagement = async (req, res) => {
  const { type, metakey, metavalue } = req.body;

  
  try {
    if (type === 'insert') {
      const newMisc = new Misc({
        metakey,
        metavalue,
      });
      await newMisc.save();
      
      res.status(201).json({ message: 'Record inserted successfully' });
    } else if (type === 'update') {
      const existingMisc = await Misc.findOne({ metakey });
      if (existingMisc) {
        existingMisc.metavalue = metavalue;
        await existingMisc.save();
        res.json({ message: 'Record updated successfully' });
      } else {
        res.status(404).json({ message: 'Record not found' });
      }
    } else if (type === 'delete') {
      const deletedMisc = await Misc.findOneAndDelete({ metakey });
      if (deletedMisc) {
        res.json({ message: 'Record deleted successfully' });
      } else {
        res.status(404).json({ message: 'Record not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.GetContentManagement = async (req, res) => {
  try {
    const miscData = await Misc.find();
    res.json(miscData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
};
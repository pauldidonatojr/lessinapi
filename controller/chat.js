const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

require("dotenv").config();

const { Leads } = require('../models/chat');
const { User } = require("../models/user");
const { Customers } = require("../models/customers");
const {
    validateChat
  } = require("../middleware/chat");

  const { sendEmails } = require("../utils/emailService");

exports.CreateLead = async (req, res) => {
  const { name, email, phone, message } = req.body;
  
  const { error } = validateChat(req.body);
  if (error) return res.status(400).send({ message: "Enter data correctly" });

  const useremail = await Customers.findOne({ email: email.toLowerCase() });
  

  if (!useremail) {
        const password = Math.random().toString(36).substring(2,10);
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const words = name.split(' ');

        // Capitalize the first letter of each word and convert the rest to lowercase
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Join the formatted words with a space to create the final formatted name
        const formattedName = formattedWords.join(' ');

        let newCustomer = new Customers({
            email: email.toLowerCase(),
            password: hashedPassword,
            name: formattedName,
            phone: phone,
            status: '1',
        });
        var savedUser = await newCustomer.save();
        
    }
    else{
        var savedUser = await Customers.findOne({
            email: email.toLowerCase(),
        });
        
    }
        try {
            const chatDetails = [
                {
                    uid: savedUser._id,
                    message: message,
                    status: '0'
                }
              ];

        let newLead = new Leads({
            uid: savedUser._id,
            responder_id: '',
            client_id: '1',
            message: message,
            chathistory: chatDetails
        });
        const savedLead = await newLead.save();
    return res.status(201).json({ result: "success",message: 'Lead generated successfully',leadId:savedLead._id,uid:savedUser._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: "error", message: 'An error occurred' });
  }
};


exports.SendMessage = async (req, res) => {
    const { leadID ,uid, message } = req.body;
  
    // const { error } = validateChat(req.body);
    // if (error) return res.status(400).send({ message: "Enter data correctly" });
    try {
        if(req.body.utype){
            utype = 'admin';
        }
        else{
            utype = 'user';
        }
    const leadcheck = await Leads.findOne({ _id: leadID });
    
    if(utype=='admin'){
        if(leadcheck.responder_id!=''){
            return res.status(404).json({ result: "error",message: 'Lead assigned to someone else' });
        }
        else{
            // Create a new chat history object
            const newChat = {
                message: message,
                status: '0',
                uid: uid,
            };
            
            // Add the new chat history object to the existing array
            leadcheck.responder_id = uid;
            leadcheck.chathistory.push(newChat);
            rep = await leadcheck.save();
        }
    }
    else{
        // Create a new chat history object
        const newChat = {
            message: message,
            status: '0',
            uid: uid,
        };
        leadcheck.chathistory.push(newChat);
        rep = await leadcheck.save();
    }
      return res.status(201).json({ result: "success",message: 'message sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  exports.FetchLeads = async (req, res) => {
    const { uid } = req.body;
  
    try {
      // Query for open leads where responder_id is blank and status is open
          // Convert the "uid" in "leads" to ObjectId for matching
    const uidAsObjectId = new mongoose.Types.ObjectId(uid);

    // Query for open leads where responder_id is blank and status is open
    const openleads = await Leads.aggregate([
      {
        $addFields: {
          localFieldObjectId: {
            $toObjectId: '$uid'
          }
        }
      },
      {
        $match: {
          $or: [
            {
              responder_id: uid,
              status: 'open',
            },
            {
              responder_id: '',
              status: 'open',
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'customers', // Collection name of the User schema
          localField: 'localFieldObjectId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user' // Unwind the 'user' array created by $lookup
      },
      {
        $project: {
          'user.name': 1,
          'user.email': 1,
          // Include all fields from the "leads" collection
          'uid': 1,
          'responder_id': 1,
          'client_id': 1,
          'status': 1,
          'message': 1,
          'date': 1,
          'close_date': 1,
          'chathistory': 1,
        }
        
      },
      {
        $sort: {
          date: -1 // Sort by the "date" field in ascending order
        }
      },
    ]);
    
  
      
      // Query for closed leads where responder_id is equal to uid and status is closed
      const closedleads = await Leads.aggregate([
        {
          $addFields: {
            localFieldObjectId: {
              $toObjectId: '$uid'
            }
          }
        },
        {
          $match: {
            responder_id: uid,
            status: 'close',
          }
        },
        {
          $lookup: {
            from: 'customers', // Collection name of the User schema
            localField: 'localFieldObjectId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user' // Unwind the 'user' array created by $lookup
        },
        {
          $project: {
            'user.name': 1,
            'user.email': 1,
            // Include all fields from the "leads" collection
            'uid': 1,
            'responder_id': 1,
            'client_id': 1,
            'status': 1,
            'message': 1,
            'date': 1,
            'close_date': 1,
            'chathistory': 1,
          }
        },
        {
          $sort: {
            date: -1 // Sort by the "date" field in ascending order
          }
        },
      ]);
  
      // Query for assigned leads where responder_id is equal to uid and status is open
      const assignedleads = await Leads.aggregate([
        {
          $addFields: {
            localFieldObjectId: {
              $toObjectId: '$uid'
            }
          }
        },
        {
          $match: {
            $or: [
              {
                responder_id: uid,
                status: 'open',
              },
              {
                responder_id: '',
                status: 'open',
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'customers', // Collection name of the User schema
            localField: 'localFieldObjectId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user' // Unwind the 'user' array created by $lookup
        },
        {
          $project: {
            'user.name': 1,
            'user.email': 1,
            // Include all fields from the "leads" collection
            'uid': 1,
            'responder_id': 1,
            'client_id': 1,
            'status': 1,
            'message': 1,
            'date': 1,
            'close_date': 1,
            'chathistory': 1,
          }
        }
      ]);
      
      return res.status(200).json({
        openleads: openleads,
        closedleads: closedleads
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ result: "error", message: 'An error occurred' });
    }
  };

  exports.FetchLeadsResponse = async (req, res) => {
    const { leadID } = req.body;
  
    try {
      // Query for data from the Leads table if leadID matches _id and responder_id is not null
      const response = await Leads.findOne({ _id: leadID, responder_id: { $ne: null } });
      console.log(response)
      if (response && response.responder_id) {
        // If a matching lead is found, retrieve user data using the user_id
        const userData = await User.findOne({ _id: response.responder_id });
        if (userData) {
          // Extract username and profile picture from user data
          const { userName, profile_picture } = userData;
  
          return res.status(200).json({
            response: {
              leadData: response,
              responder: {
                userName,
                profile_picture,
              },
            },
          });
        }
      }
  
      // Return an empty response if no matching lead is found
      return res.status(200).json({
        response: {},
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  };
  
  
exports.GetContentManagement = async (req, res) => {
  try {
    const miscData = await Misc.find();
    res.json(miscData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "error", message: 'An error occurred' });
  }
};
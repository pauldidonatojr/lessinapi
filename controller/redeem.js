const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const xlsx = require('xlsx');


const { User } = require("../models/user");
const RedeemCode = require('../models/redeem');
const Subscription  = require("../models/subscription");
const { ProductMaster, ProductDetails } = require('../models/products');


// Comment out the validation imports if you want to remove validation temporarily
const {
    validateFields
  } = require("../middleware/checkout");

  const { sendEmails } = require("../utils/emailService");



  
  exports.addRedeemCode = async (req, res) => {
    try {
      const { email, code, validity, item_id } = req.body;
      const user = await User.findOne({ email: email });
  
      if (user) {
        // Check if the code is already in the database
        const existingCode = await RedeemCode.findOne({ code: code });
  
        if (existingCode) {
          return res.status(400).send({ message: "Duplicate code found" });
        }
  
        const newRedeemCode = new RedeemCode({
          email: email,
          validity: validity,
          itemID: item_id,
          code: code,
        });
  
        const savedRedeemCode = await newRedeemCode.save();
        console.log("Code saved");
        return res.status(200).send({ message: "Code saved!" });
      } else {
        return res.status(404).send({ message: "User does not exist" });
      }
    } catch (err) {
      console.error("Error saving redeem code:", err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };
  
// exports.addRedeemCodeBulk = async (req, res) => {
//   const user_email = req.body.email;
//   const user = await User.findOne({ user_email });

//   if (!user) {
//     return res.status(404).send({ message: 'User does not exist' });
//   }

//   try {
//     const fileData = req.file;
//     const workbook = xlsx.read(fileData, { type: 'buffer' });

//     // Check if there are any sheets in the workbook
//     if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
//       return res.status(400).send({ message: 'No sheets found in the Excel file' });
//     }
//     console.log(fileData)
//     return res.status(404).send({ message: 'User does not exist' });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
    
//     // Assuming your Excel sheet has columns named 'code' and 'status'
//     const data = xlsx.utils.sheet_to_json(sheet);

//     const redeemCodes = data.map((item) => ({
//       email: user_email,
//       code: item.code,
//       status: item.status,
//     }));

//     const insertedRedeemCodes = await RedeemCode.insertMany(redeemCodes);
    
//     console.log(`${insertedRedeemCodes.length} codes saved`);
    
//     return res.status(200).send({ message: `${insertedRedeemCodes.length} codes saved` });
//   } catch (err) {
//     console.error('Error saving codes:', err);
//     return res.status(400).send({ message: 'Error saving codes' });
//   }
// };

// exports.updRedeemCode = async (req, res) => {
//   const { email, code, status } = req.body;
//   const user = await User.findOne({ email: email });
  
//   if (user) {
//     const newRedeemCode = new RedeemCode({
//       email: email,
//       code: code,
//       status: status
//     });
//     try {
//       await newRedeemCode.save();
//       console.log("Code saved");
//       return res.status(200).send({ message: "Code saved!" });
//     } catch (err) {
//       console.log("Code not saved", err);
//       return res.status(400).send({ message: "Code not saved" });
//     }
//   } else {
//     return res.status(404).send({ message: "User does not exist" });
//   }
// };

exports.deleteRedeemCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Find the RedeemCode document
    const redeemCode = await RedeemCode.findOne({ email: email, code: code });

    if (redeemCode) {
      // Check if the status is 'Availed'
      if (redeemCode.status === 'Availed') {
        console.log("Redeemed code cannot be deleted");
        return res.status(400).send({ message: "Redeemed code cannot be deleted" });
      } else {
        // Delete the code if status is not 'Availed'
        const deletedCode = await RedeemCode.findOneAndDelete({ email: email, code: code });

        console.log("Code deleted");
        return res.status(200).send({ message: "Code deleted!" });
      }
    } else {
      console.log("Code not found");
      return res.status(404).send({ message: "Code not found" });
    }
  } catch (err) {
    console.log("Error deleting code", err);
    return res.status(500).send({ message: "Error deleting code" });
  }
};


exports.availRedeemCode = async (req, res) => {
    const { email, code, status } = req.body;
    const user = await User.findOne({ email: email });
    
    if (user) {
        const activesubscription = await Subscription.findOne({ user:email,status: 'active' });
        if (activesubscription) {
            console.log("You have already have active subscription");
            return res.status(400).send({ message: "You have already have active subscription" });
        }
        const redeemCode = await RedeemCode.find({ code: code });

        if (redeemCode.length === 0) {
          return res.status(404).send({ message: 'error activating code contact admin' });
        }

        const check_subscription_available = await Subscription.findOne({ user:email,subscription_code: code,status: 'redeemable' });
        if (check_subscription_available) {
            
            const currentDate = new Date();

            // Add one month
            currentDate.setMonth(currentDate.getMonth() + redeemCode[0].validity);

            // Check if the new month value is 12 (December), and if so, increment the year
            if (currentDate.getMonth() === 0) {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            }

            // currentDate now contains the date one month in the future
            console.log(currentDate);

            //update subscription status
            check_subscription_available.status = 'active';
            check_subscription_available.date_availed = new Date();
            check_subscription_available.date_of_expiry = currentDate;
            await check_subscription_available.save();


            console.log("You have successfully availed subscription code");
            return res.status(200).send({ message: "You have successfully availed subscription code" });
        }
        else{
            console.log("something went wrong");
            return res.status(404).send({ message: "something went wrong" });
        }
      const newRedeemCode = new RedeemCode({
        email: email,
        code: code,
        status: status
      });
      try {
        const savedRedeemCode = await newRedeemCode.save();
        console.log("Code saved");
        return res.status(200).send({ message: "Code saved!" });
      } catch (err) {
        console.log("Code not saved", err);
        return res.status(400).send({ message: "Code not saved" });
      }
    } else {
      return res.status(404).send({ message: "User does not exist" });
    }
};

exports.availTrialCode = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email: email });
  
  if (user) {
      const activesubscription = await Subscription.findOne({ user:email,status: 'active' });
      if (activesubscription) {
          console.log("You have already have active subscription");
          return res.status(400).send({ message: "You have already have active subscription" });
      }
      // const redeemCode = await RedeemCode.find({ code: code });

      // if (redeemCode.length === 0) {
      //   return res.status(404).send({ message: 'error activating code contact admin' });
      // }

      // const check_subscription_available = await Subscription.findOne({ user:email,subscription_code: code,status: 'redeemable' });
      // if (check_subscription_available) {
          
          const currentDate = new Date();

          // Add days to month.
          var days = 3;
          currentDate.setDate(currentDate.getDate() + days);

          // Check if the new date crosses into the next month or year
          if (currentDate.getMonth() !== (currentDate.getMonth() + days) % 12) {
            // If the month has changed, adjust the year
            if (currentDate.getMonth() + days > 11) {
              currentDate.setFullYear(currentDate.getFullYear() + 1);
            }
          }

          // currentDate now contains the date one month in the future
          console.log(currentDate);

          //save trial subscription
          const TrialSubscription = new Subscription({
            user: email,
            subscription_code: code,
            status: 'active',
            purchase_date: new Date(),
            date_availed: new Date(),
            date_of_expiry: currentDate,
          });
          const savedRedeemCode = await TrialSubscription.save();


          console.log("You have successfully availed trial subscription code");
          return res.status(200).send({ message: "You have successfully availed trial subscription code" });
  } else {
    return res.status(404).send({ message: "User does not exist" });
  }
};

exports.getRedeemCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    const redeemWithDetails = [];
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Find all entries in the RedeemCode model associated with the user's email
    const redeemCode = await RedeemCode.find({ user: email });

    if (redeemCode.length === 0) {
      return res.status(200).send({ message: 'No entries found' });
    }
    const matchedMetadata = [];
    var availedby = '';
    for (const redeemCodes of redeemCode) {
      const UserSubscriptions = await Subscription.find({ subscription_code: redeemCodes.code });
      console.log(UserSubscriptions)

      if (UserSubscriptions.length > 0)
        availedby = UserSubscriptions[0].user;
      else
        availedby = '';

      console.log(availedby)
      const res_redeem = {
        id: redeemCodes._id,
        code: redeemCodes.code,
        email: redeemCodes.email,
        itemID: redeemCodes.itemID,
        validity: redeemCodes.validity,
        status: redeemCodes.status,
        availedby: availedby,
        date: redeemCodes.date,
    };
    redeemWithDetails.push(res_redeem);
    }
    const response = {
      message: `Fetched ${redeemCode.length} entries`,
      data: redeemWithDetails,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.getUserSubscription = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Find all entries in the RedeemCode model associated with the user's email
    const subscription = await Subscription.find({ user: email });

    if (subscription.length === 0) {
      return res.status(200).send({ message: 'No entries found' });
    }

    const activeEntries = subscription.filter((entry) => entry.status === 'active');

    const response = {
      message: `Fetched ${subscription.length} entries`,
      active: activeEntries,
      data: subscription,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.ProductSummary = async (req, res) => {
  const { master_id } = req.body;
  try {
    const redeemCodes = await RedeemCode.find();

    if (redeemCodes.length === 0) {
      return res.status(200).send({ message: 'No entries found' });
    }
    if(master_id)
      productMaster = await ProductMaster.find({ _id: master_id });
    else
      productMaster = await ProductMaster.find();
    const productSummaryArray = [];

    for (const product of productMaster) {
      const productDetail = await ProductDetails.find({ master_id: product._id });

      // Filter the metadata based on redeemCodes.itemID
      const matchedMetadata = [];
      for (const redeemCode of redeemCodes) {
        const matchingMetadata = productDetail[0].metadata.find(
          (metadata) => metadata._id.toString() === redeemCode.itemID
        );
        if (matchingMetadata) {
          
          matchedMetadata.push(matchingMetadata);
        }
      }
      
      // Add the matched metadata to the product object
      // product['metadata'] = matchedMetadata;
      const mergedProduct = {
        id: product._id,
        name: product.name,
        // image: productDetails.images, // You can choose which image to include here
        metadata: matchedMetadata,
        company: product.company,
        description: product.description,
        category: product.category,
        // shipping: product.shipping,
    };
    productSummaryArray.push(mergedProduct);
      // Push the modified product into the productSummaryArray
      // productSummaryArray.push(product);
    }

    // Return the productSummaryArray with redeemCodes as part of productMaster
    return res.status(200).send({ productSummaryArray });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};



// exports.ProductSummary = async (req, res) => {
//   try {
//     const redeemCodes = await RedeemCode.find();

//     if (redeemCodes.length === 0) {
//       return res.status(200).send({ message: 'No entries found' });
//     }

//     const productMaster = await ProductMaster.find({ _id: '6524d9cdb7cf137726336cf6' });
//     for (const productMasters of productMaster) {
//       var productDetail = await ProductDetails.find({ master_id: productMasters._id });
//       console.log(productDetail)
//       // const matchedMetadata = productDetail.metadata.find(meta => meta._id.toString() === productMaster.itemID);
//       // const matchedMetadata = productDetail.master_id.find(meta => meta._id.toString() === productMaster.itemID);
//     }
//     console.log(productDetail)
//     return res.status(500).send({ message: 'Internal Server Error' });
//     // Create a map to group metadata by product ID
//     const productMetadataMap = new Map();

//     // Iterate through each redeem code
//     for (const redeemCode of redeemCodes) {
//       // Find the associated product in ProductMaster based on itemID
//       const productDetails = await ProductDetails.findOne({
//         'metadata._id': redeemCode.itemID,
//       });

//       if (productDetails) {
//         // Find the ProductMaster document for the product
//         const productMaster = await ProductMaster.findOne({ _id: productDetails.master_id });
//         const matchedMetadata = productDetails.metadata.find(meta => meta._id.toString() === redeemCode.itemID);

//         if (productMaster) {
//           // Construct the metadata object
//           const metadataObject = {
//             price: matchedMetadata.price,
//             validity: matchedMetadata.validity,
//             pricedesc: matchedMetadata.pricedesc,
//             _id: matchedMetadata._id,
//           };

//           // Check if the product ID exists in the map
//           if (productMetadataMap.has(productMaster._id)) {
//             // If it exists, push the metadata to the existing array
//             productMetadataMap.get(productMaster._id).metadata.push(metadataObject);
//           } else {
//             // If it doesn't exist, create a new entry in the map
//             productMetadataMap.set(productMaster._id, {
//               id: productMaster._id,
//               name: productMaster.name,
//               company: productMaster.company,
//               description: productMaster.description,
//               category: productMaster.category,
//               metadata: [metadataObject],
//             });
//           }
//         } else {
//           console.log(`No ProductMaster found for itemID: ${redeemCode.itemID}`);
//         }
//       } else {
//         console.log(`No product found for itemID: ${redeemCode.itemID}`);
//       }
//     }

//     // Convert the map values to an array for the final response
//     const response = Array.from(productMetadataMap.values());

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send({ message: 'Internal Server Error' });
//   }
// };



exports.ValidityProductCount = async (req, res) => {
  const { item_id, validity } = req.body;

  try {
    // Query the database to find a matching document
    const matchingCode = await RedeemCode.findOne({
      // itemID: item_id,
      validity: validity,
      status: 'Pending',
      'metadata': {
        $elemMatch: {
          _id: item_id,
        }
      }
    });

    if (matchingCode) {
      // Subscription code is available
      return res.status(200).json({ message: 'Subscription code available' });
    } else {
      // Subscription code is not available
      return res.status(200).json({ message: 'Subscription code not available' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


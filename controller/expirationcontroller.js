// controllers/ExpirationController.js
const cron = require('node-cron');
const Subscription  = require("../models/subscription");

// Function to update expired documents
async function updateExpiredDocuments() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set the time to midnight for accurate comparison

  // Find documents where date_of_expiry is equal to the current date
  const expiredDocuments = await Subscription.find({ date_of_expiry: currentDate });

  // Update the status field to "expired" for each expired document
  for (const doc of expiredDocuments) {
    doc.status = 'expired';
    await doc.save(); // Save the updated document
  }
}

// Schedule the function to run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', () => {
  updateExpiredDocuments()
    .then(() => {
      console.log('Expired documents updated successfully.');
    })
    .catch((error) => {
      console.error('Error updating expired documents:', error);
    });
});

module.exports = {
  updateExpiredDocuments,
};

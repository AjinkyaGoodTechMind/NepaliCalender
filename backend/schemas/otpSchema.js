const { Schema, model } = require("mongoose");

const otpSchema = Schema({
  otp: {
    type: Number,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
});

module.exports = model("otp", otpSchema);

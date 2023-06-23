const UserSchema = require("../schemas/userSchema");
const OtpSchema = require("../schemas/otpSchema");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fast2sms = require("fast-two-sms");

const sessionController = {
  getUser: async (req, res, next) => {
    try {
      const user = req.user;
      res.json({ user });
    } catch (error) {
      return next(createError.InternalServerError(error));
    }
  },

  sendOtp: async (req, res, next) => {
    try {
      const { contactNumber } = req.body;

      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

      await OtpSchema.create({ contactNumber: contactNumber, otp: otp });

      var options = { authorization: process.env.SMS_KEY, message: `Your OTP is : ${otp}`, numbers: [contactNumber] };

      fast2sms
        .sendMessage(options)
        .then(async (responce) => {
          const user = await UserSchema.findOne({ contactNumber: contactNumber });

          if (user) {
            res.status(200).json({ message: "Otp Sent Successfully", userExists: true });
          } else {
            res.status(200).json({ message: "Otp Sent Successfully", userExists: false });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(401).json("Please Enter Valid Contact Number");
        });
    } catch (error) {
      return next(createError.InternalServerError(error));
    }
  },

  verifyOtpAndLogin: async (req, res, next) => {
    try {
      const { contactNumber, otp, username } = req.body;

      if (!contactNumber) {
        res.status(400).send("Contact Number is Required");
      } else if (!otp) {
        res.status(400).send("Otp is Required");
      } else {
        const validOtp = await OtpSchema.findOne({ contactNumber: contactNumber });

        if (validOtp.otp.toString() === otp.toString()) {
          await OtpSchema.findOneAndDelete({ contactNumber: contactNumber });

          const user = await UserSchema.findOne({ contactNumber: contactNumber });

          if (user) {
            //Create JWT
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

            res.cookie("jwt", accessToken, { httpOnly: true });
            res.status(200).json({ user, accessToken });
          } else {
            const userCreated = await UserSchema.create({ contactNumber: contactNumber, username: username });
            const accessToken = jwt.sign({ id: userCreated._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

            res.cookie("jwt", accessToken, { httpOnly: true });
            res.status(200).json({ user: userCreated, accessToken });
          }
        } else {
          res.status(401).json("Otp Invalid");
        }
      }
    } catch (error) {
      return next(createError.InternalServerError(error));
    }
  },

  logout: async (req, res, next) => {
    try {
      const cookies = req.cookies;
      if (!cookies?.jwt) {
        return res.sendStatus(204); //No Content
      }

      res.clearCookie("jwt", { httpOnly: true });
      res.sendStatus(204);
    } catch (error) {
      return next(createError.InternalServerError(error));
    }
  },

  update: async (req, res, next) => {
    try {
      const image = req.file;
      if (image) {
        const filePath = `/${image.destination}/${image.filename}`;

        await UserSchema.findOneAndUpdate({ _id: req.user._id }, { $set: { ...req.body, profilePic: filePath } });
      } else {
        await UserSchema.findOneAndUpdate({ _id: req.user._id }, { $set: { ...req.body } });
      }

      res.sendStatus(204);
    } catch (error) {
      return next(createError.InternalServerError(error));
    }
  },
};

module.exports = sessionController;

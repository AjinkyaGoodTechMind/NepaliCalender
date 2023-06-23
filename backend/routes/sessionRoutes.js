const router = require("express").Router();
const sessionController = require("../controllers/sessionController");
const { isAuthenticated } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profilePic/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

router.get("/getUser", isAuthenticated, sessionController.getUser);

router.post("/sendOtp", sessionController.sendOtp);

// router.post("/register", sessionController.register);

router.post("/verifyOtpAndLogin", sessionController.verifyOtpAndLogin);

router.get("/logout", sessionController.logout);

router.put("/update", isAuthenticated, upload.single("image"), sessionController.update);

module.exports = router;

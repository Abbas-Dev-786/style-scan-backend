const express = require("express");
const {
  searchImage,
  getJSON,
} = require("../controllers/imageSearchController");
const {
  upload,
  convertToBase64,
} = require("../middleware/imageSearchMiddleware");

const router = express.Router();

router.post("/search", upload.single("image"), convertToBase64, searchImage);

router.post("/json", getJSON);

module.exports = router;

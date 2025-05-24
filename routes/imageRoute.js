const express = require("express");
const {
  searchImage,
  getJSON,
  searchProduct,
} = require("../controllers/imageSearchController");
const {
  upload,
  convertToBase64,
} = require("../middleware/imageSearchMiddleware");

const router = express.Router();

router.post("/search", upload.single("image"), convertToBase64, searchImage);
router.post("/product", searchProduct);

router.post("/json", getJSON);

module.exports = router;

const express = require("express");
const {
  searchImage,
  getJSON,
} = require("../controllers/imageSearchController");

const router = express.Router();

router.post("/search", searchImage);

router.post("/json", getJSON);

module.exports = router;

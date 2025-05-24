const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const convertToBase64 = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  try {
    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString("base64");

    // Create the complete data URI with the correct format
    req.base64Image = `data:${req.file.mimetype};base64,${base64Image}`;

    next();
  } catch (error) {
    return res.status(500).json({ error: "Error converting image to base64" });
  }
};

// Export both the multer middleware and the conversion middleware
module.exports = {
  upload,
  convertToBase64,
};

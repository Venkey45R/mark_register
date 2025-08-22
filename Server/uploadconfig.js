// uploadConfig.js
import multer from "multer";
import path from "path";

// Set storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // local folder
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + path.extname(file.originalname) // unique filename
    );
  },
});

const upload = multer({ storage: storage });

export default upload;

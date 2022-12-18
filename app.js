import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import process from "process";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/users.mjs";
import authRoute from "./routes/auth.mjs";
import postsRoute from "./routes/posts.mjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import {v4 as uuidv4} from "uuid"

const app = express();

dotenv.config();

// upload config
// get dirname of root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// make a storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/public/images`);
  },
  filename: function (req, file, cb) {
    if (req.body.filename) {
      cb(null, req.body.filename);
      return;
    }
    let formatFile = file.originalname.split('.');
    formatFile = formatFile[formatFile.length - 1]
    cb(null, `${uuidv4({date: Date.now()})}.${formatFile}`);
  },
});

const upload = multer({ storage });

// connected to database mongodb
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.info("Connected to mongoDB");
  }
);

// midleware
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "http://localhost:5173", optionsSuccessStatus: 200 }));
app.use(morgan("common"));

// set path images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// api upload images
app.post("/api/upload", upload.single("image"), async (req, res) => { 
  try {
    // remove image when client want
    const removeFile = req.body.remove;
    if (removeFile) {
      const fileDir = `${__dirname}/public/images/${req.body.remove}`;
      await fs.rm(fileDir, {force: true});
    }

    return res.status(200).json({ message: "File uploaded successfully!", filename: req.file.filename, remove: req.body.remove });
  } catch (error) {
    return res.status(500).json(error);
  }
});

// api
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);

app.listen(8800, () => {
  console.info("Backend server is running on port 8800");
});

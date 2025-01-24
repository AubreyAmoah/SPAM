import express from 'express'
import path from 'path'
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import authMiddleware from "./middleware/authMiddleware.js";
import authRoutes from './api/auth/auth.router.js'

const app = express();
const PORT = process.env.PORT || 5500;

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));


app.use(cookieParser());


app.get("/help", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/auth", authRoutes);
// app.use("/todos", authMiddleware, todoRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});
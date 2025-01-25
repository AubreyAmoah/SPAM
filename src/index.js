import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import credentials from "./config/cors/middleware/credentials.js";
import corsOptions from "./config/cors/corsOptions.js";

import authMiddleware from "./middleware/authMiddleware.js";
import authRoutes from "./api/auth/auth.router.js";

const app = express();
const PORT = process.env.PORT || 5500;

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(credentials);
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/help", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/auth", authRoutes);
// app.use("/todos", authMiddleware, todoRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});

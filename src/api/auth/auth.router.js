import express from "express";
import {
  handleLogout,
  handleRefreshToken,
  login,
  register,
} from "./auth.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import refreshMiddleware from "../../middleware/refreshMiddleware.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.get("/refresh", refreshMiddleware, handleRefreshToken);
router.get("/logout", refreshMiddleware, handleLogout);

export default router;

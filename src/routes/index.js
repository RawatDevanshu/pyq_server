import express from "express";
const router = express.Router();

import paperRouter from "./paper.js";
import userRouter from "./user.js";

router.use("/paper", paperRouter);
router.use("/user", userRouter);

export default router;

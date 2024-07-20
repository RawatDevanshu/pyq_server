import { Router } from "express";
import {
  downloadPaper,
  uploadPaper,
  deletePaper,
  getPapers,
} from "../controllers/paper.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/download", downloadPaper);
router.get("/show", getPapers);

// secured routes
router.post("/upload", verifyJWT, uploadPaper);
router.delete("/delete", verifyJWT, deletePaper);

export default router;

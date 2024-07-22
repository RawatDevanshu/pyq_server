import { Router } from "express";
import multer from "multer";
import {
  downloadPaper,
  uploadPaper,
  deletePaper,
  getPapers,
} from "../controllers/paper.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/download", downloadPaper);
router.get("/show", getPapers);

// secured routes
router.post("/upload", verifyJWT, upload.single("file"), uploadPaper);
router.delete("/delete", verifyJWT, deletePaper);

export default router;

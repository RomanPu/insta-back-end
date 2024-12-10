import express from "express";
import {
  getMessages,
  addMessage,
  getMessageById,
  editMessage,
} from "./message.controller.js";
import { log } from "../../middlewares/log.middleware.js";
import { requireAuth } from "../../middlewares/require-auth.middleware.js";

const router = express.Router();

router.get("/:id", requireAuth, log, getMessageById);
router.get("/", log, getMessages);
router.post("/", requireAuth, log, addMessage);
router.put("/", requireAuth, log, editMessage);

export const messageRoutes = router;

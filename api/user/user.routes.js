import express from "express";
import {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
} from "./user.controller.js";
import { requireAuth } from "../../middlewares/require-auth.middleware.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/", updateUser);
router.post("/", updateUser);
router.delete("/:id", deleteUser);

export const userRoutes = router;

import express from "express";
import {
  addPost,
  getPosts,
  getPost,
  removePost,
  updatePost,
} from "./post.controller.js";
import { requireAuth } from "../../middlewares/require-auth.middleware.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:postId", getPost);
router.delete("/:postId", removePost);
router.post("/", addPost);
router.put("/", updatePost);

export const postRoutes = router;

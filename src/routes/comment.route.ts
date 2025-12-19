import { Router } from "express";
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const commentRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Blog comment management
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment on a post
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentText
 *               - postId
 *             properties:
 *               commentText:
 *                 type: string
 *                 example: Great blog post!
 *               postId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid input
 */
commentRoutes.post("/",authenticate, createComment);

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments or filter by post ID
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Optional post ID to filter comments
 *     responses:
 *       200:
 *         description: List of comments
 */
commentRoutes.get("/",authenticate, getComments);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment details with post and user info
 *       404:
 *         description: Comment not found
 */
commentRoutes.get("/:id",authenticate, getCommentById);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentText:
 *                 type: string
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */
commentRoutes.put("/:id",authenticate, updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
commentRoutes.delete("/:id",authenticate, deleteComment);

export default commentRoutes;

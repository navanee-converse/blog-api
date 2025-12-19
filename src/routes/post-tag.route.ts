import { Router } from "express";
import {
  assignTagToPost,
  getTagsByPost,
  removeTagFromPost,
} from "../controllers/post-tag.controller";
import { Role } from "../enums/role.enum";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";

const postTagRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Post-Tags
 *   description: Post and tag relationship management
 */

/**
 * @swagger
 * /post-tags:
 *   post:
 *     summary: Assign a tag to a post
 *     tags: [Post-Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - tagId
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               tagId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       201:
 *         description: Tag assigned to post successfully
 *       400:
 *         description: Invalid input
 */
postTagRoutes.post(
  "/",
  authenticate,
  authorize(Role.Admin, Role.Author),
  assignTagToPost
);

/**
 * @swagger
 * /post-tags:
 *   get:
 *     summary: Get all post-tag relationships or filter by post ID
 *     tags: [Post-Tags]
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Optional post ID to filter tags by post
 *     responses:
 *       200:
 *         description: List of post-tag relationships
 */
postTagRoutes.get("/", authenticate, getTagsByPost);

/**
 * @swagger
 * /post-tags/{id}:
 *   delete:
 *     summary: Remove a tag from a post
 *     tags: [Post-Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post-Tag relationship ID
 *     responses:
 *       200:
 *         description: Tag removed from post successfully
 *       404:
 *         description: Post-Tag relationship not found
 */
postTagRoutes.delete(
  "/:id",
  authenticate,
  authorize(Role.Admin, Role.Author),
  removeTagFromPost
);

export default postTagRoutes;

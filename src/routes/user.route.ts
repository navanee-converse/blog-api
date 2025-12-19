import { Router } from "express";
import {
  userCreate,
  getCurrentUser,
  userUpdate,
  userDelete,
  login,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const userRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management APIs
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               role:
 *                 type: string
 *                 enum:
 *                   - admin
 *                   - user
 *                   - author
 *                 example: user
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
userRoutes.post("/", userCreate);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of users
 */
userRoutes.get("/", authenticate, getCurrentUser);

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Update user by ID
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
userRoutes.put("/", authenticate, userUpdate);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
userRoutes.delete("/", authenticate, userDelete);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user and generate JWT token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *       401:
 *         description: Invalid credentials
 */
userRoutes.post("/login", login);

export default userRoutes;

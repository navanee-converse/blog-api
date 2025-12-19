import { Request, Response } from "express";
import {
  createPostService,
  getPostByIdService,
  getAllPostsService,
  updatePostService,
  deletePostService,
} from "../services/post.service";
import { HttpError } from "../utils/http-error";
import { sendResponse } from "../utils/response.util";

export const createPost = async (req: Request, res: Response) => {
  const post = await createPostService(req.body, req.user);
  sendResponse(res, post, "Post created successfully", 201);
};

export const getPostById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Post ID is required");

  const post = await getPostByIdService(id);
  if (!post) throw new HttpError(404, "Post not found");

  sendResponse(res, post, "Post fetched successfully");
};

export const getAllPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await getAllPostsService(page, limit);
  sendResponse(res, result, "Posts fetched successfully");
};

export const updatePost = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Post ID is required");

  const post = await updatePostService(req.body, id, req.user);
  if (!post) throw new HttpError(404, "Post not found");

  sendResponse(res, post, "Post updated successfully");
};

export const deletePost = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Post ID is required");

  const deleted = await deletePostService(id);
  if (!deleted) throw new HttpError(404, "Post not found");

  sendResponse(res, null, "Post deleted successfully");
};

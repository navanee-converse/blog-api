import { Request, Response } from "express";
import {
  createCommentService,
  getCommentByIdService,
  getCommentsByPostId,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service";
import { HttpError } from "../utils/http-error";
import { sendResponse } from "../utils/response.util";

export const createComment = async (req: Request, res: Response) => {
  const comment = await createCommentService(req.body, req.user);
  sendResponse(res, comment, "Comment created successfully", 201);
};

export const getCommentById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Comment ID is required");

  const comment = await getCommentByIdService(id);
  if (!comment) throw new HttpError(404, "Comment not found");

  sendResponse(res, comment, "Comment fetched successfully");
};

export const getComments = async (req: Request, res: Response) => {
  const postId = req.query.postId as string | undefined;
  const comments = await getCommentsByPostId(postId);
  sendResponse(res, comments, "Comments fetched successfully");
};

export const updateComment = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Comment ID is required");

  const comment = await updateCommentService(id, req.body);
  if (!comment) throw new HttpError(404, "Comment not found");

  sendResponse(res, comment, "Comment updated successfully");
};

export const deleteComment = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Comment ID is required");

  const deleted = await deleteCommentService(id);
  if (!deleted) throw new HttpError(404, "Comment not found");

  sendResponse(res, null, "Comment deleted successfully");
};

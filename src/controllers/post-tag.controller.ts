import { Request, Response } from "express";
import {
  assignTagToPostService,
  getTagsByPostId,
  removeTagFromPostService,
} from "../services/post-tag.service";
import { HttpError } from "../utils/http-error";
import { sendResponse } from "../utils/response.util";

export const assignTagToPost = async (req: Request, res: Response) => {
  const postTag = await assignTagToPostService(req.body);
  sendResponse(res, postTag, "Tag assigned to post successfully", 201);
};

export const getTagsByPost = async (req: Request, res: Response) => {
  const postId = req.query.postId as string | undefined;
  const tags = await getTagsByPostId(postId);
  sendResponse(res, tags, "Tags fetched successfully");
};

export const removeTagFromPost = async (req: Request, res: Response) => {
  const id = req.params.id!;

  const deleted = await removeTagFromPostService(id);
  if (!deleted) throw new HttpError(404, "PostTag not found");

  sendResponse(res, null, "Tag removed from post successfully");
};

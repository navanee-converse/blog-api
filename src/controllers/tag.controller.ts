import { Request, Response } from "express";
import {
  createTagService,
  getTagByIdService,
  getAllTagsService,
  updateTagService,
  deleteTagService,
} from "../services/tag.service";
import { HttpError } from "../utils/http-error";
import { sendResponse } from "../utils/response.util";

export const createTag = async (req: Request, res: Response) => {
  const tag = await createTagService(req.body);
  sendResponse(res, tag, "Tag created successfully", 201);
};

export const getTagById = async (req: Request, res: Response) => {
  const id = req.params.id!;

  const tag = await getTagByIdService(id);
  sendResponse(res, tag, "Tag fetched successfully");
};

export const getAllTags = async (_req: Request, res: Response) => {
  const tags = await getAllTagsService();
  sendResponse(res, tags, "Tags fetched successfully");
};

export const updateTag = async (req: Request, res: Response) => {
  const id = req.params.id!;

  const tag = await updateTagService(id, req.body);
  sendResponse(res, tag, "Tag updated successfully");
};

export const deleteTag = async (req: Request, res: Response) => {
  const id = req.params.id!;

  const deleted = await deleteTagService(id);
  if (!deleted) throw new HttpError(404, "Tag not found");

  sendResponse(res, null, "Tag deleted successfully");
};

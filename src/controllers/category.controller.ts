import { Request, Response } from "express";
import {
  createCategoryService,
  getCategoryByIdService,
  getAllCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";
import { HttpError } from "../utils/http-error";
import { sendResponse } from "../utils/response.util";

export const createCategory = async (req: Request, res: Response) => {
  const category = await createCategoryService(req.body);
  sendResponse(res, category, "Category created successfully", 201);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Category ID is required");

  const category = await getCategoryByIdService(id);
  if (!category) throw new HttpError(404, "Category not found");

  sendResponse(res, category, "Category fetched successfully");
};

export const getAllCategories = async (_req: Request, res: Response) => {
  const categories = await getAllCategoriesService();
  sendResponse(res, categories, "Categories fetched successfully");
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Category ID is required");

  const category = await updateCategoryService(id, req.body);
  if (!category) throw new HttpError(404, "Category not found");

  sendResponse(res, category, "Category updated successfully");
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new HttpError(400, "Category ID is required");

  const deleted = await deleteCategoryService(id);
  if (!deleted) throw new HttpError(404, "Category not found");

  sendResponse(res, null, "Category deleted successfully");
};

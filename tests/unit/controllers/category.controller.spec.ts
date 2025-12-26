import { Request, Response } from "express";
import * as categoryService from "../../../src/services/category.service";
import {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../../../src/controllers/category.controller";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";

jest.mock("../../../src/services/category.service");
jest.mock("../../../src/utils/response.util");

describe("Category Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create category and send response", async () => {
      const category = { id: "1", name: "Tech" };
      req.body = { name: "Tech" };

      (categoryService.createCategoryService as jest.Mock).mockResolvedValue(
        category
      );

      await createCategory(req as Request, res as Response);

      expect(categoryService.createCategoryService).toHaveBeenCalledWith(
        req.body
      );
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        category,
        "Category created successfully",
        201
      );
    });
  });

  describe("getCategoryById", () => {
    it("should return category ", async () => {
      const category = { id: "1", name: "Tech" };
      req.params = { id: "1" };

      (categoryService.getCategoryByIdService as jest.Mock).mockResolvedValue(
        category
      );

      await getCategoryById(req as Request, res as Response);

      expect(categoryService.getCategoryByIdService).toHaveBeenCalledWith("1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        category,
        "Category fetched successfully"
      );
    });
  });

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      const categories = [{ id: "1", name: "Tech" }];

      (categoryService.getAllCategoriesService as jest.Mock).mockResolvedValue(
        categories
      );

      await getAllCategories(req as Request, res as Response);

      expect(categoryService.getAllCategoriesService).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        categories,
        "Categories fetched successfully"
      );
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const category = { id: "1", name: "Updated" };
      req.params = { id: "1" };
      req.body = { name: "Updated" };

      (categoryService.updateCategoryService as jest.Mock).mockResolvedValue(
        category
      );

      await updateCategory(req as Request, res as Response);

      expect(categoryService.updateCategoryService).toHaveBeenCalledWith(
        "1",
        req.body
      );
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        category,
        "Category updated successfully"
      );
    });
  });

  describe("deleteCategory", () => {
    it("should throw 404 if category not found", async () => {
      req.params = { id: "1" };

      (categoryService.deleteCategoryService as jest.Mock).mockResolvedValue(
        false
      );

      await expect(
        deleteCategory(req as Request, res as Response)
      ).rejects.toThrow(new HttpError(404, "Category not found"));
    });

    it("should delete category successfully", async () => {
      req.params = { id: "1" };

      (categoryService.deleteCategoryService as jest.Mock).mockResolvedValue(
        true
      );

      await deleteCategory(req as Request, res as Response);

      expect(categoryService.deleteCategoryService).toHaveBeenCalledWith("1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Category deleted successfully"
      );
    });
  });
});

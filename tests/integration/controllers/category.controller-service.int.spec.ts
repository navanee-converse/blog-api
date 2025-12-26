import { Request, Response } from "express";
import {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../../../src/controllers/category.controller";
import { Category } from "../../../src/models/category.entity";
import { AppDataSource } from "../../../src/database/data-source";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";
import { randomUUID } from "crypto";
import "../../setup/setup";

jest.mock("../../../src/utils/response.util", () => ({
  sendResponse: jest.fn(),
}));

describe("Category Controller Service Integration Test", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(async () => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    await AppDataSource.getRepository(Category)
      .createQueryBuilder()
      .delete()
      .execute();
  });

  describe("Create Category", () => {
    it("should create category", async () => {
      req.body = { name: "Tech" };

      await createCategory(req as Request, res as Response);

      const categories = await AppDataSource.getRepository(Category).find();

      expect(categories.length).toBe(1);
      expect(categories[0].name).toBe("Tech");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ name: "Tech" }),
        "Category created successfully",
        201
      );
    });
  });

  describe("Get Category by Id", () => {
    it("should get category by id", async () => {
      const category = await AppDataSource.getRepository(Category).save({
        name: "Sports",
      });

      req.params = { id: category.id };

      await getCategoryById(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ id: category.id }),
        "Category fetched successfully"
      );
    });

    it("should throw error if category not found", async () => {
      req.params = { id: randomUUID() };

      await expect(
        getCategoryById(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get Categories", () => {
    it("should get all categories", async () => {
      await AppDataSource.getRepository(Category).save([
        { name: "Tech" },
        { name: "Health" },
      ]);

      await getAllCategories(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.any(Array),
        "Categories fetched successfully"
      );
    });
  });

  describe("Update Category", () => {
    it("should update category", async () => {
      const category = await AppDataSource.getRepository(Category).save({
        name: "Old Name",
      });

      req.params = { id: category.id };
      req.body = { name: "Updated Name" };

      await updateCategory(req as Request, res as Response);

      const updated = await AppDataSource.getRepository(Category).findOneBy({
        id: category.id,
      });

      expect(updated?.name).toBe("Updated Name");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ name: "Updated Name" }),
        "Category updated successfully"
      );
    });
  });

  describe("Delete Category", () => {
    it("should delete category", async () => {
      const category = await AppDataSource.getRepository(Category).save({
        name: "Delete Me",
      });

      req.params = { id: category.id };

      await deleteCategory(req as Request, res as Response);

      const deleted = await AppDataSource.getRepository(Category).findOneBy({
        id: category.id,
      });

      expect(deleted).toBeNull();

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Category deleted successfully"
      );
    });

    it("should throw error if delete fails", async () => {
      req.params = { id: randomUUID() };

      await expect(
        deleteCategory(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
});

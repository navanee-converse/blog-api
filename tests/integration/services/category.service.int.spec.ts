import {
  createCategoryService,
  getCategoryByIdService,
  getAllCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "../../../src/services/category.service";
import { HttpError } from "../../../src/utils/http-error";
import { randomUUID } from "crypto";
import "../../setup/setup";
describe("Category Integration Tests", () => {
  let categoryId: string;

  describe("Create Category", () => {
    it("should create a category successfully", async () => {
      const category = await createCategoryService({
        name: "Technology",
        description: "Tech related posts",
      });

      categoryId = category.id;

      expect(category).toHaveProperty("id");
      expect(category.name).toBe("Technology");
      expect(category.description).toBe("Tech related posts");
    });
  });

  describe("Get Category By ID", () => {
    it("should return category for valid id", async () => {
      const category = await getCategoryByIdService(categoryId);

      expect(category.id).toBe(categoryId);
      expect(category.name).toBeDefined();
    });

    it("should throw error for invalid id", async () => {
      await expect(getCategoryByIdService(randomUUID())).rejects.toBeInstanceOf(
        HttpError
      );
    });
  });

  describe("Get All Categories", () => {
    it("should return list of categories", async () => {
      const categories = await getAllCategoriesService();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe("Update Category", () => {
    it("should update category fields", async () => {
      const updated = await updateCategoryService(categoryId, {
        name: "Updated Technology",
        description: "Updated description",
      });

      expect(updated.name).toBe("Updated Technology");
      expect(updated.description).toBe("Updated description");
    });

    it("should throw error for invalid category id", async () => {
      await expect(
        updateCategoryService(randomUUID(), { name: "Invalid" })
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Delete Category", () => {
    it("should delete category successfully", async () => {
      const result = await deleteCategoryService(categoryId);
      expect(result).toBe(true);
    });

    it("should return false when deleting non-existing category", async () => {
      const result = await deleteCategoryService(categoryId);
      expect(result).toBe(false);
    });
  });
});

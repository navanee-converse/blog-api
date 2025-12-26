import { HttpError } from "../../../src/utils/http-error";
import {
  createCategoryService,
  getCategoryByIdService,
  getAllCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "../../../src/services/category.service";
import * as dataSourceMock from "../../../src/database/data-source";

jest.mock("../../../src/database/data-source", () => {
  const mockCategoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockCategoryRepo),
    },
    mockRepoCategory: mockCategoryRepo,
  };
});

const { mockRepoCategory } = dataSourceMock as any;
describe("CategoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategoryService", () => {
    it("should create a category", async () => {0
      const dto = { name: "Tech", description: "Technology" };
      const created = { id: "1", ...dto };
      const saved = { ...created, createdAt: new Date() };

      mockRepoCategory.create.mockReturnValue(created);
      mockRepoCategory.save.mockResolvedValue(saved);

      const result = await createCategoryService(dto);

      expect(mockRepoCategory.create).toHaveBeenCalledWith(dto);
      expect(mockRepoCategory.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });
  });

  describe("getCategoryByIdService", () => {
    it("should return category if found", async () => {
      const category = { id: "1", name: "Tech" };
      mockRepoCategory.findOne.mockResolvedValue(category);

      const result = await getCategoryByIdService("1");

      expect(result).toEqual(category);
    });

    it("should throw HttpError if not found", async () => {
      mockRepoCategory.findOne.mockResolvedValue(null);

      await expect(getCategoryByIdService("1")).rejects.toThrow(HttpError);
      await expect(getCategoryByIdService("1")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("getAllCategoriesService", () => {
    it("should return all categories", async () => {
      const categories = [{ id: "1" }, { id: "2" }];
      mockRepoCategory.find.mockResolvedValue(categories);

      const result = await getAllCategoriesService();

      expect(mockRepoCategory.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual(categories);
    });
  });

  describe("updateCategoryService", () => {
    it("should update category fields", async () => {
      const existing = { id: "1", name: "Old", description: "Old desc" };
      mockRepoCategory.findOne.mockResolvedValue(existing);
      mockRepoCategory.save.mockResolvedValue({
        id: "1",
        name: "New",
        description: "New desc",
      });

      const result = await updateCategoryService("1", {
        name: "New",
        description: "New desc",
      });

      expect(existing.name).toBe("New");
      expect(existing.description).toBe("New desc");
      expect(mockRepoCategory.save).toHaveBeenCalledWith(existing);
      expect(result.name).toBe("New");
    });
  });

  describe("deleteCategoryService", () => {
    it("should return true if deleted", async () => {
      mockRepoCategory.delete.mockResolvedValue({ affected: 1 });

      const result = await deleteCategoryService("1");

      expect(result).toBe(true);
    });

    it("should return false if nothing deleted", async () => {
      mockRepoCategory.delete.mockResolvedValue({ affected: 0 });

      const result = await deleteCategoryService("1");

      expect(result).toBe(false);
    });
  });
});

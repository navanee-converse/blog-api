import {
  createTagService,
  getTagByIdService,
  getAllTagsService,
  updateTagService,
  deleteTagService,
} from "../../../src/services/tag.service";
import { HttpError } from "../../../src/utils/http-error";
import * as tagService from "../../../src/services/tag.service";
import * as dataSourceMock from "../../../src/database/data-source";

jest.mock("../../../src/database/data-source", () => {
  const mockTagRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockTagRepo),
    },
    mockTag: mockTagRepo,
  };
});

describe("tagService", () => {
  const { mockTag } = dataSourceMock as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTagService", () => {
    it("should create a tag successfully", async () => {
      const mockData = { name: "Js" };
      const createdTag = { id: "1", ...mockData };
      const savedTag = { id: "1", name: "Js", createdAt: new Date() };

      mockTag.create.mockReturnValue(createdTag);
      mockTag.save.mockResolvedValue(savedTag);

      const result = await createTagService(mockData);

      expect(mockTag.create).toHaveBeenCalledWith(mockData);
      expect(mockTag.save).toHaveBeenCalledWith(createdTag);
      expect(result).toEqual(savedTag);
    });
  });

  describe("getTagByIdService", () => {
    it("should return tag when it exists", async () => {
      const mockTagData = { id: "1", name: "JavaScript" };
      mockTag.findOne.mockResolvedValue(mockTagData);

      const result = await getTagByIdService("1");

      expect(mockTag.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(result).toEqual(mockTagData);
    });

    it("should throw HttpError when tag not found", async () => {
      mockTag.findOne.mockResolvedValue(undefined);

      await expect(getTagByIdService("999")).rejects.toThrow(HttpError);
      await expect(getTagByIdService("999")).rejects.toThrow("Invalid Tag ID");

      expect(mockTag.findOne).toHaveBeenCalledWith({
        where: { id: "999" },
      });
    });
  });

  describe("getAllTagsService", () => {
    it("should return all tags in descending order of createdAt", async () => {
      const mockTags = [
        { id: "1", name: "JavaScript", createdAt: new Date("2025-01-01") },
        { id: "2", name: "TypeScript", createdAt: new Date("2025-02-01") },
      ];

      mockTag.find.mockResolvedValue(mockTags);

      const result = await getAllTagsService();

      expect(mockTag.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual(mockTags);
    });
  });

  describe("updateTagService", () => {
    it("should update tag name successfully", async () => {
      const mockTagData = { id: "1", name: "JS" };
      const dto = { name: "TypeScript" };

      jest
        .spyOn(tagService, "getTagByIdService")
        .mockResolvedValue(mockTagData as any);

      const savedTag = { ...mockTagData, name: dto.name };
      mockTag.save.mockResolvedValue(savedTag);

      const result = await updateTagService("1", dto);

      expect(tagService.getTagByIdService).toHaveBeenCalledWith("1");
      expect(mockTag.save).toHaveBeenCalledWith(mockTagData);
      expect(result).toEqual(savedTag);
    });
  });

  describe("deleteTagService", () => {
    it("should return true when tag is deleted", async () => {
      mockTag.delete.mockResolvedValue({ affected: 1 });

      const result = await deleteTagService("1");

      expect(mockTag.delete).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });

    it("should return false when tag does not exist", async () => {
      mockTag.delete.mockResolvedValue({ affected: 0 });

      const result = await deleteTagService("2");

      expect(mockTag.delete).toHaveBeenCalledWith("2");
      expect(result).toBe(false);
    });
  });
});

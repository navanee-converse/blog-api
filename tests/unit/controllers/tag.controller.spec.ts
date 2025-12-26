import { Request, Response } from "express";
import * as tagService from "../../../src/services/tag.service";
import {
  createTag,
  getTagById,
  getAllTags,
  updateTag,
  deleteTag,
} from "../../../src/controllers/tag.controller";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";

jest.mock("../../../src/services/tag.service");
jest.mock("../../../src/utils/response.util");

describe("Tag Controller", () => {
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

  describe("createTag", () => {
    it("should create tag and send response", async () => {
      const tag = { id: "1", name: "Tech" };
      req.body = { name: "Tech" };

      (tagService.createTagService as jest.Mock).mockResolvedValue(tag);

      await createTag(req as Request, res as Response);

      expect(tagService.createTagService).toHaveBeenCalledWith(req.body);
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tag,
        "Tag created successfully",
        201
      );
    });
  });

  describe("getTagById", () => {
    it("should return tag if found", async () => {
      const tag = { id: "1", name: "Tech" };
      req.params = { id: "1" };

      (tagService.getTagByIdService as jest.Mock).mockResolvedValue(tag);

      await getTagById(req as Request, res as Response);

      expect(tagService.getTagByIdService).toHaveBeenCalledWith("1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tag,
        "Tag fetched successfully"
      );
    });

    
  });

  describe("getAllTags", () => {
    it("should return all tags", async () => {
      const tags = [{ id: "1" }, { id: "2" }];

      (tagService.getAllTagsService as jest.Mock).mockResolvedValue(tags);

      await getAllTags(req as Request, res as Response);

      expect(tagService.getAllTagsService).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tags,
        "Tags fetched successfully"
      );
    });
  });

  describe("updateTag", () => {
    it("should update tag", async () => {
      const tag = { id: "1", name: "Updated" };
      req.params = { id: "1" };
      req.body = { name: "Updated" };

      (tagService.updateTagService as jest.Mock).mockResolvedValue(tag);

      await updateTag(req as Request, res as Response);

      expect(tagService.updateTagService).toHaveBeenCalledWith("1", req.body);
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tag,
        "Tag updated successfully"
      );
    });

    
  });

  describe("deleteTag", () => {
    it("should delete tag", async () => {
      req.params = { id: "1" };

      (tagService.deleteTagService as jest.Mock).mockResolvedValue(true);

      await deleteTag(req as Request, res as Response);

      expect(tagService.deleteTagService).toHaveBeenCalledWith("1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Tag deleted successfully"
      );
    });

    it("should throw 404 if tag not found", async () => {
      req.params = { id: "1" };

      (tagService.deleteTagService as jest.Mock).mockResolvedValue(false);

      await expect(deleteTag(req as Request, res as Response)).rejects.toThrow(
        new HttpError(404, "Tag not found")
      );
    });
  });
});

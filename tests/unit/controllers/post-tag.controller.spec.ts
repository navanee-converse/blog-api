import { Request, Response } from "express";
import * as postTagService from "../../../src/services/post-tag.service";
import {
  assignTagToPost,
  getTagsByPost,
  removeTagFromPost,
} from "../../../src/controllers/post-tag.controller";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";

jest.mock("../../../src/services/post-tag.service");
jest.mock("../../../src/utils/response.util");

describe("PostTag Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("assignTagToPost", () => {
    it("should assign tag to post and send response", async () => {
      const postTag = { id: "1", postId: "post-1", tagId: "tag-1" };
      req.body = { postId: "post-1", tagId: "tag-1" };

      (postTagService.assignTagToPostService as jest.Mock).mockResolvedValue(
        postTag
      );

      await assignTagToPost(req as Request, res as Response);

      expect(postTagService.assignTagToPostService).toHaveBeenCalledWith(
        req.body
      );
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        postTag,
        "Tag assigned to post successfully",
        201
      );
    });
  });

  describe("getTagsByPost", () => {
    it("should return tags for a post", async () => {
      const tags = [{ id: "1" }, { id: "2" }];
      req.query = { postId: "post-1" };

      (postTagService.getTagsByPostId as jest.Mock).mockResolvedValue(tags);

      await getTagsByPost(req as Request, res as Response);

      expect(postTagService.getTagsByPostId).toHaveBeenCalledWith("post-1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tags,
        "Tags fetched successfully"
      );
    });

    it("should allow undefined postId", async () => {
      const tags: any[] = [];
      req.query = {};

      (postTagService.getTagsByPostId as jest.Mock).mockResolvedValue(tags);

      await getTagsByPost(req as Request, res as Response);

      expect(postTagService.getTagsByPostId).toHaveBeenCalledWith(undefined);
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        tags,
        "Tags fetched successfully"
      );
    });
  });

  describe("removeTagFromPost", () => {
    it("should remove tag from post", async () => {
      req.params = { id: "1" };

      (postTagService.removeTagFromPostService as jest.Mock).mockResolvedValue(
        true
      );

      await removeTagFromPost(req as Request, res as Response);

      expect(postTagService.removeTagFromPostService).toHaveBeenCalledWith("1");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Tag removed from post successfully"
      );
    });

    it("should throw 404 if postTag not found", async () => {
      req.params = { id: "1" };

      (postTagService.removeTagFromPostService as jest.Mock).mockResolvedValue(
        false
      );

      await expect(
        removeTagFromPost(req as Request, res as Response)
      ).rejects.toThrow(new HttpError(404, "PostTag not found"));
    });
  });
});

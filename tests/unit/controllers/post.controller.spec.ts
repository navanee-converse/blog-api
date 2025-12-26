import { Request, Response } from "express";
import * as postService from "../../../src/services/post.service";
import * as responseUtil from "../../../src/utils/response.util";
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
} from "../../../src/controllers/post.controller";
import { HttpError } from "../../../src/utils/http-error";

jest.mock("../../../src/services/post.service");
jest.mock("../../../src/utils/response.util");

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res as Response;
};

describe("PostController", () => {
  let req: Partial<Request>;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
  });

  describe("createPost", () => {
    it("should create post and send response", async () => {
      const post = { id: "1" };

      req = {
        body: { title: "Post" },
        user: { id: "user-1" },
      } as unknown as Request;

      (postService.createPostService as jest.Mock).mockResolvedValue(post);

      await createPost(req as Request, res);

      expect(postService.createPostService).toHaveBeenCalledWith(
        req.body,
        (req as any).user
      );
      expect(responseUtil.sendResponse).toHaveBeenCalledWith(
        res,
        post,
        "Post created successfully",
        201
      );
    });
  });

  describe("getPostById", () => {
    it("should return post by id", async () => {
      const post = { id: "1" };

      req = { params: { id: "1" } };

      (postService.getPostByIdService as jest.Mock).mockResolvedValue(post);

      await getPostById(req as Request, res);

      expect(postService.getPostByIdService).toHaveBeenCalledWith("1");
      expect(responseUtil.sendResponse).toHaveBeenCalledWith(
        res,
        post,
        "Post fetched successfully"
      );
    });
  });

  describe("getAllPosts", () => {
    it("should return paginated posts", async () => {
      req = { query: { page: "1", limit: "10" } };

      const result = { posts: [], total: 0 };

      (postService.getAllPostsService as jest.Mock).mockResolvedValue(result);

      await getAllPosts(req as Request, res);

      expect(postService.getAllPostsService).toHaveBeenCalledWith(1, 10);
      expect(responseUtil.sendResponse).toHaveBeenCalledWith(
        res,
        result,
        "Posts fetched successfully"
      );
    });
  });

  describe("updatePost", () => {
    it("should update post successfully", async () => {
      const post = { id: "1" };

      req = {
        params: { id: "1" },
        body: { title: "Updated" },
        user: { id: "user-1" },
      } as unknown as Request;

      (postService.updatePostService as jest.Mock).mockResolvedValue(post);

      await updatePost(req as Request, res);

      expect(postService.updatePostService).toHaveBeenCalledWith(
        req.body,
        "1",
        (req as any).user
      );
      expect(responseUtil.sendResponse).toHaveBeenCalledWith(
        res,
        post,
        "Post updated successfully"
      );
    });
  });

  describe("deletePost", () => {
    it("should delete post successfully", async () => {
      req = { params: { id: "1" } };

      (postService.deletePostService as jest.Mock).mockResolvedValue(true);

      await deletePost(req as Request, res);

      expect(postService.deletePostService).toHaveBeenCalledWith("1");
      expect(responseUtil.sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Post deleted successfully"
      );
    });

    it("should throw error if post not found", async () => {
      req = { params: { id: "1" } };

      (postService.deletePostService as jest.Mock).mockResolvedValue(false);

      await expect(deletePost(req as Request, res)).rejects.toThrow(
        new HttpError(404, "Post not found")
      );
    });
  });
});

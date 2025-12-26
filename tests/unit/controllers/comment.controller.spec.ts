import { Request, Response } from "express";
import * as commentService from "../../../src/services/comment.service";
import {
  createComment,
  getCommentById,
  getComments,
  updateComment,
  deleteComment,
} from "../../../src/controllers/comment.controller";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { Role } from "../../../src/enums/role.enum";

jest.mock("../../../src/services/comment.service");
jest.mock("../../../src/utils/response.util");

describe("Comment Controller", () => {
  let req: Partial<Request> & { user?: TokenInterface };
  let res: Partial<Response>;
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: "user-1", role: Role.Admin, email: "test@gmail.com" },
    } as unknown as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("should create comment and send response", async () => {
      const comment = { id: "1", content: "Nice post" };
      req.body = { content: "Nice post" };

      (commentService.createCommentService as jest.Mock).mockResolvedValue(
        comment
      );

      await createComment(req as Request, res as Response);

      expect(commentService.createCommentService).toHaveBeenCalledWith(
        req.body,
        req.user
      );

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        comment,
        "Comment created successfully",
        201
      );
    });
  });

  describe("getCommentById", () => {
    it("should return comment if found", async () => {
      const comment = { id: "1", content: "Nice post" };
      req.params = { id: "1" };

      (commentService.getCommentByIdService as jest.Mock).mockResolvedValue(
        comment
      );

      await getCommentById(req as Request, res as Response);

      expect(commentService.getCommentByIdService).toHaveBeenCalledWith("1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        comment,
        "Comment fetched successfully"
      );
    });
  });

  describe("getComments", () => {
    it("should fetch comments by postId", async () => {
      const comments = [{ id: "1", content: "Nice" }];
      req.query = { postId: "post-1" };

      (commentService.getCommentsByPostId as jest.Mock).mockResolvedValue(
        comments
      );

      await getComments(req as Request, res as Response);

      expect(commentService.getCommentsByPostId).toHaveBeenCalledWith("post-1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        comments,
        "Comments fetched successfully"
      );
    });
  });

  describe("updateComment", () => {
    it("should update comment successfully", async () => {
      const comment = { id: "1", content: "Updated" };
      req.params = { id: "1" };
      req.body = { content: "Updated" };

      (commentService.updateCommentService as jest.Mock).mockResolvedValue(
        comment
      );

      await updateComment(req as Request, res as Response);

      expect(commentService.updateCommentService).toHaveBeenCalledWith(
        "1",
        req.body
      );

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        comment,
        "Comment updated successfully"
      );
    });
  });

  describe("deleteComment", () => {
    it("should throw 404 if comment not found", async () => {
      req.params = { id: "1" };

      (commentService.deleteCommentService as jest.Mock).mockResolvedValue(
        false
      );

      await expect(
        deleteComment(req as Request, res as Response)
      ).rejects.toThrow(new HttpError(404, "Comment not found"));
    });

    it("should delete comment successfully", async () => {
      req.params = { id: "1" };

      (commentService.deleteCommentService as jest.Mock).mockResolvedValue(
        true
      );

      await deleteComment(req as Request, res as Response);

      expect(commentService.deleteCommentService).toHaveBeenCalledWith("1");
      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Comment deleted successfully"
      );
    });
  });
});

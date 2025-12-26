import { Request, Response } from "express";
import {
  createComment,
  getCommentById,
  getComments,
  updateComment,
  deleteComment,
} from "../../../src/controllers/comment.controller";
import { AppDataSource } from "../../../src/database/data-source";
import { Comment } from "../../../src/models/comment.entity";
import { Post } from "../../../src/models/post.entity";
import { User } from "../../../src/models/user.entity";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { Role } from "../../../src/enums/role.enum";
import { Category } from "../../../src/models/category.entity";
import { randomUUID } from "crypto";
import "../../setup/setup";

jest.mock("../../../src/utils/response.util", () => ({
  sendResponse: jest.fn(),
}));

describe("Comment Controller Service Integration Test", () => {
  let req: Partial<Request> & { user?: TokenInterface };
  let res: Partial<Response>;
  let user: User;
  let post: Post;
  let category: Category;

  beforeEach(async () => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    await AppDataSource.getRepository(Comment)
      .createQueryBuilder()
      .delete()
      .execute();
    await AppDataSource.getRepository(Post)
      .createQueryBuilder()
      .delete()
      .execute();
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .delete()
      .execute();

    await AppDataSource.getRepository(Category)
      .createQueryBuilder()
      .delete()
      .execute();

    user = await AppDataSource.getRepository(User).save({
      name: "test user",
      email: "test@gmail.com",
      password: "hashed",
      role: Role.Admin,
    });

    category = await AppDataSource.getRepository(Category).save({
      name: "New Category",
      description: "Category description",
    });

    post = await AppDataSource.getRepository(Post).save({
      title: "test post",
      content: "post content",
      author: user,
      category,
    });
  });

  describe("Create Comment", () => {
    it("should create comment", async () => {
      req.body = {
        commentText: "Nice post",
        postId: post.id,
      };

      req.user = user as any;

      await createComment(req as Request, res as Response);

      const comments = await AppDataSource.getRepository(Comment).find();

      expect(comments.length).toBe(1);
      expect(comments[0].commentText).toBe("Nice post");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ commentText: "Nice post" }),
        "Comment created successfully",
        201
      );
    });

    it("should throw error when post id is invalid", async () => {
      req.body = {
        commentText: "Nice post",
        postId: randomUUID(),
      };

      req.user = user as any;

      await expect(
        createComment(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get Comment by comment id", () => {
    it("should get comment by id", async () => {
      const comment = await AppDataSource.getRepository(Comment).save({
        commentText: "hello",
        user,
        post,
      });

      req.params = { id: comment.id };

      await getCommentById(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ id: comment.id }),
        "Comment fetched successfully"
      );
    });

    it("should throw error when post id is invalid", async () => {
      await AppDataSource.getRepository(Comment).save({
        commentText: "hello",
        user,
        post,
      });

      req.params = { id: randomUUID() };

      await expect(
        getCommentById(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get Comment by post id", () => {
    it("should get comments by post id", async () => {
      await AppDataSource.getRepository(Comment).save([
        { commentText: "c1", user, post },
        { commentText: "c2", user, post },
      ]);

      req.query = { postId: post.id };

      await getComments(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.any(Array),
        "Comments fetched successfully"
      );
    });

    it("should throw error if postId missing", async () => {
      await expect(
        getComments(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Update Comment", () => {
    it("should update comment", async () => {
      const comment = await AppDataSource.getRepository(Comment).save({
        commentText: "old",
        user,
        post,
      });

      req.params = { id: comment.id };
      req.body = { commentText: "updated" };

      await updateComment(req as Request, res as Response);

      const updated = await AppDataSource.getRepository(Comment).findOneBy({
        id: comment.id,
      });

      expect(updated?.commentText).toBe("updated");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ commentText: "updated" }),
        "Comment updated successfully"
      );
    });
  });

  describe("Delete Comment", () => {
    it("should delete comment", async () => {
      const comment = await AppDataSource.getRepository(Comment).save({
        commentText: "delete me",
        user,
        post,
      });

      req.params = { id: comment.id };

      await deleteComment(req as Request, res as Response);

      const deleted = await AppDataSource.getRepository(Comment).findOneBy({
        id: comment.id,
      });

      expect(deleted).toBeNull();

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Comment deleted successfully"
      );
    });

    it("should throw error if comment not found on delete", async () => {
      req.params = { id: randomUUID() };

      await expect(
        deleteComment(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
});

import { Request, Response } from "express";
import {
  assignTagToPost,
  getTagsByPost,
  removeTagFromPost,
} from "../../../src/controllers/post-tag.controller";
import { sendResponse } from "../../../src/utils/response.util";
import { HttpError } from "../../../src/utils/http-error";
import { AppDataSource } from "../../../src/database/data-source";
import { Post } from "../../../src/models/post.entity";
import { Tag } from "../../../src/models/tag.entity";
import { PostTag } from "../../../src/models/post-tag.entity";
import { User } from "../../../src/models/user.entity";
import { Role } from "../../../src/enums/role.enum";
import { Category } from "../../../src/models/category.entity";
import { randomUUID } from "crypto";
import "../../setup/setup";

jest.mock("../../../src/utils/response.util", () => ({
  sendResponse: jest.fn(),
}));

describe("PostTag Controller Service Integration Test", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  let post: Post;
  let user: User;
  let tag: Tag;
  let category: Category;

  let postTag: PostTag;

  beforeEach(async () => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    await AppDataSource.getRepository(PostTag)
      .createQueryBuilder()
      .delete()
      .execute();
    await AppDataSource.getRepository(Post)
      .createQueryBuilder()
      .delete()
      .execute();
    await AppDataSource.getRepository(Tag)
      .createQueryBuilder()
      .delete()
      .execute();
    await AppDataSource.getRepository(Category)
      .createQueryBuilder()
      .delete()
      .execute();

    await AppDataSource.getRepository(User)
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
      title: "Test Post",
      content: "Post content",
      isPublished: true,
      author: user,
      category,
    });

    tag = await AppDataSource.getRepository(Tag).save({
      name: "nestjs",
    });
  });

  describe("Assign Post Tag", () => {
    it("should assign tag to post", async () => {
      req.body = {
        postId: post.id,
        tagId: tag.id,
      };

      await assignTagToPost(req as Request, res as Response);

      const saved = await AppDataSource.getRepository(PostTag).find({
        relations: { post: true, tag: true },
      });

      expect(saved.length).toBe(1);
      expect(saved[0].post.id).toBe(post.id);
      expect(saved[0].tag.id).toBe(tag.id);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          post: expect.objectContaining({ id: post.id }),
          tag: expect.objectContaining({ id: tag.id }),
        }),
        "Tag assigned to post successfully",
        201
      );
    });
  });

  describe("Get Post Tag", () => {
    it("should get tags by post id", async () => {
      postTag = await AppDataSource.getRepository(PostTag).save({
        post,
        tag,
      });

      req.query = { postId: post.id };

      await getTagsByPost(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.any(Array),
        "Tags fetched successfully"
      );
    });

    it("should return all tags when no post id was passed", async () => {
      postTag = await AppDataSource.getRepository(PostTag).save({
        post,
        tag,
      });

      await getTagsByPost(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.any(Array),
        "Tags fetched successfully"
      );
    });
  });

  describe("Remove Post Tag", () => {
    it("should remove tag from post", async () => {
      postTag = await AppDataSource.getRepository(PostTag).save({
        post,
        tag,
      });

      req.params = { id: postTag.id };

      await removeTagFromPost(req as Request, res as Response);

      const deleted = await AppDataSource.getRepository(PostTag).findOneBy({
        id: postTag.id,
      });

      expect(deleted).toBeNull();

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Tag removed from post successfully"
      );
    });

    it("should throw error if postTag not found", async () => {
      req.params = { id: randomUUID() };

      await expect(
        removeTagFromPost(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
});

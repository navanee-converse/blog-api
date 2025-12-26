import { Request, Response } from "express";
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
} from "../../../src/controllers/post.controller";
import { AppDataSource } from "../../../src/database/data-source";
import { Post } from "../../../src/models/post.entity";
import { User } from "../../../src/models/user.entity";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";
import { Role } from "../../../src/enums/role.enum";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { Category } from "../../../src/models/category.entity";
import { randomUUID } from "crypto";
import { Tag } from "../../../src/models/tag.entity";
import "../../setup/setup";


jest.mock("../../../src/utils/response.util", () => ({
  sendResponse: jest.fn(),
}));

describe("Post Controller Service Integration Test", () => {
  let req: Partial<Request> & { user?: TokenInterface };
  let res: Partial<Response>;
  let user: User;
  let category: Category;
  let tag: string[] = [];

  beforeAll(async () => {

    user = await AppDataSource.getRepository(User).save({
      name: "Test User",
      email: "test@gmail.com",
      password: "hashed-password",
      role: Role.Admin,
    });
    category = await AppDataSource.getRepository(Category).save({
      name: "New Category",
      description: "New category description",
    });
    const tags = await AppDataSource.getRepository(Tag).save([
      { name: "node" },
      { name: "nestjs" },
    ]);
    tag.push(tags[0].id);
  });


  beforeEach(async () => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    await AppDataSource.getRepository(Post)
      .createQueryBuilder()
      .delete()
      .execute();
  });

  describe("Create Post", () => {
    it("should create post", async () => {
      req.body = {
        title: "My Post",
        content: "Post content",
        authorId: user.id,
        categoryId: category.id,
        tagIds: tag,
      };
      req.user = { id: user.id, email: user.email, role: user.role };
      await createPost(req as Request, res as Response);

      const posts = await AppDataSource.getRepository(Post).find();

      expect(posts.length).toBe(1);
      expect(posts[0].title).toBe("My Post");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ title: "My Post" }),
        "Post created successfully",
        201
      );
    });

    it("should throw error if post with this name is already exist", async () => {
      await AppDataSource.getRepository(Post).save({
        title: "My Post",
        content: "Post content",
        author: user,
        category: category,
      });

      req.body = {
        title: "My Post",
        content: "Post content",
        authorId: user.id,
        categoryId: category.id,
      };
      req.user = { id: user.id, email: user.email, role: user.role };
      await expect(
        createPost(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get Post by Id", () => {
    it("should get post by id", async () => {
      const post = await AppDataSource.getRepository(Post).save({
        title: "Fetch Me",
        content: "content",
        author: user,
        category,
      });

      req.params = { id: post.id };

      await getPostById(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ id: post.id }),
        "Post fetched successfully"
      );
    });

    it("should throw error if post not found", async () => {
      req.params = { id: randomUUID() };

      await expect(
        getPostById(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get All Posts", () => {
    it("should get all posts with pagination", async () => {
      await AppDataSource.getRepository(Post).save([
        { title: "Post 1", content: "c1", author: user, category },
        { title: "Post 2", content: "c2", author: user, category },
      ]);

      req.query = { page: "1", limit: "10" };

      await getAllPosts(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          posts: expect.any(Array),
        }),
        "Posts fetched successfully"
      );
    });
  });

  describe("Update Post", () => {
    let post: Post;
    let newPost: Post;
    beforeEach(async () => {
      post = await AppDataSource.getRepository(Post).save({
        title: "Old Title",
        content: "Old",
        author: user,
        category,
      });

      newPost = await AppDataSource.getRepository(Post).save({
        title: "New Title",
        content: "New Post",
        author: user,
        category,
      });
    });
    it("should update post", async () => {
      req.params = { id: post.id };
      req.body = {
        title: "Updated Title",
        categoryId: category.id,
        tagIds: tag,
      };
      req.user = { id: user.id, email: user.email, role: user.role };

      await updatePost(req as Request, res as Response);

      const updated = await AppDataSource.getRepository(Post).findOneBy({
        id: post.id,
      });

      expect(updated?.title).toBe("Updated Title");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ title: "Updated Title" }),
        "Post updated successfully"
      );
    });

    it("should unauthorized error when user tru to update others posts", async () => {
      req.params = { id: post.id };
      req.body = { title: "Updated Title" };
      req.user = { id: randomUUID(), email: user.email, role: user.role };

      await expect(
        updatePost(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);

      await expect(updatePost(req as Request, res as Response)).rejects.toThrow(
        "Unauthorized to update others post"
      );
    });

    it("should throw error when try to update post with existing name ", async () => {
      req.params = { id: post.id };
      req.body = { title: "New Title" };
      req.user = { id: user.id, email: user.email, role: user.role };

      await expect(updatePost(req as Request, res as Response)).rejects.toThrow(
        "Post with this title is already exists"
      );
    });

    it("should throw error when category id is invalid", async () => {
      req.params = { id: post.id };
      req.body = { categoryId: randomUUID() };
      req.user = { id: user.id, email: user.email, role: user.role };

      await expect(updatePost(req as Request, res as Response)).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("Delete Post", () => {
    it("should delete post", async () => {
      const post = await AppDataSource.getRepository(Post).save({
        title: "Delete Me",
        content: "content",
        author: user,
        category,
      });

      req.params = { id: post.id };

      await deletePost(req as Request, res as Response);

      const deleted = await AppDataSource.getRepository(Post).findOneBy({
        id: post.id,
      });

      expect(deleted).toBeNull();

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Post deleted successfully"
      );
    });

    it("should throw error if delete fails", async () => {
      req.params = { id: randomUUID() };

      await expect(
        deletePost(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
});

import { AppDataSource } from "../../../src/database/data-source";
import { Category } from "../../../src/models/category.entity";
import { Tag } from "../../../src/models/tag.entity";
import {
  createPostService,
  getPostByIdService,
  getAllPostsService,
  updatePostService,
  deletePostService,
} from "../../../src/services/post.service";
import { HttpError } from "../../../src/utils/http-error";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { randomUUID } from "crypto";
import { Role } from "../../../src/enums/role.enum";
import { User } from "../../../src/models/user.entity";
import "../../setup/setup";

describe("Post Integration Tests", () => {
  let user: TokenInterface;
  let categoryId: string;
  let tagIds: string[] = [];
  let postId: string;
  let userEntity: User;

  beforeAll(async () => {
    const userRepo = AppDataSource.getRepository(User);
    userEntity = userRepo.create({
      email: "testuser@example.com",
      name: "Test User",
      password: "hashed-password",
      role: Role.Admin,
    });
    userEntity = await userRepo.save(userEntity);

    user = {
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role,
    } as TokenInterface;

    const categoryRepo = AppDataSource.getRepository(Category);
    const category = categoryRepo.create({ name: "Tech" });
    const savedCategory = await categoryRepo.save(category);
    categoryId = savedCategory.id;

    const tagRepo = AppDataSource.getRepository(Tag);
    const tag1 = tagRepo.create({ name: "Tag1" });
    const tag2 = tagRepo.create({ name: "Tag2" });
    const savedTags = await tagRepo.save([tag1, tag2]);
    tagIds = savedTags.map((t) => t.id);
  });

  describe("Create Post", () => {
    it("should create a new post with tags and category", async () => {
      const post = await createPostService(
        {
          title: "My First Post",
          content: "This is a test post",
          categoryId,
          tagIds,
          isPublished: true,
          authorId: "",
        },
        user
      );

      postId = post.id;

      expect(post).toHaveProperty("id");
      expect(post.title).toBe("My First Post");
      expect(post.category.id).toBe(categoryId);
      expect(post.author.id).toBe(user.id);
    });

    it("should throw error if post title already exists", async () => {
      await expect(
        createPostService(
          {
            title: "My First Post",
            content: "Duplicate post",
            categoryId,
            tagIds,
            authorId: "",
          },
          user
        )
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
  describe("Get Post by ID", () => {
    it("should get post by valid id", async () => {
      const post = await getPostByIdService(postId);
      expect(post.id).toBe(postId);
      expect(post.title).toBe("My First Post");
    });

    it("should throw error for invalid id", async () => {
      await expect(getPostByIdService(randomUUID())).rejects.toBeInstanceOf(
        HttpError
      );
    });
  });
  describe("Get All Posts", () => {
    it("should return all posts with pagination", async () => {
      const result = await getAllPostsService(1, 10);
      expect(result.posts.length).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
  describe("Update existing posts", () => {
    it("should update post title, content, and tags", async () => {
      const updated = await updatePostService(
        {
          title: "Updated Post",
          content: "Updated content",
          tagIds: tagIds.slice(0, 1),
        },
        postId,
        user
      );

      expect(updated.title).toBe("Updated Post");
      expect(updated.content).toBe("Updated content");
    });

    it("should throw unauthorized error for other user", async () => {
      const otherUser = {
        id: randomUUID(),
        email: "other@test.com",
        role: Role.Admin,
      } as TokenInterface;
      await expect(
        updatePostService({ title: "X" }, postId, otherUser)
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("should throw error if updating to duplicate title", async () => {
      const newPost = await createPostService(
        {
          title: "Second Post",
          content: "Another post",
          categoryId,
          tagIds,
          authorId: "",
        },
        user
      );

      await expect(
        updatePostService({ title: "Second Post" }, postId, user)
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("should throw error if category id is invalid", async () => {
      const newPost = await createPostService(
        {
          title: "New Post",
          content: "Another post",
          categoryId,
          tagIds,
          authorId: "",
        },
        user
      );

      await expect(
        updatePostService({ categoryId: randomUUID() }, postId, user)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
  describe("Delete Post", () => {
    it("should delete post successfully", async () => {
      const result = await deletePostService(postId);
      expect(result).toBe(true);
    });

    it("should return false when deleting non-existing post", async () => {
      const result = await deletePostService(postId);
      expect(result).toBe(false);
    });

    it("should throw error if id is not provided", async () => {
      await expect(deletePostService()).rejects.toBeInstanceOf(HttpError);
    });
  });
});

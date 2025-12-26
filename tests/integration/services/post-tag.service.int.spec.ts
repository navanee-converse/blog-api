import { AppDataSource } from "../../../src/database/data-source";
import {
  assignTagToPostService,
  getTagsByPostId,
  removeTagFromPostService,
} from "../../../src/services/post-tag.service";
import { User } from "../../../src/models/user.entity";
import { Post } from "../../../src/models/post.entity";
import { Tag } from "../../../src/models/tag.entity";
import { Category } from "../../../src/models/category.entity";
import { HttpError } from "../../../src/utils/http-error";
import { Role } from "../../../src/enums/role.enum";
import { randomUUID } from "crypto";
import "../../setup/setup";

describe("PostTag Integration Tests", () => {
  let postId: string;
  let tagId: string;
  let postTagId: string;

  beforeAll(async () => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.save(
      userRepo.create({
        email: "posttag@test.com",
        name: "PostTag User",
        password: "password",
        role: Role.Admin,
      })
    );

    const categoryRepo = AppDataSource.getRepository(Category);
    const category = await categoryRepo.save(
      categoryRepo.create({ name: "Tech" })
    );

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.save(
      postRepo.create({
        title: "Post With Tags",
        content: "Integration testing",
        author: user,
        category,
        isPublished: true,
      })
    );
    postId = post.id;

    const tagRepo = AppDataSource.getRepository(Tag);
    const tag = await tagRepo.save(tagRepo.create({ name: "Integration" }));
    tagId = tag.id;
  });

  describe("Assign Tag To Post", () => {
    it("should assign tag to post", async () => {
      const postTag = await assignTagToPostService({
        postId,
        tagId,
      });

      postTagId = postTag.id;

      expect(postTag).toHaveProperty("id");
      expect(postTag.post.id).toBe(postId);
      expect(postTag.tag.id).toBe(tagId);
    });
  });

  describe("Get Tags By Post ID", () => {
    it("should return tags for a post", async () => {
      const result = await getTagsByPostId(postId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].post.id).toBe(postId);
      expect(result[0].tag).toBeDefined();
    });

    it("should throw error for invalid post id", async () => {
      await expect(getTagsByPostId(randomUUID())).rejects.toBeInstanceOf(
        HttpError
      );
    });

    it("should return all post-tags when postId is not provided", async () => {
      const result = await getTagsByPostId();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Remove Tag From Post", () => {
    it("should remove tag from post", async () => {
      const result = await removeTagFromPostService(postTagId);
      expect(result).toBe(true);
    });

    it("should return false when removing non-existing postTag", async () => {
      const result = await removeTagFromPostService(postTagId);
      expect(result).toBe(false);
    });
  });
});

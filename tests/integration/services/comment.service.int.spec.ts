import { AppDataSource } from "../../../src/database/data-source";
import {
  createCommentService,
  getCommentByIdService,
  getCommentsByPostId,
  updateCommentService,
  deleteCommentService,
} from "../../../src/services/comment.service";
import { User } from "../../../src/models/user.entity";
import { Post } from "../../../src/models/post.entity";
import { Category } from "../../../src/models/category.entity";
import { HttpError } from "../../../src/utils/http-error";
import { Role } from "../../../src/enums/role.enum";
import { TokenInterface } from "../../../src/dtos/jwt-payload.dto";
import { randomUUID } from "crypto";
import "../../setup/setup";

describe("Comment Integration Tests", () => {
  let userPayload: TokenInterface;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.save(
      userRepo.create({
        email: "comment@test.com",
        name: "Comment User",
        password: "password",
        role: Role.Admin,
      })
    );

    userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    } as TokenInterface;

    const categoryRepo = AppDataSource.getRepository(Category);
    const category = await categoryRepo.save(
      categoryRepo.create({ name: "Tech" })
    );

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.save(
      postRepo.create({
        title: "Post for comments",
        content: "Post content",
        author: user,
        category,
        isPublished: true,
      })
    );

    postId = post.id;
  });

  describe("Create Comment", () => {
    it("should create a comment for a post", async () => {
      const comment = await createCommentService(
        {
          postId,
          commentText: "This is a test comment",
        },
        userPayload
      );

      commentId = comment.id;

      expect(comment).toHaveProperty("id");
      expect(comment.commentText).toBe("This is a test comment");
      expect(comment.post.id).toBe(postId);
      expect(comment.user.id).toBe(userPayload.id);
    });

    it("should throw error for invalid post id", async () => {
      await expect(
        createCommentService(
          {
            postId: randomUUID(),
            commentText: "Invalid post",
          },
          userPayload
        )
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get Comment By ID", () => {
    it("should get comment by valid id", async () => {
      const comment = await getCommentByIdService(commentId);

      expect(comment.id).toBe(commentId);
      expect(comment.commentText).toBeDefined();
      expect(comment.post).toBeDefined();
      expect(comment.user).toBeDefined();
    });

    it("should throw error for invalid comment id", async () => {
      await expect(getCommentByIdService(randomUUID())).rejects.toBeInstanceOf(
        HttpError
      );
    });
  });

  describe("Get Comments By Post ID", () => {
    it("should return comments for a post", async () => {
      const comments = await getCommentsByPostId(postId);

      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].post.id).toBe(postId);
    });

    it("should throw error for invalid post id", async () => {
      await expect(getCommentsByPostId(randomUUID())).rejects.toBeInstanceOf(
        HttpError
      );
    });
  });

  describe("Update Comment", () => {
    it("should update comment text", async () => {
      const updated = await updateCommentService(commentId, {
        commentText: "Updated comment text",
      });

      expect(updated.commentText).toBe("Updated comment text");
    });

    it("should throw error for invalid comment id", async () => {
      await expect(
        updateCommentService(randomUUID(), { commentText: "X" })
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Delete Comment", () => {
    it("should delete comment successfully", async () => {
      const result = await deleteCommentService(commentId);
      expect(result).toBe(true);
    });

    it("should return false when deleting non-existing comment", async () => {
      const result = await deleteCommentService(commentId);
      expect(result).toBe(false);
    });
  });
});

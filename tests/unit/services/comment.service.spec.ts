import { HttpError } from "../../../src/utils/http-error";
import {
  createCommentService,
  getCommentByIdService,
  getCommentsByPostId,
  updateCommentService,
  deleteCommentService,
} from "../../../src/services/comment.service";
import { Role } from "../../../src/enums/role.enum";
import * as dataSourceMock from "../../../src/database/data-source";

jest.mock("../../../src/database/data-source", () => {
  const mockCommentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockPostRepo = {
    findOne: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn((entity) => {
        if (entity.name === "Comment") return mockCommentRepo;
        if (entity.name === "Post") return mockPostRepo;
      }),
    },
    mockRepoComment: mockCommentRepo,
    mockRepoPost: mockPostRepo,
  };
});

const { mockRepoComment, mockRepoPost } = dataSourceMock as any;

describe("CommentService", () => {
  const user = { id: "user-1", email: "mock@gmail.com", role: Role.User };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCommentService", () => {
    it("should create a comment successfully", async () => {
      const dto = {
        postId: "post-1",
        commentText: "Nice post",
      };

      const createdComment = {
        commentText: dto.commentText,
        post: { id: dto.postId },
        user: { id: user.id },
      };

      const savedComment = {
        id: "comment-1",
        ...createdComment,
        createdAt: new Date(),
      };

      mockRepoPost.findOne.mockResolvedValue({ id: "post-1" });
      mockRepoComment.create.mockReturnValue(createdComment);
      mockRepoComment.save.mockResolvedValue(savedComment);

      const result = await createCommentService(dto, user);

      expect(mockRepoPost.findOne).toHaveBeenCalledWith({
        where: { id: dto.postId },
      });
      expect(mockRepoComment.create).toHaveBeenCalledWith(createdComment);
      expect(mockRepoComment.save).toHaveBeenCalledWith(createdComment);
      expect(result).toEqual(savedComment);
    });

    it("should throw error if post does not exist", async () => {
      mockRepoPost.findOne.mockResolvedValue(null);

      await expect(
        createCommentService({ postId: "invalid", commentText: "test" }, user)
      ).rejects.toThrow(HttpError);
    });
  });

  describe("getCommentByIdService", () => {
    it("should return comment if found", async () => {
      const comment = { id: "1", commentText: "Hello" };
      mockRepoComment.findOne.mockResolvedValue(comment);

      const result = await getCommentByIdService("1");

      expect(mockRepoComment.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["post", "user"],
      });
      expect(result).toEqual(comment);
    });

    it("should throw error if not found", async () => {
      mockRepoComment.findOne.mockResolvedValue(null);

      await expect(getCommentByIdService("1")).rejects.toThrow(HttpError);
    });
  });

  describe("getCommentsByPostId", () => {
    it("should return comments for a post", async () => {
      const comments = [{ id: "1" }, { id: "2" }];
      mockRepoComment.find.mockResolvedValue(comments);

      const result = await getCommentsByPostId("post-1");

      expect(mockRepoComment.find).toHaveBeenCalledWith({
        where: { post: { id: "post-1" } },
        relations: ["post", "user"],
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual(comments);
    });

    it("should throw error if post has no comments", async () => {
      mockRepoComment.find.mockResolvedValue([]);

      await expect(getCommentsByPostId("post-1")).rejects.toThrow(HttpError);
    });
  });

  describe("updateCommentService", () => {
    it("should update comment text", async () => {
      const existing = { id: "1", commentText: "Old" };
      mockRepoComment.findOne.mockResolvedValue(existing);
      mockRepoComment.save.mockResolvedValue({
        ...existing,
        commentText: "New",
      });

      const result = await updateCommentService("1", {
        commentText: "New",
      });

      expect(existing.commentText).toBe("New");
      expect(mockRepoComment.save).toHaveBeenCalledWith(existing);
      expect(result.commentText).toBe("New");
    });
  });

  describe("deleteCommentService", () => {
    it("should return true if deleted", async () => {
      mockRepoComment.delete.mockResolvedValue({ affected: 1 });

      const result = await deleteCommentService("1");

      expect(result).toBe(true);
    });

    it("should return false if not deleted", async () => {
      mockRepoComment.delete.mockResolvedValue({ affected: 0 });

      const result = await deleteCommentService("1");

      expect(result).toBe(false);
    });
  });
});

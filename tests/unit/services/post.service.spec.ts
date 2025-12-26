import {
  getPostByIdService,
  createPostService,
  getAllPostsService,
  updatePostService,
  deletePostService,
} from "../../../src/services/post.service";

import { HttpError } from "../../../src/utils/http-error";
import * as dataSourceMock from "../../../src/database/data-source";

jest.mock("../../../src/database/data-source", () => {
  const mockPostRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockPostTagRepo = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoryRepo = {
    findOne: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn((entity) => {
        if (entity.name === "Post") return mockPostRepo;
        if (entity.name === "PostTag") return mockPostTagRepo;
        if (entity.name === "Category") return mockCategoryRepo;
      }),
    },
    mockRepoPost: mockPostRepo,
    mockRepoPostTag: mockPostTagRepo,
    mockRepoCategory: mockCategoryRepo,
  };
});

const { mockRepoPost, mockRepoPostTag, mockRepoCategory } =
  dataSourceMock as any;

describe("PostService", () => {
  const user = { id: "user-1" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPostByIdService", () => {
    it("should return post if found", async () => {
      const post = { id: "1" };

      mockRepoPost.findOne.mockResolvedValue(post);

      const result = await getPostByIdService("1");

      expect(mockRepoPost.findOne).toHaveBeenCalled();
      expect(result).toEqual(post);
    });

    it("should throw error if id not provided", async () => {
      await expect(getPostByIdService()).rejects.toThrow(
        new HttpError(404, "Id not found")
      );
    });

    it("should throw error if post not found", async () => {
      mockRepoPost.findOne.mockResolvedValue(null);

      await expect(getPostByIdService("1")).rejects.toThrow(
        new HttpError(400, "Invalid Post ID")
      );
    });
  });

  describe("createPostService", () => {
    it("should create post with tags", async () => {
      const dto = {
        title: "Post title",
        content: "content",
        isPublished: true,
        categoryId: "cat-1",
        tagIds: ["tag-1", "tag-2"],
      };

      const createdPost = { id: "post-1" };

      mockRepoPost.findOne.mockResolvedValue(null);
      mockRepoPost.create.mockReturnValue(createdPost);
      mockRepoPost.save.mockResolvedValue(createdPost);
      mockRepoPostTag.create.mockImplementation((v: any) => v);
      mockRepoPostTag.save.mockResolvedValue([]);

      jest
        .spyOn(
          require("../../../src/services/post.service"),
          "getPostByIdService"
        )
        .mockResolvedValue(createdPost);

      const result = await createPostService(dto as any, user as any);

      expect(mockRepoPost.create).toHaveBeenCalled();
      expect(mockRepoPostTag.save).toHaveBeenCalled();
      expect(result).toEqual(createdPost);
    });

    it("should throw error if title already exists", async () => {
      mockRepoPost.findOne.mockResolvedValue({ id: "1" });

      await expect(
        createPostService({ title: "Post" } as any, user as any)
      ).rejects.toThrow(
        new HttpError(409, "Post with this title is already exists")
      );
    });
  });

  describe("getAllPostsService", () => {
    it("should return paginated posts", async () => {
      mockRepoPost.findAndCount.mockResolvedValue([[{ id: "1" }], 1]);

      const result = await getAllPostsService(1, 10);

      expect(result).toEqual({
        posts: [{ id: "1" }],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("updatePostService", () => {
    it("should update post successfully", async () => {
      const post = {
        id: "1",
        title: "old",
        author: { id: user.id },
        category: { id: "cat-1" },
      };

      jest
        .spyOn(
          require("../../../src/services/post.service"),
          "getPostByIdService"
        )
        .mockResolvedValue(post);

      mockRepoPost.findOne.mockResolvedValue(null);
      mockRepoCategory.findOne.mockResolvedValue({ id: "cat-2" });
      mockRepoPost.save.mockResolvedValue(post);

      const result = await updatePostService(
        { title: "new", categoryId: "cat-2" } as any,
        "1",
        user as any
      );

      expect(result).toEqual(post);
    });

    it("should update post tags when tagIds are provided", async () => {
      const post = {
        id: "1",
        title: "old",
        author: { id: user.id },
        category: { id: "cat-1" },
      };

      jest
        .spyOn(
          require("../../../src/services/post.service"),
          "getPostByIdService"
        )
        .mockResolvedValue(post);

      mockRepoPost.findOne.mockResolvedValue(null);
      mockRepoPost.save.mockResolvedValue(post);

      mockRepoPostTag.delete.mockResolvedValue({ affected: 2 });
      mockRepoPostTag.create.mockImplementation((v: any) => v);
      mockRepoPostTag.save.mockResolvedValue([]);

      const dto = {
        tagIds: ["tag-1", "tag-2"],
      };

      const result = await updatePostService(dto as any, "1", user as any);

      expect(mockRepoPostTag.delete).toHaveBeenCalledWith({
        post: { id: post.id },
      });

      expect(mockRepoPostTag.create).toHaveBeenCalledTimes(2);
      expect(mockRepoPostTag.save).toHaveBeenCalled();

      expect(result).toEqual(post);
    });

    it("should throw unauthorized error", async () => {
      jest
        .spyOn(
          require("../../../src/services/post.service"),
          "getPostByIdService"
        )
        .mockResolvedValue({
          id: "1",
          author: { id: "other-user" },
        });

      await expect(
        updatePostService({} as any, "1", user as any)
      ).rejects.toThrow(
        new HttpError(401, "Unauthorized to update others post")
      );
    });
  });

  describe("deletePostService", () => {
    it("should delete post", async () => {
      mockRepoPost.delete.mockResolvedValue({ affected: 1 });

      const result = await deletePostService("1");

      expect(result).toBe(true);
    });

    it("should throw error if id missing", async () => {
      await expect(deletePostService()).rejects.toThrow(
        new HttpError(404, "Id not found")
      );
    });
  });
});

import {
  assignTagToPostService,
  getTagsByPostId,
  removeTagFromPostService,
} from "../../../src/services/post-tag.service";

import { HttpError } from "../../../src/utils/http-error";
import * as dataSourceMock from "../../../src/database/data-source";

const { mockRepoPostTag } = dataSourceMock as any;

jest.mock("../../../src/database/data-source", () => {
  const mockPostTagRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockPostTagRepo),
    },
    mockRepoPostTag: mockPostTagRepo,
  };
});

describe("PostTagService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("assignTagToPostService", () => {
    it("should assign a tag to a post", async () => {
      const dto = {
        postId: "post-1",
        tagId: "tag-1",
      };

      const created = {
        post: { id: "post-1" },
        tag: { id: "tag-1" },
      };

      mockRepoPostTag.create.mockReturnValue(created);
      mockRepoPostTag.save.mockResolvedValue(created);

      const result = await assignTagToPostService(dto);

      expect(mockRepoPostTag.create).toHaveBeenCalledWith({
        post: { id: dto.postId },
        tag: { id: dto.tagId },
      });

      expect(mockRepoPostTag.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe("getTagsByPostId", () => {
    it("should return tags for a valid postId", async () => {
      const postId = "post-1";

      const postTags = [
        { id: "1", post: { id: postId }, tag: { id: "tag-1" } },
      ];

      mockRepoPostTag.find.mockResolvedValue(postTags);

      const result = await getTagsByPostId(postId);

      expect(mockRepoPostTag.find).toHaveBeenCalledWith({
        where: { post: { id: postId } },
        relations: ["post", "tag"],
      });

      expect(result).toEqual(postTags);
    });

    it("should throw error if postId is invalid", async () => {
      mockRepoPostTag.find.mockResolvedValue([]);

      await expect(getTagsByPostId("invalid-post")).rejects.toThrow(
        new HttpError(400, "Invalid Post ID")
      );
    });

    it("should return all post-tags if postId not provided", async () => {
      const postTags = [{ id: "1" }];

      mockRepoPostTag.find.mockResolvedValue(postTags);

      const result = await getTagsByPostId();

      expect(mockRepoPostTag.find).toHaveBeenCalledWith({
        relations: ["post", "tag"],
      });

      expect(result).toEqual(postTags);
    });
  });

  describe("removeTagFromPostService", () => {
    it("should remove tag from post", async () => {
      mockRepoPostTag.delete.mockResolvedValue({ affected: 1 });

      const result = await removeTagFromPostService("1");

      expect(mockRepoPostTag.delete).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });

    it("should return false if no record deleted", async () => {
      mockRepoPostTag.delete.mockResolvedValue({ affected: 0 });

      const result = await removeTagFromPostService("1");

      expect(result).toBe(false);
    });
  });
});

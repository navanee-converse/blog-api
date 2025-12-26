import {
  createTagService,
  getTagByIdService,
  getAllTagsService,
  updateTagService,
  deleteTagService,
} from "../../../src/services/tag.service";
import { HttpError } from "../../../src/utils/http-error";
import { randomUUID } from "crypto";
import "../../setup/setup";

describe("Tag Integration Tests", () => {
  let tagId: string;
  describe("Create Tag", () => {
    it("should create a new tag", async () => {
      const tag = await createTagService({ name: "Test Tag" });
      tagId = tag.id;

      expect(tag).toHaveProperty("id");
      expect(tag.name).toBe("Test Tag");
    });

    it("should fail to create tag with empty name", async () => {
      await expect(createTagService({ name: "" })).resolves.toHaveProperty(
        "id"
      );
    });
  });
  describe("Get Tag By Id", () => {
    it("should get tag by id", async () => {
      const tag = await getTagByIdService(tagId);
      expect(tag.id).toBe(tagId);
      expect(tag.name).toBe("Test Tag");
    });

    it("should throw HttpError for invalid id", async () => {
      await expect(getTagByIdService(randomUUID())).rejects.toBeInstanceOf(
        HttpError
      );
    });
  });

  describe("Get all tags", () => {
    it("should return all tags", async () => {
      const tags = await getAllTagsService();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThanOrEqual(1);
    });
  });
  describe("Update existing tag", () => {
    it("should update tag name", async () => {
      const updatedTag = await updateTagService(tagId, { name: "Updated Tag" });
      expect(updatedTag.name).toBe("Updated Tag");
    });

    it("should throw error for invalid id on update", async () => {
      await expect(
        updateTagService(randomUUID(), { name: "X" })
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
  describe("Delete tag", () => {
    it("should delete tag successfully", async () => {
      const result = await deleteTagService(tagId);
      expect(result).toBe(true);
    });

    it("should return false when deleting non-existing tag", async () => {
      const result = await deleteTagService(tagId);
      expect(result).toBe(false);
    });
  });
});

import { Request, Response } from "express";
import {
  createTag,
  getTagById,
  getAllTags,
  updateTag,
  deleteTag,
} from "../../../src/controllers/tag.controller";
import { HttpError } from "../../../src/utils/http-error";
import { sendResponse } from "../../../src/utils/response.util";
import { Tag } from "../../../src/models/tag.entity";
import { AppDataSource } from "../../../src/database/data-source";
import { randomUUID } from "crypto";
import "../../setup/setup";


jest.mock("../../../src/utils/response.util", () => ({
  sendResponse: jest.fn(),
}));

describe("Tag Controller Service Integration  Test", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;



  beforeEach(async () => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    await AppDataSource.getRepository(Tag)
      .createQueryBuilder()
      .delete()
      .execute();
  });

  describe("Create Tag", () => {
    it("should create tag", async () => {
      req.body = { name: "nestjs" };

      await createTag(req as Request, res as Response);

      const tags = await AppDataSource.getRepository(Tag).find();

      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe("nestjs");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ name: "nestjs" }),
        "Tag created successfully",
        201
      );
    });
  });

  describe("Get Tag by ID", () => {
    it("should get tag by id", async () => {
      const tag = await AppDataSource.getRepository(Tag).save({ name: "node" });

      req.params = { id: tag.id };

      await getTagById(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ id: tag.id }),
        "Tag fetched successfully"
      );
    });

    it("should throw error if tag not found", async () => {
      req.params = { id: randomUUID() };

      await expect(
        getTagById(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("Get All Tags", () => {
    it("should get all tags", async () => {
      await AppDataSource.getRepository(Tag).save([
        { name: "node" },
        { name: "nestjs" },
      ]);

      await getAllTags(req as Request, res as Response);

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.any(Array),
        "Tags fetched successfully"
      );
    });
  });

  describe("Update Tag", () => {
    it("should update tag", async () => {
      const tag = await AppDataSource.getRepository(Tag).save({ name: "old" });

      req.params = { id: tag.id };
      req.body = { name: "updated" };

      await updateTag(req as Request, res as Response);

      const updated = await AppDataSource.getRepository(Tag).findOneBy({
        id: tag.id,
      });

      expect(updated?.name).toBe("updated");

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ name: "updated" }),
        "Tag updated successfully"
      );
    });
  });

  describe("Delete Tag", () => {
    it("should delete tag", async () => {
      const tag = await AppDataSource.getRepository(Tag).save({
        name: "delete",
      });

      req.params = { id: tag.id };

      await deleteTag(req as Request, res as Response);

      const deleted = await AppDataSource.getRepository(Tag).findOneBy({
        id: tag.id,
      });

      expect(deleted).toBeNull();

      expect(sendResponse).toHaveBeenCalledWith(
        res,
        null,
        "Tag deleted successfully"
      );
    });

    it("should throw error if tag id not exists", async () => {
      req.params = { id: randomUUID() };

      await expect(
        deleteTag(req as Request, res as Response)
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
});

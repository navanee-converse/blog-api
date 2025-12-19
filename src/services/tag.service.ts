import { Tag } from "../models/tag.entity";
import { CreateTagDTO, UpdateTagDTO } from "../dtos/tag.dto";
import { AppDataSource } from "../database/data-source";
import { HttpError } from "../utils/http-error";

const dataSource = AppDataSource;
const tagRepo = dataSource.getRepository(Tag);

export const createTagService = async (dto: CreateTagDTO) => {
  const tag = tagRepo.create(dto);
  return tagRepo.save(tag);
};

export const getTagByIdService = async (id: string) => {
  const tag = await tagRepo.findOne({ where: { id } });
  if (!tag) throw new HttpError(400, "Invalid Tag ID");
  return tag;
};

export const getAllTagsService = async () => {
  return tagRepo.find({ order: { createdAt: "DESC" } });
};

export const updateTagService = async (id: string, dto: UpdateTagDTO) => {
  const tag = await getTagByIdService(id);

  if (dto.name !== undefined) tag.name = dto.name;

  return tagRepo.save(tag);
};

export const deleteTagService = async (id: string) => {
  const result = await tagRepo.delete(id);
  return result.affected! > 0;
};

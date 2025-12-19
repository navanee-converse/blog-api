import { Category } from "../models/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";
import { AppDataSource } from "../database/data-source";
import { HttpError } from "../utils/http-error";

const dataSource = AppDataSource;
const categoryRepo = dataSource.getRepository(Category);

export const createCategoryService = async (dto: CreateCategoryDTO) => {
  const category = categoryRepo.create(dto);
  return categoryRepo.save(category);
};

export const getCategoryByIdService = async (id: string) => {
  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) throw new HttpError(404, "Category not found");
  return category;
};

export const getAllCategoriesService = async () => {
  return categoryRepo.find({ order: { createdAt: "DESC" } });
};

export const updateCategoryService = async (
  id: string,
  dto: UpdateCategoryDTO
) => {
  const category = await getCategoryByIdService(id);

  if (dto.name !== undefined) category.name = dto.name;
  if (dto.description !== undefined) category.description = dto.description;

  return categoryRepo.save(category);
};

export const deleteCategoryService = async (id: string) => {
  const result = await categoryRepo.delete(id);
  return result.affected! > 0;
};

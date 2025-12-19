import { Post } from "../models/post.entity";
import { PostTag } from "../models/post-tag.entity";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/post.dto";
import { AppDataSource } from "../database/data-source";
import { HttpError } from "../utils/http-error";
import { TokenInterface } from "../dtos/jwt-payload.dto";
import { Not } from "typeorm";
import { Category } from "../models/category.entity";

const dataSource = AppDataSource;
const postRepo = dataSource.getRepository(Post);
const postTagRepo = dataSource.getRepository(PostTag);
const categoryRepo = dataSource.getRepository(Category);

export const getPostByIdService = async (id?: string) => {
  if (!id) throw new HttpError(404, "Id not found");
  const post = await postRepo.findOne({
    where: { id },
    relations: [
      "author",
      "category",
      "comments",
      "comments.user",
      "comments.post",
    ],
  });
  if (!post) throw new HttpError(400, "Invalid Post ID");
  return post;
};

export const createPostService = async (
  dto: CreatePostDTO,
  user: TokenInterface
) => {
  const postExist = await postRepo.findOne({ where: { title: dto.title } });
  if (postExist)
    throw new HttpError(409, "Post with this title is already exists");
  const post = postRepo.create({
    title: dto.title,
    content: dto.content,
    isPublished: dto.isPublished ?? false,
    author: { id: user.id },
    category: { id: dto.categoryId },
  });
  const savedPost = await postRepo.save(post);

  // Handle tags
  if (dto.tagIds && dto.tagIds.length > 0) {
    const postTags = dto.tagIds.map((tagId) =>
      postTagRepo.create({ post: savedPost, tag: { id: tagId } })
    );
    await postTagRepo.save(postTags);
  }

  return getPostByIdService(savedPost.id); // return full post with relations
};

export const getAllPostsService = async (page = 1, limit = 10) => {
  const [posts, total] = await postRepo.findAndCount({
    relations: ["author", "category", "comments", "comments.user"],
    take: limit,
    skip: (page - 1) * limit,
    order: { createdAt: "DESC" },
  });
  return { posts, total, page, limit };
};

export const updatePostService = async (
  dto: UpdatePostDTO,
  id: string,
  user: TokenInterface
) => {
  const post = await getPostByIdService(id);
  if (post.author.id !== user.id)
    throw new HttpError(401, "Unauthorized to update others post");
  if (dto.title) {
    const postTitle = await postRepo.findOne({
      where: { title: dto.title, id: Not(post.id) },
    });
    if (postTitle)
      throw new HttpError(409, "Post with this title is already exists");
    post.title = dto.title;
  }
  if (dto.content !== undefined) post.content = dto.content;
  if (dto.isPublished !== undefined) post.isPublished = dto.isPublished;
  if (dto.categoryId) {
    const categoryExists = await categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!categoryExists) throw new HttpError(404, "Category not found");
    post.category.id = dto.categoryId;
  }

  const updated = await postRepo.save(post);

  // Update tags
  if (dto.tagIds) {
    await postTagRepo.delete({ post: { id: post.id } });
    const postTags = dto.tagIds.map((tagId) =>
      postTagRepo.create({ post, tag: { id: tagId } })
    );
    await postTagRepo.save(postTags);
  }

  return getPostByIdService(updated.id);
};

export const deletePostService = async (id?: string) => {
  if (!id) throw new HttpError(404, "Id not found");
  const result = await postRepo.delete(id);
  return result.affected! > 0;
};

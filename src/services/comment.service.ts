import { Comment } from "../models/comment.entity";
import { CreateCommentDTO, UpdateCommentDTO } from "../dtos/comment.dto";
import { AppDataSource } from "../database/data-source";
import { HttpError } from "../utils/http-error";
import { TokenInterface } from "../dtos/jwt-payload.dto";
import { Post } from "../models/post.entity";

const dataSource = AppDataSource;
const commentRepo = dataSource.getRepository(Comment);
const postRepo = dataSource.getRepository(Post);

export const createCommentService = async (
  dto: CreateCommentDTO,
  user: TokenInterface
) => {
  const postExist = await postRepo.findOne({ where: { id: dto.postId } });
  if (!postExist) throw new HttpError(404, "Invalid Post Id ");
  const comment = commentRepo.create({
    commentText: dto.commentText,
    post: { id: dto.postId },
    user: { id: user.id },
  });
  return commentRepo.save(comment);
};

export const getCommentByIdService = async (id: string) => {
  const comment = await commentRepo.findOne({
    where: { id },
    relations: ["post", "user"],
  });
  if (!comment) throw new HttpError(404, "Comments not found");
  return comment;
};

export const getCommentsByPostId = async (postId: string) => {
  const comment = await commentRepo.find({
    where: { post: { id: postId } },
    relations: ["post", "user"],
    order: { createdAt: "DESC" },
  });

  if (comment.length === 0) throw new HttpError(400, "Invalid Post ID");
  return comment;
};

export const updateCommentService = async (
  id: string,
  dto: UpdateCommentDTO
) => {
  const comment = await getCommentByIdService(id);
  if (!comment) throw new HttpError(404, "Comments not found");

  if (dto.commentText !== undefined) comment.commentText = dto.commentText;

  return commentRepo.save(comment);
};

export const deleteCommentService = async (id: string) => {
  const result = await commentRepo.delete(id);
  return result.affected! > 0;
};

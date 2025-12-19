import { PostTag } from "../models/post-tag.entity";
import { CreatePostTagDTO } from "../dtos/post-tag.dto";
import { AppDataSource } from "../database/data-source";
import { HttpError } from "../utils/http-error";

const dataSource = AppDataSource;
const postTagRepo = dataSource.getRepository(PostTag);

export const assignTagToPostService = async (dto: CreatePostTagDTO) => {
  const postTag = postTagRepo.create({
    post: { id: dto.postId },
    tag: { id: dto.tagId },
  });
  return postTagRepo.save(postTag);
};

export const getTagsByPostId = async (postId?: string) => {
  if (postId) {
    const post = await postTagRepo.find({
      where: { post: { id: postId } },
      relations: ["post", "tag"],
    });
    if (post.length === 0) throw new HttpError(400, "Invalid Post ID");
    return post;
  } else {
    return postTagRepo.find({ relations: ["post", "tag"] });
  }
};

export const removeTagFromPostService = async (id: string) => {
  const result = await postTagRepo.delete(id);
  return result.affected! > 0;
};

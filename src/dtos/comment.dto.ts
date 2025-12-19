export interface CreateCommentDTO {
  commentText: string;
  postId: string; // UUID of post
  userId: string; // UUID of user
}

export interface UpdateCommentDTO {
  commentText?: string;
}

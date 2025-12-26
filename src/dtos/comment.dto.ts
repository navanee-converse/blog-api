export interface CreateCommentDTO {
  commentText: string;
  postId: string;
}

export interface UpdateCommentDTO {
  commentText?: string;
}

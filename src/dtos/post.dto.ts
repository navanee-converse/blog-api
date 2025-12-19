export interface CreatePostDTO {
  title: string;
  content: string;
  isPublished?: boolean;
  authorId: string;
  categoryId: string;
  tagIds?: string[];
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  isPublished?: boolean;
  categoryId?: string;
  tagIds?: string[];
}

import { DataSource } from "typeorm";
import { User } from "../models/user.entity";
import { Post } from "../models/post.entity";
import { Tag } from "../models/tag.entity";
import { PostTag } from "../models/post-tag.entity";
import { Category } from "../models/category.entity";
import { Comment } from "../models/comment.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "blog",
  synchronize: true,
  logging: false,
  entities: [User, Post, Comment, Category, Tag, PostTag],
  migrations: [],
  subscribers: [],
});

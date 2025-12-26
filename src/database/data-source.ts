import { DataSource } from "typeorm";
import { User } from "../models/user.entity";
import { Post } from "../models/post.entity";
import { Tag } from "../models/tag.entity";
import { PostTag } from "../models/post-tag.entity";
import { Category } from "../models/category.entity";
import { Comment } from "../models/comment.entity";
import dotenv from "dotenv";

dotenv.config();
const isTestMode = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!.toString(),
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER!.toString(),
  password: process.env.DB_PASS!.toString(),
  database: isTestMode
    ? process.env.DB_TEST_NAME!.toString()
    : process.env.DB_DEV_NAME!.toString(),
  synchronize: true,
  logging: false,
  entities: [User, Post, Comment, Category, Tag, PostTag],
  migrations: [],
  subscribers: [],
  dropSchema: isTestMode,
});

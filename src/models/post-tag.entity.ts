import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from "typeorm";

import { Post } from "./post.entity";
import { Tag } from "./tag.entity";

@Entity({ name: "post_tags" })
@Unique(["post", "tag"])
export class PostTag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Post, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "post_id" })
  post!: Post;

  @ManyToOne(() => Tag, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "tag_id" })
  tag!: Tag;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Relation,
} from "typeorm";

import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", name: "comment_text" })
  commentText!: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "post_id" })
  post!: Relation<Post>;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt!: Date;
}

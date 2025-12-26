import request from "supertest";
import "../setup/setup";
import app from "../../src/main";
import { Role } from "../../src/enums/role.enum";
import { randomUUID } from "crypto";

describe("Comment E2E", () => {
  let token: string;
  let postId: string;
  let authorId: string;
  let categoryId: string;
  let tagId: string[] = [];
  let commentId: string;

  beforeAll(async () => {
    await request(app).post("/user").send({
      name: "PostUser",
      email: "newuser@gmail.com",
      password: "myPassword",
      role: Role.Admin,
    });

    const loginRes = await request(app)
      .post("/user/login")
      .send({ email: "newuser@gmail.com", password: "myPassword" });

    token = loginRes.body.data.token;
    authorId = loginRes.body.data.id;

    const categoryRes = await request(app)
      .post("/categories")
      .set("authorization", `Bearer ${token}`)
      .send({
        name: "engineering",
        description: "This name is used to categories engineering based blogs",
      });
    categoryId = categoryRes.body.data.id;

    const tagResponse = await request(app)
      .post("/tags")
      .set("authorization", `Bearer ${token}`)
      .send({ name: "React" });
    tagId.push(tagResponse.body.data.id);

    const postRes = await request(app)
      .post("/posts")
      .set("authorization", `Bearer ${token}`)
      .send({
        title: "New Post",
        content: "This is my new post",
        authorId,
        categoryId,
        tagId,
      });

    postId = postRes.body.data.id;
  });

  describe("Create Comment", () => {
    it("should create a comment", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          postId,
          commentText: "Nice post!",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Comment created successfully");
      expect(res.body.data).toHaveProperty("id");

      commentId = res.body.data.id;
    });

    it("should through error on invalid post id", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          postId: randomUUID(),
          commentText: "Nice post!",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invalid Post Id ");
    });
  });

  describe("Get Comments by Id", () => {
    it("should get comment by id", async () => {
      const res = await request(app)
        .get(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(commentId);
    });
  });
  describe("Get Comments by postId", () => {
    it("should get comments by postId", async () => {
      const res = await request(app)
        .get(`/comments?postId=${postId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Update Comment", () => {
    it("should update comment", async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          commentText: "Updated comment",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.commentText).toBe("Updated comment");
    });

    it("should return 404 when updating non-existing comment", async () => {
      const res = await request(app)
        .put("/comments/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .send({ commentText: "test" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Comments not found");
    });
  });

  describe("Delete Comment", () => {
    it("should delete comment", async () => {
      const res = await request(app)
        .delete(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Comment deleted successfully");
    });

    it("should return 404 when deleting already deleted comment", async () => {
      const res = await request(app)
        .delete(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Comment not found");
    });
  });
});

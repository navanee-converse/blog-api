import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8000";

export const options = {
  vus: 10,
  duration: "1m",
};

export function setup() {
  // Login as Admin or test user
  const loginRes = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({
      email: "john@example.com",
      password: "password123",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(loginRes, { "login success": (res) => res.status === 200 });

  const token = loginRes.json("data.token");

  //Create Category
  const categoryRes = http.post(
    `${BASE_URL}/categories`,
    JSON.stringify({
      name: `Perf-Category-${Date.now()}`,
      description: "Used for performance testing",
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(categoryRes, {
    "category created": (res) => res.status === 201,
  });

  const categoryId = categoryRes.json("data.id");

  // Create a post for comments
  const postRes = http.post(
    `${BASE_URL}/posts`,
    JSON.stringify({
      title: `Perf Post ${Date.now()}`,
      content: "Post for performance testing comments",
      isPublished: true,
      categoryId,
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(postRes, { "post created": (res) => res.status === 201 });
  const postId = postRes.json("data.id");

  return { token, postId };
}

export default function (data: { token: string; postId: string }) {
  const { token, postId } = data;

  // Create Comment
  const commentPayload = JSON.stringify({
    commentText: `Perf Comment ${Date.now()}`,
    postId,
  });

  const createRes = http.post(`${BASE_URL}/comments`, commentPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(createRes, {
    "comment created": (res) => res.status === 201,
  });

  const commentId = createRes.json("data.id");
  sleep(1);

  // Get all comments
  const getRes = http.get(`${BASE_URL}/comments?postId=${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getRes, {
    "get comments status 200": (res) => res.status === 200,
    "comments array returned": (res) => {
      const data = res.json("data");
      return Array.isArray(data);
    },
  });

  sleep(1);

  // Get comment by ID
  const getByIdRes = http.get(`${BASE_URL}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getByIdRes, {
    "get comment by id status 200": (res) => res.status === 200,
    "comment object returned": (res) => {
      const data = res.json("data");
      return data !== null && typeof data === "object" && !Array.isArray(data);
    },
  });

  sleep(1);

  // Update comment
  const updatePayload = JSON.stringify({
    commentText: `Updated Perf Comment ${Date.now()}`,
  });

  const updateRes = http.put(
    `${BASE_URL}/comments/${commentId}`,
    updatePayload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(updateRes, {
    "update comment status 200": (res) => res.status === 200,
  });

  sleep(1);

  // Delete comment
  const deleteRes = http.del(`${BASE_URL}/comments/${commentId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(deleteRes, {
    "delete comment status 200 or 404": (res) =>
      res.status === 200 || res.status === 404,
  });

  sleep(1);
}

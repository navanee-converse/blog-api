import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8000";

export const options = {
  vus: 10,
  duration: "1m",
};

export function setup() {
  // Login as Admin
  const loginRes = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({
      email: "john@example.com",
      password: "password123",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  const token = loginRes.json("data.token");

  // Create Category (ONCE)
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

  // Return data to all VUs
  return {
    token,
    categoryId,
  };
}

export default function (data: { token: string; categoryId: string }) {
  const { token, categoryId } = data;

  const postPayload = JSON.stringify({
    title: `Perf Post ${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    content: "Post created using shared category",
    isPublished: true,
    categoryId,
  });

  const res = http.post(`${BASE_URL}/posts`, postPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(res, {
    "post created status is 201": (res) => res.status === 201,
  });
  const postId = res.json("data.id");

  sleep(1);

  const postGetRes = http.get(`${BASE_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(postGetRes, {
    "post get status is 200": (res) => res.status === 200,
    "get post return array of object": (res) => {
      const data = res.json("data.posts");
      return data !== null && Array.isArray(data);
    },
  });

  sleep(1);

  const getPostByIdRes = http.get(`${BASE_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(getPostByIdRes, {
    "post get by id status is 200": (res) => res.status === 200,
    "get post by id return object ": (res) => {
      const data = res.json("data");
      return data !== null && !Array.isArray(data) && typeof data === "object";
    },
  });

  sleep(1);

  const updatePayload = JSON.stringify({
    content: `Perf Post ${Date.now()}`,
  });
  const updatePostRes = http.put(`${BASE_URL}/posts/${postId}`, updatePayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(updatePostRes, {
    "post update status is 200": (res) => res.status === 200,
    "post object return object ": (res) => {
      const data = res.json("data");
      return data !== null && !Array.isArray(data) && typeof data === "object";
    },
  });

  sleep(1);

  const deletePostRes = http.del(`${BASE_URL}/posts/${postId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(deletePostRes, {
    "delete post status is": (res) => res.status === 200 || res.status === 404,
  });

  sleep(1);
}

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

  check(loginRes, { "login success": (res) => res.status === 200 });

  const token = loginRes.json("data.token");

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

  // Create a Post (ONCE)
  const postRes = http.post(
    `${BASE_URL}/posts`,
    JSON.stringify({
      title: `Perf Post ${Date.now()}`,
      content: "Post used for performance testing",
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

  // Create a Tag
  const tagRes = http.post(
    `${BASE_URL}/tags`,
    JSON.stringify({
      name: `Perf Tag ${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(tagRes, { "tag created": (res) => res.status === 201 });
  const tagId = tagRes.json("data.id");

  //Assign tag to post
  const assignRes = http.post(
    `${BASE_URL}/post-tags`,
    JSON.stringify({ postId, tagId }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(assignRes, {
    "tag assigned status is 200": (res) => res.status === 201,
  });
  const postTagId = assignRes.json("data.id");

  sleep(1);

  // Get tags by post
  const getTagsRes = http.get(`${BASE_URL}/post-tags?postId=${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getTagsRes, {
    "get tags status 200": (res) => res.status === 200,
    "response is array": (res) => {
      const data = res.json("data");
      return data !== null && Array.isArray(data);
    },
  });

  sleep(1);

  // Remove tag from post
  const removeRes = http.del(`${BASE_URL}/post-tags/${postTagId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(removeRes, {
    "tag removed": (res) => res.status === 200 || res.status === 404,
  });

  sleep(1);
}

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "1m",
};

const BASE_URL = "http://localhost:8000";

export default function () {
  // Login (Admin)
  const loginPayload = JSON.stringify({
    email: "john@example.com",
    password: "password123",
  });

  const loginRes = http.post(`${BASE_URL}/user/login`, loginPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, {
    "login success": (res) => res.status === 200,
    "token exists": (res) => !!res.json("data.token"),
  });

  const token = loginRes.json("data.token");
  sleep(1);

  // Create Category
  const categoryPayload = JSON.stringify({
    name: `PerfCat-${Math.floor(Math.random() * 10000)}-${Date.now()}`,
    description: "Performance test category",
  });

  const createRes = http.post(`${BASE_URL}/categories`, categoryPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(createRes, {
    "category created": (res) => res.status === 201,
  });

  sleep(1);
  const categoryId = createRes.json("data.id");

  // Get All Categories
  const getAllRes = http.get(`${BASE_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getAllRes, {
    "get all categories": (res) => res.status === 200,
  });
  sleep(1);

  // Get Category By ID
  const getByIdRes = http.get(`${BASE_URL}/categories/${categoryId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getByIdRes, {
    "get category by id": (res) => res.status === 200,
  });

  sleep(1);

  // Update Category
  const updatePayload = JSON.stringify({
    description: "Updated during perf test",
  });

  const updateRes = http.put(
    `${BASE_URL}/categories/${categoryId}`,
    updatePayload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(updateRes, {
    "update category": (res) => res.status === 200,
  });

  sleep(1);
  
  // Delete Category
  const deleteRes = http.del(`${BASE_URL}/categories/${categoryId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(deleteRes, {
    "delete category": (res) => res.status === 200 || res.status === 404,
  });

  sleep(1);
}

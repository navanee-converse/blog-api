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

  // Create Tag
  const tagPayload = JSON.stringify({
    name: `PerfTag-${Math.floor(Math.random() * 10000)}-${Date.now()}`,
  });

  const createRes = http.post(`${BASE_URL}/tags`, tagPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(createRes, {
    "tag created": (res) => res.status === 201,
  });

  const tagId = createRes.json("data.id");

  // Get All Tags
  const getAllRes = http.get(`${BASE_URL}/tags`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getAllRes, {
    "get all tags": (res) => res.status === 200,
  });

  // Get Tag By ID
  const getByIdRes = http.get(`${BASE_URL}/tags/${tagId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getByIdRes, {
    "get tag by id": (res) => res.status === 200,
  });

  // Update Tag
  const updatePayload = JSON.stringify({
    name: `UpdatedTag-${Math.floor(Math.random() * 10000)}-${Date.now()}`,
  });

  const updateRes = http.put(`${BASE_URL}/tags/${tagId}`, updatePayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(updateRes, {
    "update tag": (res) => res.status === 200,
  });

  // Delete Tag
  const deleteRes = http.del(`${BASE_URL}/tags/${tagId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(deleteRes, {
    "delete tag": (res) => res.status === 200 || res.status === 404,
  });

  sleep(1);
}

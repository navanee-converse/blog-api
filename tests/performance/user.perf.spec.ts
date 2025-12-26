import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "10s",
};

const BASE_URL = "http://localhost:8000";
export default function () {
  // Login user (POST)
  const loginPayload = JSON.stringify({
    email: "john@example.com",
    password: "password123",
  });

  const loginRes = http.post(`${BASE_URL}/user/login`, loginPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, {
    "login status is 200": (res) => res.status === 200,
    "login token exists": (res) => !!res.json("data.token"),
  });

  const token = loginRes.json("data.token");

  // Get current user (GET with auth)
  const getRes = http.get(`${BASE_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(getRes, {
    "get user status is 200": (res) => res.status === 200,
    "response has user object": (res) => {
      const data = res.json("data");
      return data !== null && typeof data === "object" && !Array.isArray(data);
    },
  });

  // Create a new user (POST)
  const createPayload = JSON.stringify({
    name: `PerfUser-${Math.floor(Math.random() * 10000)}`,
    email: `perf${Math.floor(Math.random() * 10000)}${Date.now()}@test.com`,
    password: "password123",
    role: "user",
  });

  const createRes = http.post(`${BASE_URL}/user`, createPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(createRes, {
    "create user status is 201": (res) => res.status === 201,
  });

  sleep(1);

  const updateUser = JSON.stringify({
    name: `PerfUser-${Date.now()}`,
  });
  const updateRes = http.put(`${BASE_URL}/user`, updateUser, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(updateRes, {
    "update user status code is 200": (res) => res.status === 200,
    "update response is object": (res) => {
      const data = res.json("data");
      return data !== null && typeof data === "object" && !Array.isArray(data);
    },
  });
  sleep(1);
}

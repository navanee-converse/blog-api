import { Request, Response } from "express";
import {
  createUser,
  getUser,
  loginUser,
  updateUser,
  deleteUser,
} from "../services/user.service";
import { HttpError } from "../utils/http-error";
import { sendResponse } from "../utils/response.util";

export const userCreate = async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  sendResponse(res, user, "User created successfully", 201);
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await getUser(req.user);
  sendResponse(res, user, "User fetched successfully");
};

export const userUpdate = async (req: Request, res: Response) => {
  const user = await updateUser(req.body, req.user);
  sendResponse(res, user, "User updated successfully");
};

export const userDelete = async (req: Request, res: Response) => {
  const deleted = await deleteUser(req.user);
  if (!deleted) throw new HttpError(404, "User not found");
  sendResponse(res, null, "User deleted successfully");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);
  sendResponse(res, result, "Login successfull");
};

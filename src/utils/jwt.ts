import jwt from "jsonwebtoken";
import { TokenInterface } from "../dtos/jwt-payload.dto";

const JWT_SECRET = process.env.JWT_SECRET || "yourjwtsecret";
const JWT_EXPIRES_IN = "1d"; // token expiry

export const generateToken = (payload: TokenInterface) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

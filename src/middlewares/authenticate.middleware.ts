import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { TokenInterface } from "../dtos/jwt-payload.dto";
import { HttpError } from "../utils/http-error";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Authorization token missing");
  }

  const token = authHeader.split(" ")[1];

  if (!token) throw new HttpError(401, "Authorization token missing");
  const decoded = verifyToken(token);

  if (!decoded) throw new HttpError(401, "Invalid or expired token");

  // Attach user info to request object
  req.user = decoded as TokenInterface;
  next();
};

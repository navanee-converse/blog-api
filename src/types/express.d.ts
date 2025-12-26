import { TokenInterface } from "../dtos/jwt-payload.dto.ts";

declare global {
  namespace Express {
    interface Request {
      user: TokenInterface;
    }
  }
}
export {};

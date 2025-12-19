import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/user.route";
import postRoutes from "./routes/post.route";
import commentRoutes from "./routes/comment.route";
import categoryRoutes from "./routes/category.route";
import postTagRoutes from "./routes/post-tag.route";
import tagRoutes from "./routes/tag.route";
import { swaggerSpec } from "./config/swagger.config";
import { HttpError } from "./utils/http-error";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/categories", categoryRoutes);
app.use("/post-tags", postTagRoutes);
app.use("/tags", tagRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express!");
});

// 404 handler
app.use((req: Request, res: Response) => {
  throw new HttpError(404, "Not Found");
});

// Global error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    status: 500,
    message: "Internal Server Error",
  });
});

export default app;

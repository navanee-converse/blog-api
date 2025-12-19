// src/utils/response.ts
export function sendResponse<T>(
  res: any,
  data: T | null,
  message: string,
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data: data || null,
  });
}

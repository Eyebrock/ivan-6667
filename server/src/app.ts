import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { snailPayRouter } from "./snailpay/router.js";
import { buildResponse } from "./snailpay/response.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/snailpay", snailPayRouter);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const isBadJson = err instanceof SyntaxError;
    res
      .status(isBadJson ? 400 : 500)
      .json(buildResponse(null, isBadJson ? "FAILED" : "FAILED", isBadJson ? "invalid_json" : "internal_error"));
  };
  app.use(errorHandler);

  return app;
}
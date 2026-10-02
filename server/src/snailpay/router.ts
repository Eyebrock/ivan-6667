import { Router } from "express";
import { paymentRequestSchema } from "./schemas.js";
import { evaluateCharge } from "./scenarios.js";
import { requestedDelayMs, shouldSimulateSystemError, sleep } from "./simulation.js";
import { buildResponse } from "./response.js";

export const snailPayRouter = Router();

snailPayRouter.post("/payments", async (req, res) => {
  const delay = requestedDelayMs(req);
  if (delay > 0) await sleep(delay);


  if (shouldSimulateSystemError(req)) {
    return res
      .status(503)
      .json(buildResponse(req.body, "FAILED", "system_unavailable"));
  }


  const parsed = paymentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return res
      .status(400)
      .json(buildResponse(req.body, "FAILED", "invalid_request", { errors }));
  }


  const outcome = evaluateCharge(parsed.data);
  return res
    .status(outcome.httpStatus)
    .json(buildResponse(req.body, outcome.status, outcome.status_detail));
});
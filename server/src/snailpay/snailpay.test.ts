import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

const validBody = {
  card_number: "1234123412341234",
  expiration_date: "12/26",
  cvv: "543",
  full_name: "Ana Pérez",
  amount: 100,
  payer_id: "user-1",
  payer_email: "ana@mail.com",
};

const REQUIRED_FIELDS = [
  "id", "status", "status_detail", "transaction_amount", "date_created",
  "authorization_code", "reference", "payer_id", "payer_email",
];

const pay = (body: object, headers: Record<string, string> = {}) =>
  request(app).post("/api/snailpay/payments").set(headers).send(body);

afterEach(() => {
  delete process.env.SNAILPAY_DOWN;
});

describe("SnailPay", () => {
  it("aprueba el cobro con la tarjeta de prueba", async () => {
    const res = await pay(validBody);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("COMPLETED");
    expect(res.body.authorization_code).toMatch(/^\d{6}$/);
    expect(res.body.transaction_amount).toBe(100);
  });

  it("devuelve los campos requeridos en todos los escenarios", async () => {
    const responses = [
      await pay(validBody),
      await pay({ ...validBody, amount: -5 }),
      await pay({ ...validBody, card_number: "4000000000000002" }),
      await pay(validBody, { "X-SnailPay-Simulate": "system_error" }),
    ];
    for (const res of responses) {
      for (const field of REQUIRED_FIELDS) expect(res.body).toHaveProperty(field);
    }
  });

  it("rechaza datos inválidos con 400 y no autoriza", async () => {
    const res = await pay({ ...validBody, amount: 0, cvv: "12" });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.authorization_code).toBeNull();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("rechaza tarjeta sin fondos", async () => {
    const res = await pay({ ...validBody, card_number: "4000000000000002" });
    expect(res.status).toBe(402);
    expect(res.body.status_detail).toBe("cc_rejected_insufficient_funds");
  });

  it("rechaza CVV incorrecto con la tarjeta de prueba", async () => {
    const res = await pay({ ...validBody, cvv: "999" });
    expect(res.status).toBe(402);
    expect(res.body.status_detail).toBe("cc_rejected_bad_filled_security_code");
  });

  it("simula error del sistema por header", async () => {
    const res = await pay(validBody, { "X-SnailPay-Simulate": "system_error" });
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.authorization_code).toBeNull();
  });

  it("simula error del sistema por variable de entorno", async () => {
    process.env.SNAILPAY_DOWN = "true";
    const res = await pay(validBody);
    expect(res.status).toBe(503);
  });

  it("responde 400 ante JSON malformado", async () => {
    const res = await request(app)
      .post("/api/snailpay/payments")
      .set("Content-Type", "application/json")
      .send("{malo");
    expect(res.status).toBe(400);
  });
});
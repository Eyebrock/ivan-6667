import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../auth/AuthContext";
import RegisterPage from "../pages/RegisterPage";
import { PaymentStatus } from "../snailpay/types";
import * as snailpayClient from "../snailpay/client";

// Dashboard ya monta el modal y lo conecta al contexto, así que probamos
// a través de él en vez de montar RechargeModal suelto sin un usuario real.
function renderDashboardWithUser() {
  return render(
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>
  );
}

async function registerAndOpenModal(user: ReturnType<typeof userEvent.setup>) {
  renderDashboardWithUser();

  await user.type(screen.getByLabelText(/nombre completo/i), "Ana Pérez");
  await user.type(screen.getByLabelText(/correo/i), "ana@mail.com");
  await user.type(screen.getByLabelText(/^contraseña/i), "clave1234");
  await user.type(screen.getByLabelText(/confirmar contraseña/i), "clave1234");
  await user.click(screen.getByRole("button", { name: /registrar/i }));

  await screen.findByText(/hola, ana pérez/i);
  await user.click(screen.getByRole("button", { name: /cargar saldo/i }));
  expect(await screen.findByText(/cargar saldo con snailpay/i)).toBeInTheDocument();
}

const validCardInputs = {
  cardNumber: "1234123412341234",
  expirationDate: "12/26",
  cvv: "543",
  fullName: "Ana Pérez",
  amount: "100",
};

async function fillRechargeForm(user: ReturnType<typeof userEvent.setup>, overrides: Partial<typeof validCardInputs> = {}) {
  const data = { ...validCardInputs, ...overrides };
  await user.type(screen.getByLabelText(/número de tarjeta/i), data.cardNumber);
  await user.type(screen.getByLabelText(/vencimiento/i), data.expirationDate);
  await user.type(screen.getByLabelText(/^cvv/i), data.cvv);
  await user.type(screen.getByLabelText(/nombre en la tarjeta/i), data.fullName);
  await user.type(screen.getByLabelText(/^monto/i), data.amount);
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("RechargeModal", () => {
  it("muestra errores de validación sin llamar al backend", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(snailpayClient, "chargeSnailPay");

    await registerAndOpenModal(user);
    await user.click(screen.getByRole("button", { name: /cargar saldo/i }));

    expect(await screen.findByText(/16 dígitos/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it("actualiza el saldo mostrado cuando la transacción es COMPLETED", async () => {
    const user = userEvent.setup();
    vi.spyOn(snailpayClient, "chargeSnailPay").mockResolvedValue({
      id: "tx-1",
      status: PaymentStatus.COMPLETED,
      status_detail: "accredited",
      transaction_amount: 100,
      date_created: new Date().toISOString(),
      authorization_code: "123456",
      reference: "SP-TEST",
      payer_id: "user-1",
      payer_email: "ana@mail.com",
      card_number: validCardInputs.cardNumber,
      cvv: validCardInputs.cvv,
    });

    await registerAndOpenModal(user);
    await fillRechargeForm(user);
    await user.click(screen.getByRole("button", { name: /^cargar saldo$/i }));

    expect(await screen.findByText(/aprobada/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cerrar/i }));

    expect(await screen.findByText(/saldo actual: \$100\.00/i)).toBeInTheDocument();
  });

  it("no modifica el saldo cuando la tarjeta es rechazada", async () => {
    const user = userEvent.setup();
    vi.spyOn(snailpayClient, "chargeSnailPay").mockResolvedValue({
      id: "tx-2",
      status: PaymentStatus.FAILED,
      status_detail: "cc_rejected_insufficient_funds",
      transaction_amount: 100,
      date_created: new Date().toISOString(),
      authorization_code: null,
      reference: "SP-TEST2",
      payer_id: "user-1",
      payer_email: "ana@mail.com",
      card_number: validCardInputs.cardNumber,
      cvv: validCardInputs.cvv,
    });

    await registerAndOpenModal(user);
    await fillRechargeForm(user);
    await user.click(screen.getByRole("button", { name: /^cargar saldo$/i }));

    expect(await screen.findByText(/fondos suficientes/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cerrar/i }));

    expect(await screen.findByText(/saldo actual: \$0\.00/i)).toBeInTheDocument();
  });

  it("muestra un mensaje distinto cuando el sistema no está disponible", async () => {
    const user = userEvent.setup();
    vi.spyOn(snailpayClient, "chargeSnailPay").mockResolvedValue({
      id: "tx-3",
      status: PaymentStatus.FAILED,
      status_detail: "system_unavailable",
      transaction_amount: 100,
      date_created: new Date().toISOString(),
      authorization_code: null,
      reference: "SP-TEST3",
      payer_id: "user-1",
      payer_email: "ana@mail.com",
      card_number: validCardInputs.cardNumber,
      cvv: validCardInputs.cvv,
    });

    await registerAndOpenModal(user);
    await fillRechargeForm(user);
    await user.click(screen.getByRole("button", { name: /^cargar saldo$/i }));

    expect(await screen.findByText(/no está disponible/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de timeout si la solicitud tarda demasiado", async () => {
    const user = userEvent.setup();
    const { SnailPayTimeoutError } = snailpayClient;
    vi.spyOn(snailpayClient, "chargeSnailPay").mockRejectedValue(new SnailPayTimeoutError());

    await registerAndOpenModal(user);
    await fillRechargeForm(user);
    await user.click(screen.getByRole("button", { name: /^cargar saldo$/i }));

    expect(await screen.findByText(/tardó demasiado/i)).toBeInTheDocument();
  });
});
import { useState, type FormEvent } from "react";
import { rechargeSchema } from "../snailpay/schemas";
import { chargeSnailPay, SnailPayTimeoutError, SnailPayNetworkError } from "../snailpay/client";
import { getUserMessage, isApproved } from "../snailpay/messages";
import { useAuth } from "../auth/AuthContext";

interface Props {
  onClose: () => void;
}

type FormState = {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  fullName: string;
  amount: string;
};

const INITIAL: FormState = { cardNumber: "", expirationDate: "", cvv: "", fullName: "", amount: "" };

export default function RechargeModal({ onClose }: Props) {
  const { user, updateBalance } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [resultMessage, setResultMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    const parsed = rechargeSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[issue.path[0] as string] = issue.message;
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStatus("loading");

    try {
      const tx = await chargeSnailPay({
        card_number: parsed.data.cardNumber,
        expiration_date: parsed.data.expirationDate,
        cvv: parsed.data.cvv,
        full_name: parsed.data.fullName,
        amount: parsed.data.amount,
        payer_id: user.id,
        payer_email: user.email,
      });

      if (isApproved(tx)) {
        updateBalance(user.balance + parsed.data.amount);
        setResultMessage({ ok: true, text: getUserMessage(tx) });
      } else {
        setResultMessage({ ok: false, text: getUserMessage(tx) });
      }
    } catch (err) {
      const text =
        err instanceof SnailPayTimeoutError || err instanceof SnailPayNetworkError
          ? err.message
          : "No pudimos procesar la recarga. Intenta de nuevo.";
      setResultMessage({ ok: false, text });
    } finally {
      setStatus("done");
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>Cargar saldo con SnailPay</h2>

        {resultMessage ? (
          <div className={resultMessage.ok ? "alert-success" : "alert-error"}>
            <p>{resultMessage.text}</p>
            <button onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label>
              Número de tarjeta
              <input value={form.cardNumber} onChange={handleChange("cardNumber")} maxLength={16} />
              {fieldErrors.cardNumber && <span className="error">{fieldErrors.cardNumber}</span>}
            </label>

            <label>
              Vencimiento (MM/AA)
              <input value={form.expirationDate} onChange={handleChange("expirationDate")} placeholder="12/26" />
              {fieldErrors.expirationDate && <span className="error">{fieldErrors.expirationDate}</span>}
            </label>

            <label>
              CVV
              <input value={form.cvv} onChange={handleChange("cvv")} maxLength={3} />
              {fieldErrors.cvv && <span className="error">{fieldErrors.cvv}</span>}
            </label>

            <label>
              Nombre en la tarjeta
              <input value={form.fullName} onChange={handleChange("fullName")} />
              {fieldErrors.fullName && <span className="error">{fieldErrors.fullName}</span>}
            </label>

            <label>
              Monto
              <input value={form.amount} onChange={handleChange("amount")} inputMode="decimal" />
              {fieldErrors.amount && <span className="error">{fieldErrors.amount}</span>}
            </label>

            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={status === "loading"}>
                Cancelar
              </button>
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Procesando..." : "Cargar saldo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
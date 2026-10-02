import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerSchema } from "../auth/schemas";
import { useAuth } from "../auth/AuthContext";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const INITIAL: FormState = { fullName: "", email: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[issue.path[0] as string] = issue.message;
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await register({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      navigate("/dashboard", { replace: true });
    } catch {
      setFormError("No se pudo completar el registro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="fullName">
          Nombre completo
          <input id="fullName" value={form.fullName} onChange={handleChange("fullName")} autoComplete="name" />
        </label>
        {fieldErrors.fullName && <span className="error">{fieldErrors.fullName}</span>}

        <label htmlFor="email">
          Correo electrónico
          <input id="email" type="email" value={form.email} onChange={handleChange("email")} autoComplete="email" />
        </label>
        {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}

        <label htmlFor="password">
          Contraseña
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            autoComplete="new-password"
          />
        </label>
        {fieldErrors.password && <span className="error">{fieldErrors.password}</span>}

        <label htmlFor="confirmPassword">
          Confirmar contraseña
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            autoComplete="new-password"
          />
        </label>
        {fieldErrors.confirmPassword && <span className="error">{fieldErrors.confirmPassword}</span>}

        {formError && <p className="error">{formError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type FormState = { email: string; password: string };

const INITIAL: FormState = { email: "", password: "" };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">
          Correo electrónico
          <input id="email" type="email" value={form.email} onChange={handleChange("email")} autoComplete="email" />
        </label>

        <label htmlFor="password">
          Contraseña
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            autoComplete="current-password"
          />
        </label>

        {formError && <p className="error">{formError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
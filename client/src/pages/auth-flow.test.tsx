import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";

function renderApp(initialPath = "/register") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("flujo de registro, logout y login", () => {
  it("registra un usuario y lo lleva al dashboard", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Pérez");
    await user.type(screen.getByLabelText(/correo/i), "ana@mail.com");
    await user.type(screen.getByLabelText(/^contraseña/i), "clave1234");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "clave1234");
    await user.click(screen.getByRole("button", { name: /registrar/i }));

    expect(await screen.findByText(/hola, ana pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/saldo actual: \$0\.00/i)).toBeInTheDocument();
  });

  it("cierra sesión y permite volver a iniciar sesión con los mismos datos", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Pérez");
    await user.type(screen.getByLabelText(/correo/i), "ana@mail.com");
    await user.type(screen.getByLabelText(/^contraseña/i), "clave1234");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "clave1234");
    await user.click(screen.getByRole("button", { name: /registrar/i }));
    await screen.findByText(/hola, ana pérez/i);

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    expect(await screen.findByLabelText(/correo/i)).toBeInTheDocument(); // volvió a /login

    await user.type(screen.getByLabelText(/correo/i), "ana@mail.com");
    await user.type(screen.getByLabelText(/contraseña/i), "clave1234");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/hola, ana pérez/i)).toBeInTheDocument();
  });

  it("rechaza contraseña incorrecta con un mensaje claro", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Pérez");
    await user.type(screen.getByLabelText(/correo/i), "ana@mail.com");
    await user.type(screen.getByLabelText(/^contraseña/i), "clave1234");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "clave1234");
    await user.click(screen.getByRole("button", { name: /registrar/i }));
    await screen.findByText(/hola, ana pérez/i);
    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await user.type(await screen.findByLabelText(/correo/i), "ana@mail.com");
    await user.type(screen.getByLabelText(/contraseña/i), "otra-clave");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument();
  });

  it("redirige al login si no hay sesión activa", () => {
    renderApp("/dashboard");
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
  });

  it("mantiene la sesión después de 'recargar' (nuevo render con el mismo localStorage)", async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp("/register");

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Pérez");
    await user.type(screen.getByLabelText(/correo/i), "ana@mail.com");
    await user.type(screen.getByLabelText(/^contraseña/i), "clave1234");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "clave1234");
    await user.click(screen.getByRole("button", { name: /registrar/i }));
    await screen.findByText(/hola, ana pérez/i);

    unmount(); // simula descartar la app en memoria, como al recargar la página
    renderApp("/dashboard");

    expect(await screen.findByText(/hola, ana pérez/i)).toBeInTheDocument();
  });
});
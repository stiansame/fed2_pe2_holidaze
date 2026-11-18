import { messages } from "../constants/messages.js";
import { useState } from "react";
import useSubmit from "../hooks/useSubmit.js";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.js";
import FieldError from "../components/FieldError.jsx";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3";

/**
 * Shares registration/login fields, validation and navigation to the intended destination.
 * @param {object} props Component props.
 * @param {boolean} [props.register] Shows registration instead of login.
 * @returns {import('react').ReactNode}
 */
export default function AuthForm({ register = false }) {
  const { user, notice, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { submit, pending, error } = useSubmit(authenticate);
  const [fieldErrors, setFieldErrors] = useState({});
  const from = location.state?.from;
  const destination =
    typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
      ? from
      : "/profile";

  if (user) return <Navigate to={destination} replace />;

  /**
   * Submits registration or login and displays API field errors beside the form.
   * @param {HTMLFormElement} form Login or registration form.
   * @returns {Promise<void>}
   */
  async function authenticate(form) {
    const values = new FormData(form);
    const credentials = {
      email: values.get("email").trim(),
      password: values.get("password"),
    };
    setFieldErrors({});
    try {
      if (register) {
        await apiRequest("auth/register", {
          method: "POST",
          body: {
            ...credentials,
            name: values.get("name").trim(),
            venueManager: values.get("venueManager") === "on",
          },
        });
        navigate("/login", {
          replace: true,
          state: {
            from,
            registered: true,
          },
        });
      } else {
        await login(credentials);
        navigate(destination, {
          replace: true,
        });
      }
    } catch (error) {
      setFieldErrors(
        Object.fromEntries(
          (error.errors ?? [])
            .filter((item) => item.path?.length)
            .map((item) => [item.path[0], item.message]),
        ),
      );
      throw error;
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-border bg-surface p-6 md:p-8">
      <h1 className="text-h3 font-bold">
        {register ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted">
        {register
          ? "Your next stay starts here."
          : "Log in to manage your stays."}
      </p>
      {!register && (notice || location.state?.registered) && (
        <p role="status" className="mt-4">
          {location.state?.registered ? messages.accountCreated : notice}
        </p>
      )}
      <form
        onSubmit={submit}
        className="mt-6 space-y-5"
        onInput={(event) => event.target.setCustomValidity?.("")}
        onInvalid={(event) => {
          const input = event.target;
          const message = input.validity.valueMissing
            ? messages.requiredField
            : input.name === "email"
              ? messages.invalidEmail
              : input.name === "name"
                ? messages.invalidUsername
                : messages.shortPassword;
          input.setCustomValidity(message);
        }}
      >
        {register && (
          <div>
            <label className="block">
              Username
              <input
                name="name"
                required
                pattern="[a-zA-Z0-9_]+"
                autoComplete="username"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                title={messages.invalidUsername}
                className={inputClass}
              />
              <span className="mt-1 block text-small text-muted">
                Letters, numbers and underscores only.
              </span>
            </label>
            <FieldError id="name-error">{fieldErrors.name}</FieldError>
          </div>
        )}
        <div>
          <label className="block">
            Email
            <input
              name="email"
              type="email"
              required
              pattern="[^@\s]+@stud\.noroff\.no"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              title="Use your @stud.noroff.no email address."
              className={inputClass}
            />
            <span className="mt-1 block text-small text-muted">
              Use your @stud.noroff.no email address.
            </span>
          </label>
          <FieldError id="email-error">{fieldErrors.email}</FieldError>
        </div>
        <div>
          <label className="block">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={register ? 8 : undefined}
              autoComplete={register ? "new-password" : "current-password"}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              className={inputClass}
            />
            {register && (
              <span className="mt-1 block text-small text-muted">
                At least 8 characters.
              </span>
            )}
          </label>
          <FieldError id="password-error">{fieldErrors.password}</FieldError>
        </div>
        {register && (
          <label className="flex min-h-12 items-center gap-3">
            <input
              name="venueManager"
              type="checkbox"
              className="size-5 accent-primary"
            />
            Register as a venue manager
          </label>
        )}
        {error && (
          <p role="alert" className="whitespace-pre-line text-danger">
            {error}
          </p>
        )}
        <button
          disabled={pending}
          className="primary-button w-full disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Please wait…" : register ? "Create account" : "Log in"}
        </button>
      </form>
      <Link
        to={register ? "/login" : "/register"}
        state={{ from }}
        className="navigation-link mt-5 w-full"
      >
        {register ? "Already have an account? Log in" : "Create an account"}
      </Link>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react"
import Spinner from '@/_components/ui/spinner';
import ReCAPTCHA from "react-google-recaptcha";

export default function Form() {
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newFieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newFieldErrors.email = 'Email is blank';
    if (!password.trim()) newFieldErrors.password = 'Password is blank';

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);

    try {
      const normalisedEmail = email.trim().toLowerCase();

      const response = await signIn('credentials', {
        email: normalisedEmail,
        password: password,
        recaptchaToken,
        redirect: false,
      });

      if(response?.error) {
        if (response.error.includes("Too many")) {
          setShowRecaptcha(true);
        }
        setError(response.error || "An unknown error occurred");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError(`Something went wrong: ${error}`)
    } finally {
      setLoading(false)
    }
  };

  return (
    <form
      className="mt-8 space-y-6 text-left"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="login-form-title"
    >

      <h2 id="login-form-title" className="sr-only">
        Login Form
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.email && (
            <p
              id="email-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.password && (
            <p
              id="password-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {showRecaptcha && (
        <div className="flex justify-center" aria-label="reCAPTCHA challenge">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setRecaptchaToken(token || '')}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (showRecaptcha && !recaptchaToken)}
        aria-busy={loading}
        className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ocean-blue hover:bg-ocean-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:hover:bg-ocean-blue"
      >
        {loading && <Spinner />}
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  )
}

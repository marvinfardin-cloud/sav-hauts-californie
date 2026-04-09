"use client";

import { useState } from "react";
import { SHOP_NAME } from "@/lib/constants";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.devToken) setDevToken(data.devToken);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            HC
          </div>
          <h1 className="text-xl font-bold text-gray-900">{SHOP_NAME}</h1>
          <p className="text-gray-500 mt-1">Accès Atelier</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Vérifiez vos emails</h2>
            <p className="text-gray-600 text-sm">
              Si un compte existe pour <strong>{email}</strong>, un lien de connexion a été envoyé.
            </p>
            {devToken && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                <p className="font-semibold text-yellow-800">Mode développement</p>
                <a href={`/api/auth/verify-staff?token=${devToken}`} className="text-blue-600 underline break-all">
                  Cliquer ici pour se connecter
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="technicien@hauts-californie.fr"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Recevoir le lien de connexion"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

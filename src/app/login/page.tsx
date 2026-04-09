"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import { SHOP_NAME } from "@/lib/constants";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [step, setStep] = useState<"email" | "register" | "sent">("email");
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        nom: nom || undefined,
        prenom: prenom || undefined,
        telephone: telephone || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.needsRegistration) {
      setStep("register");
      return;
    }

    if (data.success) {
      if (data.devToken) setDevToken(data.devToken);
      setStep("sent");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              HC
            </div>
            <h1 className="text-xl font-bold text-gray-900">{SHOP_NAME}</h1>
            <p className="text-gray-500 mt-1">Connexion à votre espace SAV</p>
          </div>

          {error === "expired" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              Le lien a expiré. Veuillez vous reconnecter.
            </div>
          )}

          {step === "sent" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Vérifiez vos emails</h2>
              <p className="text-gray-600 text-sm">
                Un lien de connexion a été envoyé à <strong>{email}</strong>.
                <br />
                Ce lien est valable 15 minutes.
              </p>
              {devToken && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                  <p className="font-semibold text-yellow-800">Mode développement</p>
                  <a
                    href={`/api/auth/verify?token=${devToken}`}
                    className="text-blue-600 underline break-all"
                  >
                    Cliquer ici pour se connecter
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {step === "register" && (
                <>
                  <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                    Première visite ? Complétez vos informations pour créer votre compte.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="0596..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : step === "register" ? "Créer mon compte et recevoir le lien" : "Recevoir le lien de connexion"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}

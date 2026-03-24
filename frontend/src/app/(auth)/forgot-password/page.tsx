"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import "../login/login.css"; // Reuse the same CSS

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setSuccess("Um link de recuperação foi enviado para o seu e-mail corporativo.");
      } else {
        setError(data.message || "Erro ao solicitar recuperação de senha.");
      }
    } catch (_err) {
      // Mock integration for now if API endpoint doesn't exist yet
      setSuccess("Simulação: Link de recuperação enviado com sucesso!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Senha</h2>
        <p>Informe seu e-mail para receber as instruções.</p>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {!success && (
          <form onSubmit={handleRecover} className="auth-form">
            <div className="form-group">
              <label>E-mail Corporativo</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@superfin.com.br"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Lembrou a senha? <a href="/login">Voltar para o login</a>
        </div>
      </div>
    </div>
  );
}

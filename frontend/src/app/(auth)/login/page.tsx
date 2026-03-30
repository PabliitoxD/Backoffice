"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = "/transactions"; // Redirect to dashboard
      } else {
        setError(data.message || "Credenciais inválidas");
      }
    } catch (_err) {
      setError("Erro ao conectar com o servidor");
    }
  };

  const handleOfflineLogin = () => {
    localStorage.setItem("token", "mock-token-local");
    localStorage.setItem("user", JSON.stringify({ name: "Usuário Teste Local", role: "ADMIN" }));
    document.cookie = `token=mock-token-local; path=/`;
    window.location.href = "/transactions";
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Entrar no Backoffice</h2>
        <p>Acesse o painel de administração</p>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
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
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <div className="form-footer">
            <a href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-accent)' }}>Esqueceu a senha?</a>
          </div>
          <button type="submit" className="btn-primary">Acessar</button>
          
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <button 
              type="button" 
              onClick={handleOfflineLogin}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              🛠️ Entrar Offline (Somente Teste/Mock)
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Não tem uma conta? <a href="/signup">Cadastre-se</a>
        </div>
      </div>
    </div>
  );
}

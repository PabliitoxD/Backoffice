"use client";

import { useState } from "react";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
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
          <button type="submit" className="btn-primary">Acessar</button>
        </form>

        <div className="auth-footer">
          Não tem uma conta? <a href="/signup">Cadastre-se</a>
        </div>
      </div>
    </div>
  );
}

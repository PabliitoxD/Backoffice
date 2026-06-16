"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./ClientModal.module.css";
import { API_URL } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientSummary {
  id: number;
  name: string;
  email: string;
  company: string;
  status: string;
  date: string;
}

interface ClientDetail {
  id: number;
  status: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  cnpj: string;
  companyName: string;
  tradingName: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  planId: number | string;
  customLiquidationRate?: number;
}

interface StatementItem {
  id: string;
  type: string;
  status: string;
  description: string;
  amount: number;
  createdAt: string;
  customerName?: string;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_DETAIL: ClientDetail = {
  id: 1,
  status: "Pendente",
  fullName: "João Silva",
  cpf: "123.456.789-00",
  birthDate: "1985-06-15",
  responsibleName: "João Silva",
  responsibleEmail: "joao.silva@email.com",
  responsiblePhone: "(11) 98765-4321",
  cnpj: "12.345.678/0001-90",
  companyName: "Acme Corp Finance",
  tradingName: "Acme Corp",
  zipCode: "01001-000",
  street: "Praça da Sé",
  number: "1",
  complement: "Lado ímpar",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
  planId: 2,
  customLiquidationRate: 1.5,
};

const SYSTEM_PLANS = [
  { id: 1, name: "Básico", pixRate: "0.99%", boletoRate: "R$ 2,50" },
  { id: 2, name: "Standard", pixRate: "0.89%", boletoRate: "R$ 1,99" },
  { id: 3, name: "Premium (Ilimitado)", pixRate: "0.79%", boletoRate: "1.50%" },
  { id: "custom", name: "Personalizado", pixRate: "—", boletoRate: "—" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Formats a number as BRL currency (R$ 1.234,56)
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// Returns the CSS module class for a given transaction or client status string
const statusBadgeClass = (status: string) => {
  if (status === "Ativo" || status === "APPROVED" || status === "COMPLETED") return styles.badgeActive;
  if (status === "Pendente" || status === "WAITING" || status === "PENDING") return styles.badgePending;
  if (status === "Recusada" || status === "REFUSED") return styles.badgeDanger;
  return styles.badgeInactive;
};

// Converts API status codes to their Portuguese display labels
const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "Aprovada", COMPLETED: "Aprovada",
    WAITING: "Aguardando", PENDING: "Aguardando",
    REFUSED: "Recusada",
    REVERSED: "Estornado", CHARGEBACK: "Chargeback",
  };
  return map[status] || status;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Single labeled field used inside the detail sections
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || "—"}</span>
    </div>
  );
}

// Card that groups InfoRow fields under a titled section with icon
function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

// ─── Tab: Detalhes ────────────────────────────────────────────────────────────

// Read-only summary of all client data grouped by section
function TabDetalhes({ detail }: { detail: ClientDetail }) {
  return (
    <div className={styles.tabGrid}>
      <SectionCard title="Dados Empresariais" icon="🏢">
        <InfoRow label="Razão Social" value={detail.companyName} />
        <InfoRow label="Nome Fantasia" value={detail.tradingName} />
        <InfoRow label="CNPJ" value={detail.cnpj} />
      </SectionCard>

      <SectionCard title="Contato Responsável" icon="📞">
        <InfoRow label="Nome" value={detail.responsibleName} />
        <InfoRow label="E-mail" value={detail.responsibleEmail} />
        <InfoRow label="Telefone" value={detail.responsiblePhone} />
      </SectionCard>

      <SectionCard title="Dados do Titular / Sócio" icon="👤">
        <InfoRow label="Nome Completo" value={detail.fullName} />
        <InfoRow label="CPF" value={detail.cpf} />
        <InfoRow
          label="Data de Nascimento"
          value={new Date(detail.birthDate).toLocaleDateString("pt-BR")}
        />
      </SectionCard>

      <SectionCard title="Localização" icon="📍">
        <InfoRow
          label="Endereço"
          value={`${detail.street}, ${detail.number}${detail.complement ? ` — ${detail.complement}` : ""}`}
        />
        <InfoRow label="Bairro" value={detail.neighborhood} />
        <InfoRow label="Cidade / UF" value={`${detail.city} — ${detail.state}`} />
        <InfoRow label="CEP" value={detail.zipCode} />
      </SectionCard>
    </div>
  );
}

// ─── Tab: Editar ──────────────────────────────────────────────────────────────

// Editable form for all client fields; calls onSave when the form is submitted
function TabEditar({ detail, onSave }: { detail: ClientDetail; onSave: () => void }) {
  const [form, setForm] = useState({ ...detail, planId: detail.planId as number | string });

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated client:", form);
    onSave();
  };

  return (
    <form id="clientEditForm" onSubmit={handleSubmit} className={styles.editForm}>
      {/* Status */}
      <div className={styles.editSection}>
        <h3 className={styles.editSectionTitle}>Status do Cadastro</h3>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label>Status</label>
            <select name="status" value={form.status} onChange={set}>
              <option value="Ativo">Ativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className={styles.editSection}>
        <h3 className={styles.editSectionTitle}>Plano Operacional</h3>
        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Plano Vinculado</label>
            <select
              name="planId"
              value={form.planId}
              onChange={(e) =>
                setForm((p) => ({ ...p, planId: e.target.value === "custom" ? "custom" : Number(e.target.value) }))
              }
            >
              {SYSTEM_PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {typeof p.id === "number" ? `(${p.pixRate} PIX / ${p.boletoRate} Boleto)` : ""}
                </option>
              ))}
            </select>
          </div>
          {form.planId === "custom" && (
            <div className={styles.field}>
              <label>Taxa de Liquidação (%)</label>
              <input type="number" step="0.01" name="customLiquidationRate" value={form.customLiquidationRate} onChange={set} />
            </div>
          )}
        </div>
      </div>

      {/* Company */}
      <div className={styles.editSection}>
        <h3 className={styles.editSectionTitle}>Dados Empresariais</h3>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label>CNPJ</label>
            <input type="text" name="cnpj" value={form.cnpj} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Razão Social</label>
            <input type="text" name="companyName" value={form.companyName} onChange={set} />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Nome Fantasia</label>
            <input type="text" name="tradingName" value={form.tradingName} onChange={set} />
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className={styles.editSection}>
        <h3 className={styles.editSectionTitle}>Dados Pessoais</h3>
        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Nome Completo</label>
            <input type="text" name="fullName" value={form.fullName} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>CPF</label>
            <input type="text" name="cpf" value={form.cpf} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Data de Nascimento</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={set} />
          </div>
        </div>
      </div>

      {/* Responsible */}
      <div className={styles.editSection}>
        <h3 className={styles.editSectionTitle}>Usuário Responsável</h3>
        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Nome</label>
            <input type="text" name="responsibleName" value={form.responsibleName} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>E-mail</label>
            <input type="email" name="responsibleEmail" value={form.responsibleEmail} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Telefone</label>
            <input type="tel" name="responsiblePhone" value={form.responsiblePhone} onChange={set} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={styles.editSection}>
        <h3 className={styles.editSectionTitle}>Localização</h3>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label>CEP</label>
            <input type="text" name="zipCode" value={form.zipCode} onChange={set} />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Logradouro</label>
            <input type="text" name="street" value={form.street} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Número</label>
            <input type="text" name="number" value={form.number} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Complemento</label>
            <input type="text" name="complement" value={form.complement} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Bairro</label>
            <input type="text" name="neighborhood" value={form.neighborhood} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>Cidade</label>
            <input type="text" name="city" value={form.city} onChange={set} />
          </div>
          <div className={styles.field}>
            <label>UF</label>
            <input type="text" name="state" value={form.state} onChange={set} maxLength={2} />
          </div>
        </div>
      </div>
    </form>
  );
}

// ─── Tab: Extrato ─────────────────────────────────────────────────────────────

// Fetches and renders the client's financial statement from /producers/:id/statement
function TabExtrato({ clientId }: { clientId: number }) {
  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/producers/${clientId}/statement`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStatement(await res.json());
      } catch {
        // no-op; shows empty state
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [clientId]);

  const stats = {
    approved: statement
      .filter((s) => s.type === "TRANSACTION" && (s.status === "APPROVED" || s.status === "COMPLETED"))
      .reduce((a, c) => a + c.amount, 0),
    processing: statement
      .filter((s) => s.status === "WAITING" || s.status === "PENDING")
      .reduce((a, c) => a + Math.abs(c.amount), 0),
    withdrawn: statement
      .filter((s) => s.type === "WITHDRAWAL" && s.status === "COMPLETED")
      .reduce((a, c) => a + Math.abs(c.amount), 0),
  };

  return (
    <div className={styles.extratoContent}>
      <div className={styles.extratoStats}>
        <div className={styles.extratoStatCard}>
          <span className={styles.extratoStatLabel}>Total Aprovado</span>
          <span className={`${styles.extratoStatValue} ${styles.valuePositive}`}>{fmtCurrency(stats.approved)}</span>
        </div>
        <div className={styles.extratoStatCard}>
          <span className={styles.extratoStatLabel}>Em Processamento</span>
          <span className={styles.extratoStatValue}>{fmtCurrency(stats.processing)}</span>
        </div>
        <div className={styles.extratoStatCard}>
          <span className={styles.extratoStatLabel}>Total Sacado</span>
          <span className={`${styles.extratoStatValue} ${styles.valueNegative}`}>{fmtCurrency(stats.withdrawn)}</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingPlaceholder}>Carregando extrato...</div>
      ) : statement.length === 0 ? (
        <div className={styles.emptyState}>Nenhuma movimentação encontrada.</div>
      ) : (
        <div className={styles.extratoTableWrap}>
          <table className={styles.extratoTable}>
            <thead>
              <tr>
                <th>Data</th>
                <th>ID</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statement.map((item) => (
                <tr key={item.id}>
                  <td className={styles.tdMuted}>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className={styles.tdMono}>#{item.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className={styles.descCell}>
                      <span>{item.description}</span>
                      {item.customerName && <small className={styles.tdMuted}>Cliente: {item.customerName}</small>}
                    </div>
                  </td>
                  <td className={styles.tdMuted}>{item.type === "TRANSACTION" ? "Venda" : "Saque"}</td>
                  <td className={item.amount < 0 ? styles.valueNegative : styles.valuePositive} style={{ fontWeight: 600 }}>
                    {fmtCurrency(item.amount)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeClass(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

type Tab = "detalhes" | "editar" | "extrato";

interface ClientModalProps {
  client: ClientSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

// Modal with Detalhes / Editar / Extrato tabs, opened from the clients table
export function ClientModal({ client, isOpen, onClose }: ClientModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("detalhes");
  const [saved, setSaved] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset tab on open
  useEffect(() => {
    if (isOpen) { setActiveTab("detalhes"); setSaved(false); }
  }, [isOpen, client?.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !client) return null;

  // Use mock detail; in production this would be fetched by client.id
  const detail: ClientDetail = { ...MOCK_DETAIL, id: client.id, status: client.status };

  const TABS: { id: Tab; label: string }[] = [
    { id: "detalhes", label: "Detalhes" },
    { id: "editar", label: "Editar" },
    { id: "extrato", label: "Extrato" },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderInfo}>
            <div className={styles.modalClientName}>{client.company}</div>
            <div className={styles.modalMeta}>
              <span className={`${styles.badge} ${statusBadgeClass(client.status)}`}>{client.status}</span>
              <span className={styles.modalMetaSep}>·</span>
              <span className={styles.modalMetaText}>{client.name}</span>
              <span className={styles.modalMetaSep}>·</span>
              <span className={styles.modalMetaText}>ID #{client.id}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {activeTab === "detalhes" && <TabDetalhes detail={detail} />}
          {activeTab === "editar" && (
            <TabEditar detail={detail} onSave={() => { setSaved(true); setActiveTab("detalhes"); }} />
          )}
          {activeTab === "extrato" && <TabExtrato clientId={client.id} />}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          {activeTab === "editar" ? (
            <>
              <button className={styles.btnSecondary} onClick={() => setActiveTab("detalhes")}>Cancelar</button>
              <button className={styles.btnPrimary} form="clientEditForm" type="submit">Salvar Alterações</button>
            </>
          ) : (
            <>
              {saved && <span className={styles.savedMsg}>✓ Alterações salvas</span>}
              <button className={styles.btnSecondary} onClick={onClose}>Fechar</button>
              <button className={styles.btnPrimary} onClick={() => setActiveTab("editar")}>Editar Cliente</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

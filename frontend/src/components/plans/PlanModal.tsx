"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./PlanModal.module.css";
import { API_URL } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

export const BRANDS = ["MasterCard", "Visa", "Elo", "Hipercard"] as const;

export const INSTALLMENTS_PARCELA = [
  { key: "debito",      label: "Débito" },
  { key: "credito_1x",  label: "Crédito 1x" },
  { key: "credito_2x",  label: "Crédito 2x" },
  { key: "credito_3x",  label: "Crédito 3x" },
  { key: "credito_4x",  label: "Crédito 4x" },
  { key: "credito_5x",  label: "Crédito 5x" },
  { key: "credito_6x",  label: "Crédito 6x" },
  { key: "credito_7x",  label: "Crédito 7x" },
  { key: "credito_8x",  label: "Crédito 8x" },
  { key: "credito_9x",  label: "Crédito 9x" },
  { key: "credito_10x", label: "Crédito 10x" },
  { key: "credito_11x", label: "Crédito 11x" },
  { key: "credito_12x", label: "Crédito 12x" },
] as const;

export const INSTALLMENTS_FAIXA = [
  { key: "debito",        label: "Débito" },
  { key: "credito_1a6",   label: "Crédito 1x a 6x" },
  { key: "credito_7a12",  label: "Crédito 7x a 12x" },
] as const;

// keep a flat list for CSV/import compatibility
export const INSTALLMENTS = INSTALLMENTS_PARCELA;

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatrixMode = "parcela" | "faixa";

export interface Plan {
  id?: number;
  name: string;
  description: string;
  status: "Ativo" | "Inativo";
  pixRate: string;
  saqueRate: string;
  boletoType: "fixed" | "percentage";
  boletoRate: string;
  matrixMode: MatrixMode;
  creditCardRelease: string;
  pixRelease: string;
  boletoRelease: string;
  matrixRates: Record<string, string>;
}

const EMPTY_PLAN: Plan = {
  name: "",
  description: "",
  status: "Ativo",
  pixRate: "0.99",
  saqueRate: "0.00",
  boletoType: "fixed",
  boletoRate: "2.50",
  matrixMode: "parcela",
  creditCardRelease: "d30",
  pixRelease: "24h",
  boletoRelease: "d2",
  matrixRates: {},
};

interface PlanModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (plan: Plan) => void;
}

type Tab = "geral" | "taxas" | "liquidacao";

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanModal({ plan, isOpen, onClose, onSaved }: PlanModalProps) {
  const isEdit = !!plan?.id;
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Plan>(EMPTY_PLAN);

  useEffect(() => {
    if (isOpen) {
      setForm(plan ? { ...plan } : { ...EMPTY_PLAN });
      setActiveTab("geral");
    }
  }, [isOpen, plan]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const set = (field: keyof Plan, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const setMatrix = (brand: string, key: string, value: string) =>
    setForm((p) => ({
      ...p,
      matrixRates: { ...p.matrixRates, [`${brand}_${key}`]: value },
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${API_URL}/plans/${form.id}` : `${API_URL}/plans`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const saved: Plan = res.ok ? await res.json() : { ...form, id: form.id ?? Date.now() };
      onSaved(saved);
      onClose();
    } catch {
      onSaved({ ...form, id: form.id ?? Date.now() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "geral",      label: "Dados Gerais" },
    { id: "taxas",      label: "Taxas" },
    { id: "liquidacao", label: "Liquidação" },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalTitle}>
              {isEdit ? `Editar Plano — ${form.name}` : "Novo Plano"}
            </p>
            <p className={styles.modalSubtitle}>
              {isEdit ? "Altere os dados e salve para atualizar via API." : "Preencha os dados e salve para criar via API."}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

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

        <div className={styles.modalBody}>
          {activeTab === "geral"      && <TabGeral form={form} set={set} />}
          {activeTab === "taxas"      && <TabTaxas form={form} set={set} setMatrix={setMatrix} />}
          {activeTab === "liquidacao" && <TabLiquidacao form={form} set={set} />}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : isEdit ? "Salvar Alterações" : "Criar Plano"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Tab: Dados Gerais ────────────────────────────────────────────────────────

function TabGeral({ form, set }: { form: Plan; set: (f: keyof Plan, v: string) => void }) {
  return (
    <div className={styles.formContent}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionLabel}>Identificação</h3>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label>Nome do Plano</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Taxa Especial VIP"
            />
          </div>
          <div className={styles.field}>
            <label>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Descrição</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ex: Plano para grandes contas — acima de R$ 100k/mês"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Taxas ───────────────────────────────────────────────────────────────

function TabTaxas({
  form,
  set,
  setMatrix,
}: {
  form: Plan;
  set: (f: keyof Plan, v: string) => void;
  setMatrix: (brand: string, key: string, value: string) => void;
}) {
  const installments = form.matrixMode === "faixa" ? INSTALLMENTS_FAIXA : INSTALLMENTS_PARCELA;

  return (
    <div className={styles.formContent}>

      {/* ── Taxas à Vista + Saque ─────────────────────────────────── */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionLabel}>Taxas Operacionais</h3>
        <div className={styles.fieldGridThree}>
          <div className={styles.field}>
            <label>Taxa PIX</label>
            <div className={styles.inputUnit}>
              <input
                type="number" step="0.01" min="0"
                value={form.pixRate}
                onChange={(e) => set("pixRate", e.target.value)}
              />
              <span className={styles.unitSuffix}>%</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>Taxa de Saque</label>
            <div className={styles.inputUnit}>
              <input
                type="number" step="0.01" min="0"
                value={form.saqueRate}
                onChange={(e) => set("saqueRate", e.target.value)}
                placeholder="0.00"
              />
              <span className={styles.unitSuffix}>%</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>Tipo Boleto</label>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${form.boletoType === "fixed" ? styles.toggleBtnActive : ""}`}
                onClick={() => set("boletoType", "fixed")}
              >
                Fixo (R$)
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${form.boletoType === "percentage" ? styles.toggleBtnActive : ""}`}
                onClick={() => set("boletoType", "percentage")}
              >
                % do valor
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label>Valor Boleto</label>
            <div className={styles.inputUnit}>
              <input
                type="number" step="0.01" min="0"
                value={form.boletoRate}
                onChange={(e) => set("boletoRate", e.target.value)}
              />
              <span className={styles.unitSuffix}>{form.boletoType === "fixed" ? "R$" : "%"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modo de Precificação de Cartão ────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.matrixModeHeader}>
          <div>
            <h3 className={styles.sectionLabel}>Matriz de Taxas — Cartão</h3>
          </div>
          <div className={styles.modeSelector}>
            <button
              type="button"
              className={`${styles.modeBtn} ${form.matrixMode === "parcela" ? styles.modeBtnActive : ""}`}
              onClick={() => set("matrixMode", "parcela")}
            >
              <span className={styles.modeBtnIcon}>≡</span>
              Por Parcela
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${form.matrixMode === "faixa" ? styles.modeBtnActive : ""}`}
              onClick={() => set("matrixMode", "faixa")}
            >
              <span className={styles.modeBtnIcon}>◫</span>
              Por Faixa
            </button>
          </div>
        </div>

        <div className={styles.matrixWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th className={styles.rowHeader}>Parcelamento</th>
                {BRANDS.map((b) => <th key={b}>{b}</th>)}
              </tr>
            </thead>
            <tbody>
              {installments.map((inst) => (
                <tr key={inst.key}>
                  <td className={styles.rowHeader}>{inst.label}</td>
                  {BRANDS.map((brand) => {
                    const k = `${brand}_${inst.key}`;
                    return (
                      <td key={k}>
                        <div className={styles.matrixCell}>
                          <input
                            className={styles.matrixInput}
                            type="number" step="0.01" min="0"
                            placeholder="0.00"
                            value={form.matrixRates[k] ?? ""}
                            onChange={(e) => setMatrix(brand, inst.key, e.target.value)}
                          />
                          <span className={styles.matrixPct}>%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─── Tab: Liquidação ──────────────────────────────────────────────────────────

function TabLiquidacao({ form, set }: { form: Plan; set: (f: keyof Plan, v: string) => void }) {
  return (
    <div className={styles.formContent}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionLabel}>Prazos de Liberação de Saldo</h3>
        <div className={styles.fieldGridThree}>
          <div className={styles.field}>
            <label>Cartão de Crédito</label>
            <select value={form.creditCardRelease} onChange={(e) => set("creditCardRelease", e.target.value)}>
              <option value="d30">D+30 — Padrão</option>
              <option value="d15">D+15</option>
              <option value="d7">D+7</option>
              <option value="d2">D+2</option>
              <option value="installments">Conforme parcelas</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>PIX</label>
            <select value={form.pixRelease} onChange={(e) => set("pixRelease", e.target.value)}>
              <option value="instant">Imediato</option>
              <option value="24h">24 Horas</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Boleto</label>
            <select value={form.boletoRelease} onChange={(e) => set("boletoRelease", e.target.value)}>
              <option value="d1">D+1</option>
              <option value="d2">D+2 — Padrão</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionLabel}>Resumo da Configuração</h3>
        <div className={styles.fieldGrid}>
          <InfoLine label="Cartão de Crédito" value={releaseLabelCard(form.creditCardRelease)} />
          <InfoLine label="PIX" value={releaseLabelPix(form.pixRelease)} />
          <InfoLine label="Boleto" value={releaseLabelBoleto(form.boletoRelease)} />
          <InfoLine label="Taxa PIX" value={`${form.pixRate}%`} />
          <InfoLine label="Taxa Saque" value={`${form.saqueRate}%`} />
          <InfoLine
            label="Taxa Boleto"
            value={form.boletoType === "fixed" ? `R$ ${form.boletoRate}` : `${form.boletoRate}%`}
          />
          <InfoLine
            label="Modo Cartão"
            value={form.matrixMode === "parcela" ? "Por Parcela" : "Por Faixa (Déb / 1-6x / 7-12x)"}
          />
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.field} style={{ gap: "0.2rem" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>{value}</span>
    </div>
  );
}

function releaseLabelCard(v: string) {
  const m: Record<string, string> = {
    d30: "D+30 (30 dias)", d15: "D+15 (15 dias)", d7: "D+7 (7 dias)",
    d2: "D+2 (2 dias)", installments: "Conforme parcelas",
  };
  return m[v] ?? v;
}
function releaseLabelPix(v: string) { return v === "instant" ? "Imediato" : "24 Horas"; }
function releaseLabelBoleto(v: string) { return v === "d1" ? "D+1 (1 dia útil)" : "D+2 (2 dias úteis)"; }

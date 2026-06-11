"use client";

import { useState } from "react";
import styles from "./plans.module.css";
import { PlanModal, type Plan } from "@/components/plans/PlanModal";
import { PlanImportModal } from "@/components/plans/PlanImportModal";

// ─── Mock data (replace with API call to GET /plans) ──────────────────────────

const MOCK_PLANS: Plan[] = [
  {
    id: 1,
    name: "Básico",
    description: "Ideal para pequenos negócios",
    status: "Ativo",
    pixRate: "0.99",
    boletoType: "fixed",
    boletoRate: "2.50",
    creditCardRelease: "d30",
    pixRelease: "24h",
    boletoRelease: "d2",
    matrixRates: {
      MasterCard_debito: "1.50", MasterCard_credito_1x: "2.00", MasterCard_credito_2x: "2.10",
      Visa_debito: "1.50", Visa_credito_1x: "2.00", Visa_credito_2x: "2.10",
    },
  },
  {
    id: 2,
    name: "Standard",
    description: "Plano popular — até 20 usuários",
    status: "Ativo",
    pixRate: "0.89",
    boletoType: "fixed",
    boletoRate: "1.99",
    creditCardRelease: "d15",
    pixRelease: "24h",
    boletoRelease: "d2",
    matrixRates: {
      MasterCard_debito: "1.40", MasterCard_credito_1x: "1.90", MasterCard_credito_2x: "2.00",
      Visa_debito: "1.40", Visa_credito_1x: "1.90", Visa_credito_2x: "2.00",
    },
  },
  {
    id: 3,
    name: "Premium (Ilimitado)",
    description: "Grandes contas sem limite de usuários",
    status: "Ativo",
    pixRate: "0.79",
    boletoType: "percentage",
    boletoRate: "1.50",
    creditCardRelease: "d7",
    pixRelease: "instant",
    boletoRelease: "d1",
    matrixRates: {
      MasterCard_debito: "1.30", MasterCard_credito_1x: "1.80", MasterCard_credito_2x: "1.90",
      Visa_debito: "1.30", Visa_credito_1x: "1.80", Visa_credito_2x: "1.90",
    },
  },
];

const LIQUIDACAO_LABEL: Record<string, string> = {
  d30: "D+30", d15: "D+15", d7: "D+7", d2: "D+2", instant: "Imediato", installments: "Por parcela",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [modalPlan, setModalPlan]  = useState<Plan | null>(null);
  const [isNewOpen,  setIsNewOpen]  = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const openNew  = () => { setModalPlan(null); setIsNewOpen(true); };
  const openEdit = (plan: Plan) => { setModalPlan(plan); setIsNewOpen(true); };

  const handleSaved = (saved: Plan) => {
    setPlans((prev) =>
      saved.id && prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved]
    );
  };

  const toggleStatus = (id: number) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "Ativo" ? "Inativo" : "Ativo" } : p
      )
    );
  };

  const ativos   = plans.filter((p) => p.status === "Ativo").length;
  const inativos = plans.filter((p) => p.status === "Inativo").length;

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="title">Planos e Liquidação</h1>
          <p className="subtitle">Gerencie planos de cobrança, taxas por bandeira/parcelamento e prazos de liquidação.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnImport} onClick={() => setIsImportOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Importar Planilha
          </button>
          <button className={styles.btnAdd} onClick={openNew}>
            <span className={styles.iconPlus}>+</span> Novo Plano
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Total de Planos</p>
          <div className={styles.statValue}>{plans.length}</div>
          <div className={styles.statMeta}>planos cadastrados</div>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Planos Ativos</p>
          <div className={`${styles.statValue} ${styles.statValuePositive}`}>{ativos}</div>
          <div className={styles.statMeta}>disponíveis para clientes</div>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Planos Inativos</p>
          <div className={`${styles.statValue} ${styles.statValueMuted}`}>{inativos}</div>
          <div className={styles.statMeta}>desativados ou em revisão</div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Plano</th>
                <th>Descrição</th>
                <th>Taxa PIX</th>
                <th>Taxa Boleto</th>
                <th>Liquidação Cartão</th>
                <th>Status</th>
                <th className={styles.textRight}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className={styles.fontWeightMedium}>{plan.name}</td>
                  <td className={styles.textMuted}>{plan.description}</td>
                  <td>{plan.pixRate}%</td>
                  <td>
                    {plan.boletoType === "fixed"
                      ? `R$ ${plan.boletoRate} (fixo)`
                      : `${plan.boletoRate}% (var.)`}
                  </td>
                  <td>{LIQUIDACAO_LABEL[plan.creditCardRelease] ?? plan.creditCardRelease}</td>
                  <td>
                    <span className={`${styles.badge} ${plan.status === "Ativo" ? styles.badgeActive : styles.badgeInactive}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.btnAction} onClick={() => openEdit(plan)}>
                      Editar
                    </button>
                    <button
                      className={`${styles.btnAction} ${plan.status === "Ativo" ? styles.btnDanger : styles.btnSuccess}`}
                      onClick={() => toggleStatus(plan.id!)}
                    >
                      {plan.status === "Ativo" ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {plans.length === 0 && (
            <div className={styles.emptyState}>
              Nenhum plano cadastrado. Clique em &quot;Novo Plano&quot; para começar.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PlanModal
        plan={modalPlan}
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onSaved={handleSaved}
      />
      <PlanImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={(count) => {
          setIsImportOpen(false);
          alert(`${count} plano(s) importado(s) com sucesso!`);
        }}
      />
    </div>
  );
}

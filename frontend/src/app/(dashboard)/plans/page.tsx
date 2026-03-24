"use client";

import Link from 'next/link';
import styles from './plans.module.css';

// MOCK DATA: Simulating available pricing plans
const MOCK_PLANS = [
  { id: 1, name: 'Básico', description: 'Até 5 usuários', pixRate: '0.99%', boletoRate: 'R$ 2,50', status: 'Ativo' },
  { id: 2, name: 'Standard', description: 'Plano popular (20 usuários)', pixRate: '0.89%', boletoRate: 'R$ 1,99', status: 'Ativo' },
  { id: 3, name: 'Premium (Ilimitado)', description: 'Grandes contas', pixRate: '0.79%', boletoRate: '1.50%', status: 'Ativo' },
];

export default function PlansListPage() {
  return (
    <div className={styles.plansContainer}>
      <div className={styles.header}>
        <div>
          <h1 className="title">Planos e Taxas de Liquidação</h1>
          <p className="subtitle">Gerencie os planos de assinatura e as taxas customizadas (Cartão, PIX, Boleto) aplicadas a cada cliente.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/plans/new" className={styles.btnAdd} style={{ textDecoration: 'none' }}>
            <span className={styles.iconPlus}>+</span> Novo Plano
          </Link>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Plano</th>
                <th>Descrição</th>
                <th>Taxa PIX</th>
                <th>Taxa Boleto</th>
                <th>Status</th>
                <th className={styles.textRight}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PLANS.map((plan) => (
                <tr key={plan.id}>
                  <td className={styles.fontWeightMedium}>{plan.name}</td>
                  <td className={styles.textMuted}>{plan.description}</td>
                  <td>{plan.pixRate}</td>
                  <td>{plan.boletoRate}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${plan.status === 'Ativo' ? styles.statusActive : styles.statusInactive}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.btnAction} title="Ver Detalhes/Editar">✏️</button>
                    <button className={styles.btnAction} title="Desativar">🚫</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {MOCK_PLANS.length === 0 && (
             <div className={styles.emptyState}>
               Nenhum plano cadastrado ainda. Clique em &quot;Novo Plano&quot; para começar.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

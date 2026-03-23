import styles from "./page.module.css";

// MOCK DATA: These will be replaced by API calls in Phase 2
const STATS_CARDS = [
  { title: "Total de Usuários", value: "1,245", trend: "+12.5%", isPositive: true },
  { title: "Usuários Ativos (Hoje)", value: "342", trend: "+5.2%", isPositive: true },
  { title: "Novos Cadastros", value: "48", trend: "-2.4%", isPositive: false },
  { title: "Receita (Este mês)", value: "R$ 45.200", trend: "+18.1%", isPositive: true },
];

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className="title">Visão Geral</h1>
        <p className="subtitle">Bem-vindo de volta! Aqui está o resumo de hoje.</p>
      </div>

      <div className={styles.statsGrid}>
        {STATS_CARDS.map((stat, idx) => (
          <div key={idx} className="card">
            <h3 className={styles.cardTitle}>{stat.title}</h3>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>{stat.value}</span>
              <span className={`${styles.cardTrend} ${stat.isPositive ? styles.trendUp : styles.trendDown}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recentGrid}>
        <div className="card">
          <h2 className="title">Últimas Atividades</h2>
          <p className="subtitle">Usuários recentemente cadastrados no sistema.</p>
          {/* MOCK TABLE: Will be extracted to a component later */}
          <table className={styles.mockTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>João Silva</td>
                <td>joao.silva@email.com</td>
                <td><span className={styles.statusActive}>Ativo</span></td>
                <td>12 Mar 2026</td>
              </tr>
              <tr>
                <td>Maria Oliveira</td>
                <td>maria.ol@email.com</td>
                <td><span className={styles.statusPending}>Pendente</span></td>
                <td>12 Mar 2026</td>
              </tr>
              <tr>
                <td>Carlos Souza</td>
                <td>csouza@email.com</td>
                <td><span className={styles.statusActive}>Ativo</span></td>
                <td>11 Mar 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


import re

with open(r'c:\Users\PabliitoxD\.gemini\antigravity\scratch\backoffice\frontend\src\app\(dashboard)\financial\statement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for Modal
state_code = """  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VENDAS' | 'WITHDRAWALS' | 'CHARGEBACKS'>('ALL');
  const [startDate, setStartDate] = useState(currentMonthRange.start);
  const [endDate, setEndDate] = useState(currentMonthRange.end);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTabModal, setActiveTabModal] = useState<'geral' | 'historico' | 'taxas'>('geral');

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTxId(null);
  };
"""
content = re.sub(r"  const \[statement, setStatement\](.*?)\n  const \[searchQuery, setSearchQuery\] = useState\(''\);", state_code, content, flags=re.DOTALL)

# Add imports
imports_code = """import { useRouter } from 'next/navigation';
import styles from '../financial.module.css';
import modalStyles from '../../transactions/transactions.module.css';
import { API_URL } from '@/lib/api';"""
content = re.sub(r"import { useRouter } from 'next/navigation';\nimport styles from '\.\./financial\.module\.css';\nimport { API_URL } from '@\/lib\/api';", imports_code, content)

# Change Detalhes button
btn_code = """                              router.push('/financial/chargebacks');
                            } else {
                              setSelectedTxId(item.id);
                              setActiveTabModal('geral');
                              setIsModalOpen(true);
                            }"""
content = re.sub(r"                              router\.push\('/financial/chargebacks'\);\n                            \} else \{\n                              router\.push\('/transactions'\);\n                            \}", btn_code, content)

# Status Badge Config and renderTabContent
badge_and_render_code = """
  const getStatusBadgeConfig = (status: string) => {
    switch(status) {
      case 'APPROVED': return { className: modalStyles.statusApproved, label: 'Aprovada' };
      case 'COMPLETED': return { className: modalStyles.statusCompleted, label: 'Finalizada' };
      case 'WAITING': return { className: modalStyles.statusWaiting, label: 'Aguardando Pagamento' };
      case 'REFUSED': return { className: modalStyles.statusRefused, label: 'Recusada (Fraude)' };
      case 'NOT_COMPLETED': return { className: modalStyles.statusNotCompleted, label: 'Dados Inválidos' };
      case 'REVERSED': return { className: modalStyles.statusReversed, label: 'Estornada' };
      case 'CHARGEBACK': return { className: modalStyles.statusChargeback, label: 'Chargeback' };
      default: return { className: '', label: status };
    }
  };

  const selectedTx = statement.find(t => t.id === selectedTxId);

  const renderTabContent = () => {
    if (!selectedTx) return null;

    const txDate = new Date(selectedTx.date);
    const dateStr = txDate.toLocaleDateString('pt-BR') + ' às ' + txDate.toLocaleTimeString('pt-BR').substring(0, 5);

    if (activeTabModal === 'geral') {
      return (
        <>
          <div className={modalStyles.detailGrid}>
            <span className={modalStyles.detailLabel}>Cliente</span>
            <span className={modalStyles.detailValue}>Não detalhado no extrato</span>
            <span className={modalStyles.detailLabel}>Gênero</span>
            <span className={modalStyles.detailValue}>---</span>
            <span className={modalStyles.detailLabel}>Tipo</span>
            <span className={modalStyles.detailValue}>---</span>
            <span className={modalStyles.detailLabel}>CPF</span>
            <span className={modalStyles.detailValue}>---</span>
            <span className={modalStyles.detailLabel}>E-mail</span>
            <span className={modalStyles.detailValue}>---</span>
            <span className={modalStyles.detailLabel}>Telefone</span>
            <span className={modalStyles.detailValue}>---</span>
          </div>

          <div className={modalStyles.productSection}>
            <div className={modalStyles.productInfo}>
              <div style={{ fontSize: '2rem' }}>📦</div>
              <div className={modalStyles.productDesc}>
                <span className={modalStyles.productCode}>Código: #{selectedTx.id.split('-')[1] || selectedTx.id}</span>
                <span className={modalStyles.productName}>{selectedTx.description}</span>
              </div>
            </div>
            <div className={modalStyles.productPrice}>{formatCurrency(Math.abs(selectedTx.amount))}</div>
          </div>

          <div className={modalStyles.detailGrid}>
            <span className={modalStyles.detailLabel}>Data do pedido</span>
            <span className={modalStyles.detailValue}>{dateStr}</span>
            <span className={modalStyles.detailLabel}>Total dos itens (+)</span>
            <span className={modalStyles.detailValue}>{formatCurrency(Math.abs(selectedTx.amount))}</span>
            <span className={modalStyles.detailLabel}>Valor da venda (=)</span>
            <span className={modalStyles.detailValueBold}>{formatCurrency(Math.abs(selectedTx.amount))}</span>
            <span className={modalStyles.detailLabel}>Meio de pagamento</span>
            <span className={modalStyles.detailValue}>{selectedTx.method || 'Não informado'}</span>
            <span className={modalStyles.detailLabel}>Condição de pagamento</span>
            <span className={modalStyles.detailValue}>{selectedTx.installments || 'À vista'}</span>
          </div>
        </>
      );
    }

    if (activeTabModal === 'historico') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Histórico de status da venda
            </h3>
            <div>
              <table className={`${modalStyles.table} ${modalStyles.modalTable}`}>
                <thead>
                  <tr>
                    <th className={modalStyles.tableHeaderLight}>Data ↑↓</th>
                    <th className={modalStyles.tableHeaderLight}>Status</th>
                    <th className={modalStyles.tableHeaderLight} style={{ width: '100%' }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: 'transparent' }}>
                    <td className={modalStyles.textMuted}>{dateStr}</td>
                    <td><span className={`${modalStyles.statusBadge} ${getStatusBadgeConfig(selectedTx.status).className}`}>{getStatusBadgeConfig(selectedTx.status).label}</span></td>
                    <td className={modalStyles.textMuted}>Movimentação registrada e confirmada.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTabModal === 'taxas') {
      const netValue = Math.abs(selectedTx.impact);
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p className={modalStyles.textMuted}>
            Veja abaixo as taxas e os valores de cada participante da venda:
          </p>
          <table className={`${modalStyles.feesTable} ${modalStyles.modalTable}`}>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total pago pelo comprador:</td>
                <td className={modalStyles.textMuted}>{formatCurrency(Math.abs(selectedTx.amount))}</td>
              </tr>
              <tr>
                <td>Valor da venda sem taxas e impostos:</td>
                <td className={modalStyles.textMuted}>{formatCurrency(Math.abs(selectedTx.amount))}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Valor base para cálculo de comissões:</td>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(Math.abs(selectedTx.amount))}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#10b981' }}>Sua comissão: (após taxas produtor)</td>
                <td style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>{formatCurrency(netValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
"""
content = content.replace("  return (", badge_and_render_code)

# Add Modal HTML at the end inside the main container
modal_html = """
      {isModalOpen && selectedTx && (
        <div className={modalStyles.modalOverlay} onClick={closeModal}>
          <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h2>Detalhes da venda #{selectedTx.id}</h2>
              <button className={modalStyles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <div className={modalStyles.modalBody}>
              <div className={modalStyles.tabs}>
                <button 
                  className={`${modalStyles.tab} ${activeTabModal === 'geral' ? modalStyles.tabActive : ''}`}
                  onClick={() => setActiveTabModal('geral')}
                >
                  Geral
                </button>
                <button 
                  className={`${modalStyles.tab} ${activeTabModal === 'historico' ? modalStyles.tabActive : ''}`}
                  onClick={() => setActiveTabModal('historico')}
                >
                  Histórico
                </button>
                <button 
                  className={`${modalStyles.tab} ${activeTabModal === 'taxas' ? modalStyles.tabActive : ''}`}
                  onClick={() => setActiveTabModal('taxas')}
                >
                  Taxas e comissões
                </button>
              </div>

              {renderTabContent()}

            </div>

            <div className={modalStyles.modalFooter}>
              <button className={modalStyles.btnCloseModal} onClick={closeModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""
content = re.sub(r"    </div>\n  \);\n\}", modal_html, content)

with open(r'c:\Users\PabliitoxD\.gemini\antigravity\scratch\backoffice\frontend\src\app\(dashboard)\financial\statement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './clientEdit.module.css';
import { useState } from 'react';

const MOCK_CLIENT = {
  id: 1,
  status: 'Pendente',
  fullName: 'João Silva',
  cpf: '123.456.789-00',
  birthDate: '1985-06-15',
  isPep: false,
  pepPersons: [] as { nome: string; cpf: string }[],
  responsibleName: 'João Silva',
  responsibleEmail: 'joao.silva@email.com',
  responsiblePhone: '(11) 98765-4321',
  cnpj: '12.345.678/0001-90',
  companyName: 'Acme Corp Finance',
  tradingName: 'Acme Corp',
  cnae: '4711302',
  mcc: '5411',
  mccLabel: 'Supermercados e Mercearias',
  pixKey: 'joao.silva@email.com',
  bankName: 'Banco do Brasil',
  bankAgency: '1234',
  bankAccount: '56789-0',
  bankAccountType: 'CC',
  zipCode: '01001-000',
  street: 'Praça da Sé',
  number: '1',
  complement: 'Lado ímpar',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  planId: 2 as number | string,
  customLiquidationRate: 1.5,
};

const SYSTEM_PLANS = [
  { id: 1, name: 'Básico',              description: 'Até 5 usuários',            pixRate: '0.99%', boletoRate: 'R$ 2,50',  type: 'system' },
  { id: 2, name: 'Standard',            description: 'Plano popular (20 usuários)',pixRate: '0.89%', boletoRate: 'R$ 1,99',  type: 'system' },
  { id: 3, name: 'Premium (Ilimitado)', description: 'Grandes contas',             pixRate: '0.79%', boletoRate: '1.50%',    type: 'system' },
  { id: 'custom', name: 'Personalizado',description: 'Taxas configuradas manualmente', pixRate: 'Sob Consulta', boletoRate: 'Sob Consulta', type: 'custom' },
];

type Tab = 'dados' | 'plano' | 'bancario';

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  const [tab, setTab] = useState<Tab>('dados');
  const [formData, setFormData] = useState({ ...MOCK_CLIENT });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating client:', formData);
    alert('Informações do cliente atualizadas com sucesso!');
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'dados',    label: 'Dados Cadastrais' },
    { id: 'plano',    label: 'Plano Operacional' },
    { id: 'bancario', label: 'Dados Bancários' },
  ];

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Editar Cliente: {formData.companyName}</h1>
            <span className={`${styles.statusBadge} ${formData.status === 'Ativo' ? styles.statusActive : formData.status === 'Pendente' ? styles.statusPending : styles.statusInactive}`}>
              {formData.status}
            </span>
          </div>
          <p className={styles.subtitle}>ID do Cliente: #{id}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/clients" className={styles.btnBack}>Cancelar</Link>
          <button type="submit" form="editClientForm" className={styles.btnSave}>Salvar Alterações</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form id="editClientForm" onSubmit={handleSubmit} className={styles.formGrid}>

        {/* ── ABA: DADOS CADASTRAIS ── */}
        {tab === 'dados' && (
          <>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Status do Cadastro</h2>
              <div className={styles.inputGroup}>
                <div className={styles.field}>
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Ativo">Ativo</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Dados Empresariais</h2>
              <div className={styles.inputGroup}>
                <div className={styles.field}>
                  <label>CNPJ</label>
                  <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Razão Social</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome Fantasia</label>
                  <input type="text" name="tradingName" value={formData.tradingName} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label>CNAE Principal</label>
                  <input type="text" name="cnae" value={formData.cnae} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label>MCC — Código de Categoria</label>
                  <input type="text" name="mcc" value={formData.mcc} onChange={handleChange} />
                  {formData.mccLabel && <span className={styles.fieldHint}>{formData.mccLabel}</span>}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Dados Pessoais do Sócio/Proprietário</h2>
              <div className={styles.inputGroup}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome Completo</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>CPF</label>
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Data de Nascimento</label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" name="isPep" checked={formData.isPep} onChange={handleChange} className={styles.checkbox} />
                    <span>
                      PEP — Pessoa Exposta Politicamente{' '}
                      <small style={{ fontWeight: 400, fontSize: '0.82em', opacity: 0.7 }}>
                        (cargo público, mandato ou função de relevância nos últimos 5 anos)
                      </small>
                    </span>
                  </label>
                </div>
                {formData.isPep && (
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <label style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', color: '#ef4444' }}>
                        Pessoas Expostas Politicamente
                      </label>
                      <button
                        type="button"
                        className={styles.btnAddPep}
                        onClick={() => setFormData(f => ({ ...f, pepPersons: [...f.pepPersons, { nome: '', cpf: '' }] }))}
                      >
                        + Adicionar Pessoa
                      </button>
                    </div>
                    {formData.pepPersons.map((p, i) => (
                      <div key={i} className={styles.pepPersonEntry}>
                        <div className={styles.field}>
                          <label>Nome Completo *</label>
                          <input
                            type="text"
                            value={p.nome}
                            onChange={e => setFormData(f => {
                              const updated = f.pepPersons.map((x, idx) => idx === i ? { ...x, nome: e.target.value } : x);
                              return { ...f, pepPersons: updated };
                            })}
                            placeholder="Nome da pessoa exposta"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label>CPF *</label>
                          <input
                            type="text"
                            value={p.cpf}
                            onChange={e => setFormData(f => {
                              const updated = f.pepPersons.map((x, idx) => idx === i ? { ...x, cpf: e.target.value } : x);
                              return { ...f, pepPersons: updated };
                            })}
                            placeholder="000.000.000-00"
                            style={{ fontFamily: 'monospace' }}
                            required
                          />
                        </div>
                        {formData.pepPersons.length > 1 && (
                          <button
                            type="button"
                            className={styles.btnRemovePep}
                            onClick={() => setFormData(f => ({ ...f, pepPersons: f.pepPersons.filter((_, idx) => idx !== i) }))}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.pepPersons.length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Nenhuma pessoa adicionada. Clique em &quot;+ Adicionar Pessoa&quot; para incluir.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Dados do Usuário Responsável</h2>
              <div className={styles.inputGroup}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome do Responsável</label>
                  <input type="text" name="responsibleName" value={formData.responsibleName} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>E-mail</label>
                  <input type="email" name="responsibleEmail" value={formData.responsibleEmail} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Telefone / Celular</label>
                  <input type="tel" name="responsiblePhone" value={formData.responsiblePhone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Localização</h2>
              <div className={styles.inputGroup}>
                <div className={styles.field}>
                  <label>CEP</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Endereço / Logradouro</label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Número</label>
                  <input type="text" name="number" value={formData.number} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Complemento</label>
                  <input type="text" name="complement" value={formData.complement} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label>Bairro</label>
                  <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Cidade</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Estado (UF)</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} maxLength={2} required />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── ABA: PLANO OPERACIONAL ── */}
        {tab === 'plano' && (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Plano Operacional e Liquidação</h2>
            <p className={styles.sectionDesc}>Configure o plano de assinatura do cliente e a taxa padrão de liquidação para transações.</p>
            <div className={styles.inputGroup}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label>Plano Vinculado</label>
                <select
                  name="planId"
                  value={formData.planId}
                  onChange={e => setFormData(prev => ({ ...prev, planId: e.target.value === 'custom' ? 'custom' : Number(e.target.value) }))}
                  required
                >
                  <option value="" disabled>Selecione um plano...</option>
                  {SYSTEM_PLANS.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}{plan.type === 'system' ? ` (${plan.pixRate} PIX / ${plan.boletoRate} Boleto)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {formData.planId === 'custom' && (
                <div className={styles.field} style={{ flex: 1 }}>
                  <label>Taxa de Liquidação Exclusiva (Cartão)</label>
                  <div className={styles.inputWithSymbol}>
                    <input
                      type="number"
                      step="0.01"
                      name="customLiquidationRate"
                      value={formData.customLiquidationRate}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.symbol}>%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA: DADOS BANCÁRIOS ── */}
        {tab === 'bancario' && (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dados Bancários e PIX</h2>
            <div className={styles.inputGroup}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Chave PIX</label>
                <input type="text" name="pixKey" value={formData.pixKey} onChange={handleChange} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" />
              </div>
              <div className={styles.field}>
                <label>Banco</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Ex: Banco do Brasil, Itaú..." />
              </div>
              <div className={styles.field}>
                <label>Tipo de Conta</label>
                <select name="bankAccountType" value={formData.bankAccountType} onChange={handleChange}>
                  <option value="CC">Conta Corrente</option>
                  <option value="CP">Conta Poupança</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Agência</label>
                <input type="text" name="bankAgency" value={formData.bankAgency} onChange={handleChange} placeholder="0000" />
              </div>
              <div className={styles.field}>
                <label>Número da Conta</label>
                <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="00000-0" />
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './newClient.module.css';
import { resolveMcc } from '@/lib/cnae-mcc';

interface ClientFormData {
  status: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  isPep: boolean;
  pepPersons: { nome: string; cpf: string }[];
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  cnpj: string;
  companyName: string;
  tradingName: string;
  cnae: string;
  mcc: string;
  mccLabel: string;
  pixKey: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  bankAccountType: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const [isSearchingCNPJ, setIsSearchingCNPJ] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [cnpjSuccess, setCnpjSuccess] = useState('');

  const [formData, setFormData] = useState<ClientFormData>({
    status: 'active',
    fullName: '',
    cpf: '',
    birthDate: '',
    isPep: false,
    pepPersons: [] as { nome: string; cpf: string }[],
    responsibleName: '',
    responsibleEmail: '',
    responsiblePhone: '',
    cnpj: '',
    companyName: '',
    tradingName: '',
    cnae: '',
    mcc: '',
    mccLabel: '',
    pixKey: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    bankAccountType: 'CC',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCNPJSearch = async () => {
    setCnpjError('');
    setCnpjSuccess('');
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      setCnpjError('O CNPJ deve conter 14 dígitos válidos.');
      return;
    }

    setIsSearchingCNPJ(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado.');
      const data = await response.json();

      const isActive = data.descricao_situacao_cadastral === 'ATIVA';
      if (!isActive) {
        setCnpjError(`Atenção: Situação do CNPJ é ${data.descricao_situacao_cadastral}.`);
      } else {
        setCnpjSuccess('CNPJ Ativo e Validado com Sucesso!');
      }

      const cnaeCode = String(data.cnae_fiscal ?? '');
      const mccResult = resolveMcc(cnaeCode);

      setFormData(prev => ({
        ...prev,
        companyName: data.razao_social || '',
        tradingName: data.nome_fantasia || data.razao_social || '',
        cnae: cnaeCode,
        mcc: mccResult?.mcc ?? '',
        mccLabel: mccResult?.label ?? '',
        zipCode: data.cep || prev.zipCode,
        street: data.logradouro || prev.street,
        number: data.numero || prev.number,
        complement: data.complemento || prev.complement,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.municipio || prev.city,
        state: data.uf || prev.state,
      }));
    } catch {
      setCnpjError('Erro ao consultar o CNPJ. Verifique o número e tente novamente.');
    } finally {
      setIsSearchingCNPJ(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting new client:', formData);
    alert('Cliente cadastrado com sucesso!');
    router.push('/clients');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cadastrar Novo Cliente</h1>
          <p className={styles.subtitle}>Preencha os dados manualmente para registrar um cliente no sistema.</p>
        </div>
        <Link href="/clients" className={styles.btnBack}>← Voltar</Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>

        {/* Status */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Status do Cadastro</h2>
          <div className={styles.inputGroup}>
            <div className={styles.field}>
              <label>Status Inicial</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Company Data */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados Empresariais</h2>
          <div className={styles.inputGroup}>
            <div className={styles.field}>
              <label>CNPJ</label>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  required
                />
                <button
                  type="button"
                  className={styles.btnSearch}
                  onClick={handleCNPJSearch}
                  disabled={isSearchingCNPJ || formData.cnpj.replace(/\D/g, '').length < 14}
                >
                  {isSearchingCNPJ ? 'Consultando...' : 'Buscar'}
                </button>
              </div>
              {cnpjError && <span className={styles.errorMessage}>{cnpjError}</span>}
              {cnpjSuccess && <span className={styles.successMessage}>{cnpjSuccess}</span>}
              <span className={styles.fieldHint}>Busque o CNPJ para validar e preencher os dados automaticamente.</span>
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
              <input type="text" name="cnae" value={formData.cnae} onChange={handleChange} placeholder="Preenchido automaticamente" readOnly={!!formData.cnae} />
            </div>

            <div className={styles.field}>
              <label>MCC — Código de Categoria</label>
              <div className={styles.mccWrapper}>
                <input type="text" name="mcc" value={formData.mcc} onChange={handleChange} placeholder="—" />
                {formData.mccLabel && <span className={styles.mccLabel}>{formData.mccLabel}</span>}
              </div>
              {!formData.mcc && formData.cnae && (
                <span className={styles.fieldHint}>CNAE não mapeado. Informe o MCC manualmente.</span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Data */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados Pessoais do Sócio/Proprietário</h2>
          <div className={styles.inputGroup}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Nome Completo</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label>CPF</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" required />
            </div>
            <div className={styles.field}>
              <label>Data de Nascimento</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isPep"
                  checked={formData.isPep}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
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

        {/* Responsible User Data */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados do Usuário Responsável</h2>
          <div className={styles.inputGroup}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Nome do Responsável de Contato</label>
              <input type="text" name="responsibleName" value={formData.responsibleName} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label>E-mail do Responsável</label>
              <input type="email" name="responsibleEmail" value={formData.responsibleEmail} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label>Telefone / Celular</label>
              <input type="tel" name="responsiblePhone" value={formData.responsiblePhone} onChange={handleChange} placeholder="(00) 00000-0000" required />
            </div>
          </div>
        </div>

        {/* Banking Data */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados Bancários</h2>
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

        {/* Location */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Localização</h2>
          <div className={styles.inputGroup}>
            <div className={styles.field}>
              <label>CEP</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="00000-000" required />
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

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={() => router.push('/clients')}>Cancelar</button>
          <button type="submit" className={styles.btnSubmit}>Salvar e Cadastrar</button>
        </div>
      </form>
    </div>
  );
}

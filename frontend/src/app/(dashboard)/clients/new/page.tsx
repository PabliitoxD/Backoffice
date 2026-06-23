"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './newClient.module.css';
import { resolveMcc } from '@/lib/cnae-mcc';

// ─── Bank list ────────────────────────────────────────────────────────────────

const BANKS = [
  { code: '001', name: '001 - Banco do Brasil' },
  { code: '003', name: '003 - Banco da Amazônia' },
  { code: '004', name: '004 - Banco do Nordeste' },
  { code: '021', name: '021 - Banestes' },
  { code: '025', name: '025 - Banco Alfa' },
  { code: '033', name: '033 - Santander' },
  { code: '036', name: '036 - Banco BBI' },
  { code: '041', name: '041 - Banrisul' },
  { code: '047', name: '047 - Banese' },
  { code: '070', name: '070 - BRB' },
  { code: '077', name: '077 - Banco Inter' },
  { code: '085', name: '085 - Ailos' },
  { code: '097', name: '097 - Credisis' },
  { code: '104', name: '104 - Caixa Econômica Federal' },
  { code: '136', name: '136 - Unicred' },
  { code: '197', name: '197 - Stone' },
  { code: '208', name: '208 - BTG Pactual' },
  { code: '212', name: '212 - Banco Original' },
  { code: '218', name: '218 - BS2' },
  { code: '237', name: '237 - Bradesco' },
  { code: '260', name: '260 - Nubank' },
  { code: '290', name: '290 - PagBank' },
  { code: '301', name: '301 - PJBank' },
  { code: '318', name: '318 - Banco BMG' },
  { code: '323', name: '323 - Mercado Pago' },
  { code: '336', name: '336 - C6 Bank' },
  { code: '341', name: '341 - Itaú' },
  { code: '348', name: '348 - XP Investimentos' },
  { code: '356', name: '356 - Banco Real' },
  { code: '389', name: '389 - Banco Mercantil do Brasil' },
  { code: '399', name: '399 - Kirton Bank' },
  { code: '422', name: '422 - Banco Safra' },
  { code: '456', name: '456 - Banco MUFG Brasil' },
  { code: '461', name: '461 - Asaas' },
  { code: '473', name: '473 - Banco Caixa Geral' },
  { code: '505', name: '505 - Banco Credit Suisse' },
  { code: '600', name: '600 - Banco Luso Brasileiro' },
  { code: '604', name: '604 - Banco Industrial do Brasil' },
  { code: '611', name: '611 - Banco Paulista' },
  { code: '623', name: '623 - Banco Pan' },
  { code: '633', name: '633 - Banco Rendimento' },
  { code: '637', name: '637 - Banco Sofisa' },
  { code: '643', name: '643 - Banco Pine' },
  { code: '707', name: '707 - Banco Daycoval' },
  { code: '735', name: '735 - Neon' },
  { code: '739', name: '739 - BCO Cetelem' },
  { code: '745', name: '745 - Citibank' },
  { code: '748', name: '748 - Sicredi' },
  { code: '756', name: '756 - Sicoob' },
];

const ANNUAL_REVENUE_OPTIONS = [
  'Até R$ 50.000,00',
  'R$ 50.000 a R$ 150.000',
  'R$ 150.000 a R$ 300.000',
  'R$ 300.000 a R$ 500.000',
  'R$ 500.000 a R$ 1.000.000',
  'Acima de R$ 1.000.000,00',
  'Não tenho faturamento ainda',
];

const MONTHLY_INCOME_OPTIONS = [
  'Até R$ 5.000',
  'R$ 5.000 a R$ 15.000',
  'R$ 15.000 a R$ 25.000',
  'R$ 25.000 a R$ 50.000',
  'Acima de R$ 50.000',
  'Não tenho renda ainda',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientFormData {
  // Dados Empresa
  tradingName: string;
  companyName: string;
  companyEmail: string;
  cnpj: string;
  website: string;
  annualRevenue: string;
  businessDescription: string;
  salesChannels: string[];

  // Endereço Empresa
  companyZip: string;
  companyStreet: string;
  companyNumber: string;
  companyComplement: string;
  companyNeighborhood: string;
  companyCity: string;
  companyState: string;
  companyReference: string;

  // Telefone Empresa
  companyPhoneType: string;
  companyPhoneDdd: string;
  companyPhoneNumber: string;

  // Dados Representante Legal
  repName: string;
  repEmail: string;
  repCpf: string;
  repMotherName: string;
  repBirthDate: string;
  repMonthlyIncome: string;
  repOccupation: string;

  // Endereço Representante
  repZip: string;
  repStreet: string;
  repNumber: string;
  repComplement: string;
  repNeighborhood: string;
  repCity: string;
  repState: string;
  repReference: string;

  // Telefone Representante
  repPhoneType: string;
  repPhoneDdd: string;
  repPhoneNumber: string;

  // Conta Bancária PJ
  bankName: string;
  bankAgency: string;
  bankAgencyDigit: string;
  bankAccount: string;
  bankAccountDigit: string;
  bankAccountType: string;
  bankAccountName: string;
  bankReceiverType: string;
  bankDocument: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewClientPage() {
  const router = useRouter();

  const [isSearchingCNPJ, setIsSearchingCNPJ] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [cnpjSuccess, setCnpjSuccess] = useState('');

  const [isSearchingCompanyZip, setIsSearchingCompanyZip] = useState(false);
  const [companyZipError, setCompanyZipError] = useState('');

  const [isSearchingRepZip, setIsSearchingRepZip] = useState(false);
  const [repZipError, setRepZipError] = useState('');

  const [formData, setFormData] = useState<ClientFormData>({
    tradingName: '',
    companyName: '',
    companyEmail: '',
    cnpj: '',
    website: '',
    annualRevenue: '',
    businessDescription: '',
    salesChannels: [],

    companyZip: '',
    companyStreet: '',
    companyNumber: '',
    companyComplement: '',
    companyNeighborhood: '',
    companyCity: '',
    companyState: '',
    companyReference: '',

    companyPhoneType: 'Celular',
    companyPhoneDdd: '',
    companyPhoneNumber: '',

    repName: '',
    repEmail: '',
    repCpf: '',
    repMotherName: '',
    repBirthDate: '',
    repMonthlyIncome: '',
    repOccupation: '',

    repZip: '',
    repStreet: '',
    repNumber: '',
    repComplement: '',
    repNeighborhood: '',
    repCity: '',
    repState: '',
    repReference: '',

    repPhoneType: 'Celular',
    repPhoneDdd: '',
    repPhoneNumber: '',

    bankName: '',
    bankAgency: '',
    bankAgencyDigit: '',
    bankAccount: '',
    bankAccountDigit: '',
    bankAccountType: 'Conta corrente',
    bankAccountName: '',
    bankReceiverType: 'Pessoa Juridica',
    bankDocument: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSalesChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      salesChannels: prev.salesChannels.includes(channel)
        ? prev.salesChannels.filter(c => c !== channel)
        : [...prev.salesChannels, channel],
    }));
  };

  // ── CNPJ search ──

  const handleCNPJSearch = async () => {
    setCnpjError('');
    setCnpjSuccess('');
    const clean = formData.cnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjError('O CNPJ deve conter 14 dígitos válidos.');
      return;
    }
    setIsSearchingCNPJ(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      const active = data.descricao_situacao_cadastral === 'ATIVA';
      if (!active) {
        setCnpjError(`Atenção: situação do CNPJ é ${data.descricao_situacao_cadastral}.`);
      } else {
        setCnpjSuccess('CNPJ ativo e validado com sucesso!');
      }

      setFormData(prev => ({
        ...prev,
        companyName: data.razao_social || prev.companyName,
        tradingName: data.nome_fantasia || data.razao_social || prev.tradingName,
        companyZip: data.cep || prev.companyZip,
        companyStreet: data.logradouro || prev.companyStreet,
        companyNumber: data.numero || prev.companyNumber,
        companyComplement: data.complemento || prev.companyComplement,
        companyNeighborhood: data.bairro || prev.companyNeighborhood,
        companyCity: data.municipio || prev.companyCity,
        companyState: data.uf || prev.companyState,
      }));
    } catch {
      setCnpjError('Erro ao consultar o CNPJ. Verifique o número e tente novamente.');
    } finally {
      setIsSearchingCNPJ(false);
    }
  };

  // ── CEP search (generic) ──

  const searchCep = async (
    cep: string,
    setLoading: (v: boolean) => void,
    setError: (v: string) => void,
    patchPrefix: 'company' | 'rep',
  ) => {
    setError('');
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setError('CEP deve conter 8 dígitos.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) throw new Error();

      if (patchPrefix === 'company') {
        setFormData(prev => ({
          ...prev,
          companyStreet: data.logradouro || prev.companyStreet,
          companyNeighborhood: data.bairro || prev.companyNeighborhood,
          companyCity: data.localidade || prev.companyCity,
          companyState: data.uf || prev.companyState,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          repStreet: data.logradouro || prev.repStreet,
          repNeighborhood: data.bairro || prev.repNeighborhood,
          repCity: data.localidade || prev.repCity,
          repState: data.uf || prev.repState,
        }));
      }
    } catch {
      setError('CEP não encontrado. Preencha o endereço manualmente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit ──

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      companyComplement: formData.companyComplement.trim() || 'N/A',
      companyReference: formData.companyReference.trim() || 'N/A',
      repComplement: formData.repComplement.trim() || 'N/A',
      repReference: formData.repReference.trim() || 'N/A',
    };

    console.log('Submitting new client:', payload);
    alert('Cliente cadastrado com sucesso!');
    router.push('/clients');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cadastrar Novo Cliente</h1>
          <p className={styles.subtitle}>Preencha todos os dados para registrar um novo cliente no sistema.</p>
        </div>
        <Link href="/clients" className={styles.btnBack}>← Voltar</Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>

        {/* ── Dados Empresa ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados Empresa</h2>
          <div className={styles.inputGroup}>

            <div className={styles.field}>
              <label>CNPJ *</label>
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
            </div>

            <div className={styles.field}>
              <label>Nome Fantasia *</label>
              <input type="text" name="tradingName" value={formData.tradingName} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Razão Social *</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>E-mail *</label>
              <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Site do recebedor <span className={styles.optionalTag}>opcional</span></label>
              <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Faturamento Anual *</label>
              <select name="annualRevenue" value={formData.annualRevenue} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {ANNUAL_REVENUE_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Descrição do Modelo de Negócio <span className={styles.optionalTag}>opcional</span></label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva brevemente o modelo de negócio..."
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Canal de Vendas <span className={styles.optionalTag}>opcional</span></label>
              <div className={styles.checkboxGroup}>
                {['Site', 'Redes Sociais', 'Balcão'].map(ch => (
                  <label key={ch} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formData.salesChannels.includes(ch)}
                      onChange={() => toggleSalesChannel(ch)}
                    />
                    {ch}
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Endereço Empresa ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Endereço Empresa</h2>
          <div className={styles.inputGroup}>

            <div className={styles.field}>
              <label>CEP *</label>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  name="companyZip"
                  value={formData.companyZip}
                  onChange={handleChange}
                  placeholder="00000-000"
                  required
                />
                <button
                  type="button"
                  className={styles.btnSearch}
                  onClick={() => searchCep(formData.companyZip, setIsSearchingCompanyZip, setCompanyZipError, 'company')}
                  disabled={isSearchingCompanyZip || formData.companyZip.replace(/\D/g, '').length < 8}
                >
                  {isSearchingCompanyZip ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {companyZipError && <span className={styles.errorMessage}>{companyZipError}</span>}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Logradouro *</label>
              <input type="text" name="companyStreet" value={formData.companyStreet} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Número *</label>
              <input type="text" name="companyNumber" value={formData.companyNumber} onChange={handleChange} placeholder="Nº ou S/N" required />
            </div>

            <div className={styles.field}>
              <label>Complemento <span className={styles.fieldHint}>(vazio = N/A)</span></label>
              <input type="text" name="companyComplement" value={formData.companyComplement} onChange={handleChange} placeholder="Apto, sala, bloco..." />
            </div>

            <div className={styles.field}>
              <label>Bairro *</label>
              <input type="text" name="companyNeighborhood" value={formData.companyNeighborhood} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Cidade *</label>
              <input type="text" name="companyCity" value={formData.companyCity} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Estado *</label>
              <input type="text" name="companyState" value={formData.companyState} onChange={handleChange} maxLength={2} placeholder="UF" required />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Ponto de Referência <span className={styles.fieldHint}>(vazio = N/A)</span></label>
              <input type="text" name="companyReference" value={formData.companyReference} onChange={handleChange} placeholder="Próximo a..." />
            </div>

          </div>
        </div>

        {/* ── Telefone Empresa ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Telefone Empresa</h2>
          <div className={styles.inputGroup}>

            <div className={styles.field}>
              <label>Tipo de Telefone *</label>
              <select name="companyPhoneType" value={formData.companyPhoneType} onChange={handleChange} required>
                <option value="Celular">Celular</option>
                <option value="Fixo">Fixo</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>DDD *</label>
              <input type="text" name="companyPhoneDdd" value={formData.companyPhoneDdd} onChange={handleChange} maxLength={2} placeholder="11" required />
            </div>

            <div className={styles.field}>
              <label>Número *</label>
              <input type="text" name="companyPhoneNumber" value={formData.companyPhoneNumber} onChange={handleChange} placeholder="99999-9999" required />
            </div>

          </div>
        </div>

        {/* ── Dados Representante Legal ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados do Representante Legal</h2>
          <div className={styles.inputGroup}>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Nome do Representante Legal *</label>
              <input type="text" name="repName" value={formData.repName} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>E-mail do Representante Legal *</label>
              <input type="email" name="repEmail" value={formData.repEmail} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>CPF do Representante Legal *</label>
              <input type="text" name="repCpf" value={formData.repCpf} onChange={handleChange} placeholder="000.000.000-00" required />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Nome da Mãe do Representante Legal *</label>
              <input type="text" name="repMotherName" value={formData.repMotherName} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Data de Nascimento *</label>
              <input type="date" name="repBirthDate" value={formData.repBirthDate} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Ocupação Profissional *</label>
              <input type="text" name="repOccupation" value={formData.repOccupation} onChange={handleChange} placeholder="Ex: Empresário, Comerciante..." required />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Renda Mensal *</label>
              <select name="repMonthlyIncome" value={formData.repMonthlyIncome} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {MONTHLY_INCOME_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ── Endereço Representante ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Endereço do Representante</h2>
          <div className={styles.inputGroup}>

            <div className={styles.field}>
              <label>CEP *</label>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  name="repZip"
                  value={formData.repZip}
                  onChange={handleChange}
                  placeholder="00000-000"
                  required
                />
                <button
                  type="button"
                  className={styles.btnSearch}
                  onClick={() => searchCep(formData.repZip, setIsSearchingRepZip, setRepZipError, 'rep')}
                  disabled={isSearchingRepZip || formData.repZip.replace(/\D/g, '').length < 8}
                >
                  {isSearchingRepZip ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {repZipError && <span className={styles.errorMessage}>{repZipError}</span>}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Logradouro *</label>
              <input type="text" name="repStreet" value={formData.repStreet} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Número *</label>
              <input type="text" name="repNumber" value={formData.repNumber} onChange={handleChange} placeholder="Nº ou S/N" required />
            </div>

            <div className={styles.field}>
              <label>Complemento <span className={styles.fieldHint}>(vazio = N/A)</span></label>
              <input type="text" name="repComplement" value={formData.repComplement} onChange={handleChange} placeholder="Apto, sala, bloco..." />
            </div>

            <div className={styles.field}>
              <label>Bairro *</label>
              <input type="text" name="repNeighborhood" value={formData.repNeighborhood} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Cidade *</label>
              <input type="text" name="repCity" value={formData.repCity} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label>Estado *</label>
              <input type="text" name="repState" value={formData.repState} onChange={handleChange} maxLength={2} placeholder="UF" required />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Ponto de Referência <span className={styles.fieldHint}>(vazio = N/A)</span></label>
              <input type="text" name="repReference" value={formData.repReference} onChange={handleChange} placeholder="Próximo a..." />
            </div>

          </div>
        </div>

        {/* ── Telefone Representante ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Telefone do Representante</h2>
          <div className={styles.inputGroup}>

            <div className={styles.field}>
              <label>Tipo de Telefone *</label>
              <select name="repPhoneType" value={formData.repPhoneType} onChange={handleChange} required>
                <option value="Celular">Celular</option>
                <option value="Fixo">Fixo</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>DDD *</label>
              <input type="text" name="repPhoneDdd" value={formData.repPhoneDdd} onChange={handleChange} maxLength={2} placeholder="11" required />
            </div>

            <div className={styles.field}>
              <label>Número *</label>
              <input type="text" name="repPhoneNumber" value={formData.repPhoneNumber} onChange={handleChange} placeholder="99999-9999" required />
            </div>

          </div>
        </div>

        {/* ── Conta Bancária PJ ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Conta Bancária PJ</h2>
          <div className={styles.inputGroup}>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Banco *</label>
              <select name="bankName" value={formData.bankName} onChange={handleChange} required>
                <option value="">Selecione o banco...</option>
                {BANKS.map(b => (
                  <option key={b.code} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Agência *</label>
              <input type="text" name="bankAgency" value={formData.bankAgency} onChange={handleChange} placeholder="0000" required />
            </div>

            <div className={styles.field}>
              <label>Dígito da Agência</label>
              <input type="text" name="bankAgencyDigit" value={formData.bankAgencyDigit} onChange={handleChange} maxLength={1} placeholder="X" />
            </div>

            <div className={styles.field}>
              <label>Conta Bancária *</label>
              <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="00000" required />
            </div>

            <div className={styles.field}>
              <label>Dígito da Conta *</label>
              <input type="text" name="bankAccountDigit" value={formData.bankAccountDigit} onChange={handleChange} maxLength={1} placeholder="X" required />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Tipo de Conta *</label>
              <select name="bankAccountType" value={formData.bankAccountType} onChange={handleChange} required>
                <option value="Conta corrente">Conta corrente</option>
                <option value="Conta corrente conjunta">Conta corrente conjunta</option>
                <option value="Conta poupança">Conta poupança</option>
                <option value="Conta poupança conjunta">Conta poupança conjunta</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Nome da Conta Bancária *</label>
              <input type="text" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} placeholder="Nome do titular da conta" required />
            </div>

            <div className={styles.field}>
              <label>Tipo de Recebedor *</label>
              <select name="bankReceiverType" value={formData.bankReceiverType} onChange={handleChange} required>
                <option value="Pessoa Juridica">Pessoa Jurídica</option>
                <option value="Pessoa Fisica">Pessoa Física</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Nº Documento da Conta *</label>
              <input
                type="text"
                name="bankDocument"
                value={formData.bankDocument}
                onChange={handleChange}
                placeholder={formData.bankReceiverType === 'Pessoa Fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
            </div>

          </div>
        </div>

        {/* ── Actions ── */}
        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={() => router.push('/clients')}>Cancelar</button>
          <button type="submit" className={styles.btnSubmit}>Salvar e Cadastrar</button>
        </div>
      </form>
    </div>
  );
}

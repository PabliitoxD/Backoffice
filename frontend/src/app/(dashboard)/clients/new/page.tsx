"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './newClient.module.css';

interface ClientFormData {
  status: string;
  // Personal Data
  fullName: string;
  cpf: string;
  birthDate: string;
  // Responsible User Data
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  // Company Data
  cnpj: string;
  companyName: string;
  tradingName: string;
  // Location
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
    responsibleName: '',
    responsibleEmail: '',
    responsiblePhone: '',
    cnpj: '',
    companyName: '',
    tradingName: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Basic CNPJ validation and API fetch (using BrasilAPI)
  const handleCNPJSearch = async () => {
    setCnpjError('');
    setCnpjSuccess('');
    
    // Remove non-numeric characters for the API call
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      setCnpjError('O CNPJ deve conter 14 dígitos válidos.');
      return;
    }

    setIsSearchingCNPJ(true);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou erro na consulta.');
      }

      const data = await response.json();
      
      // Check situational status
      const isActive = data.descricao_situacao_cadastral === 'ATIVA';
      
      if (!isActive) {
        setCnpjError(`Atenção: A situação deste CNPJ é ${data.descricao_situacao_cadastral}.`);
      } else {
        setCnpjSuccess('CNPJ Ativo e Validado com Sucesso!');
      }

      // Auto-fill form fields
      setFormData(prev => ({
        ...prev,
        companyName: data.razao_social || '',
        tradingName: data.nome_fantasia || data.razao_social || '',
        zipCode: data.cep || prev.zipCode,
        street: data.logradouro || prev.street,
        number: data.numero || prev.number,
        complement: data.complemento || prev.complement,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.municipio || prev.city,
        state: data.uf || prev.state,
      }));

    } catch (error) {
      console.error("Error fetching CNPJ:", error);
      setCnpjError('Erro ao consultar o CNPJ. Verifique se o número está correto.');
    } finally {
      setIsSearchingCNPJ(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending new client data to API:', formData);
    // TODO: Send data to NestJS Backend
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
        <Link href="/clients" className={styles.btnBack}>
          ← Voltar
        </Link>
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

        {/* Company Data (CNPJ Validation) */}
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
                  disabled={isSearchingCNPJ || formData.cnpj.length < 14}
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
          </div>
        </div>

        {/* Personal Data */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
          <div className={styles.inputGroup}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Nome Completo (Proprietário/Sócio)</label>
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

        {/* Location / Address */}
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

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={() => router.push('/clients')}>
            Cancelar
          </button>
          <button type="submit" className={styles.btnSubmit}>
            Salvar e Cadastrar
          </button>
        </div>

      </form>
    </div>
  );
}

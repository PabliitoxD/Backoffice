"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './clientEdit.module.css';
import { useState } from 'react';

// MOCK DATA for the selected client
const MOCK_CLIENT = {
  id: 1,
  status: 'Pendente',
  // Personal Data
  fullName: 'João Silva',
  cpf: '123.456.789-00',
  birthDate: '1985-06-15',
  // Responsible User Data
  responsibleName: 'João Silva',
  responsibleEmail: 'joao.silva@email.com',
  responsiblePhone: '(11) 98765-4321',
  // Company Data
  cnpj: '12.345.678/0001-90',
  companyName: 'Acme Corp Finance',
  tradingName: 'Acme Corp',
  // Location
  zipCode: '01001-000',
  street: 'Praça da Sé',
  number: '1',
  complement: 'Lado ímpar',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  // Plans / Pricing
  planId: 2, // MOCK: currently assigned to 'Standard' (id: 2)
  customLiquidationRate: 1.5, // Mock percentage
};

// MOCK DATA: Simulating available pricing plans from the system
const SYSTEM_PLANS = [
  { id: 1, name: 'Básico', description: 'Até 5 usuários', pixRate: '0.99%', boletoRate: 'R$ 2,50', type: 'system' },
  { id: 2, name: 'Standard', description: 'Plano popular (20 usuários)', pixRate: '0.89%', boletoRate: 'R$ 1,99', type: 'system' },
  { id: 3, name: 'Premium (Ilimitado)', description: 'Grandes contas', pixRate: '0.79%', boletoRate: '1.50%', type: 'system' },
  { id: 'custom', name: 'Personalizado', description: 'Taxas configuradas manualmente', pixRate: 'Sob Consulta', boletoRate: 'Sob Consulta', type: 'custom' },
];

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  // In a real application, fetch the client using id
  const [formData, setFormData] = useState({
    ...MOCK_CLIENT,
    planId: MOCK_CLIENT.planId as number | string
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending updated client data to API:', formData);
    // TODO: Send data to NestJS Backend PUT endpoint
    alert('Informações do cliente atualizadas com sucesso!');
  };

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
           <Link href="/clients" className={styles.btnBack}>
             Cancelar
           </Link>
           <button type="submit" form="editClientForm" className={styles.btnSave}>
             Salvar Alterações
           </button>
        </div>
      </div>

      <form id="editClientForm" onSubmit={handleSubmit} className={styles.formGrid}>
        
        {/* Status */}
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

        {/* Pricing / Plan Table (NEW) */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Plano Operacional e Liquidação</h2>
          <p className={styles.sectionDesc}>Configure o plano de assinatura do cliente e a taxa padrão de liquidação para transações.</p>
          
          <div className={styles.inputGroup}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Plano Vinculado</label>
              <select 
                name="planId" 
                value={formData.planId} 
                onChange={(e) => setFormData(prev => ({ ...prev, planId: e.target.value === 'custom' ? 'custom' : Number(e.target.value) }))}
                required
              >
                <option value="" disabled>Selecione um plano...</option>
                {SYSTEM_PLANS.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.type === 'system' ? `(${plan.pixRate} PIX / ${plan.boletoRate} Boleto)` : ''}
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

        {/* Company Data */}
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
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required />
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
              <input type="tel" name="responsiblePhone" value={formData.responsiblePhone} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Location / Address */}
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

      </form>
    </div>
  );
}

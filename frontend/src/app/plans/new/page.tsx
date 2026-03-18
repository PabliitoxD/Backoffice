"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './newPlan.module.css';

const BRANDS = ['MasterCard', 'Visa', 'Elo', 'Hipercard'];
const INSTALLMENTS = [
  { key: 'debito', label: 'Débito' },
  { key: 'credito_1x', label: 'Crédito à Vista (1x)' },
  { key: 'credito_2x', label: 'Crédito 2x' },
  { key: 'credito_3x', label: 'Crédito 3x' },
  { key: 'credito_4x', label: 'Crédito 4x' },
  { key: 'credito_5x', label: 'Crédito 5x' },
  { key: 'credito_6x', label: 'Crédito 6x' },
  { key: 'credito_7x', label: 'Crédito 7x' },
  { key: 'credito_8x', label: 'Crédito 8x' },
  { key: 'credito_9x', label: 'Crédito 9x' },
  { key: 'credito_10x', label: 'Crédito 10x' },
  { key: 'credito_11x', label: 'Crédito 11x' },
  { key: 'credito_12x', label: 'Crédito 12x' },
];

export default function NewPlanPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pixRate: '0.99',
    pixRelease: '24h', // Default PIX release
    boletoType: 'fixed', // 'fixed' | 'percentage'
    boletoRate: '2.50',
    boletoRelease: 'd2', // Default Boleto release
    creditCardRelease: 'd30', // Default CC release
  });

  // State to hold dynamic grid values
  // Format: { 'MasterCard_debito': '1.50', 'Visa_credito_1x': '2.00', ... }
  const [matrixRates, setMatrixRates] = useState<Record<string, string>>({});

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMatrixChange = (brand: string, installmentKey: string, value: string) => {
    setMatrixRates(prev => ({
      ...prev,
      [`${brand}_${installmentKey}`]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending new plan to API:', { ...formData, rates: matrixRates });
    // TODO: Send data to NestJS Backend POST /plans endpoint
    alert('Plano cadastrado com sucesso!');
    router.push('/plans');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cadastrar Novo Plano</h1>
          <p className={styles.subtitle}>Configure os detalhes do plano e as taxas específicas por forma de pagamento e parcelamento.</p>
        </div>
        <div className={styles.headerActions}>
           <Link href="/plans" className={styles.btnBack}>
             Cancelar
           </Link>
           <button type="submit" form="newPlanForm" className={styles.btnSave}>
             Salvar Plano
           </button>
        </div>
      </div>

      <form id="newPlanForm" onSubmit={handleSubmit} className={styles.formGrid}>
        
        {/* Identificação do Plano */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Identificação do Plano</h2>
          <p className={styles.sectionDesc}>Nome e descrição que aparecerão na listagem de planos.</p>
          
          <div className={styles.inputRow}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Nome do Plano (Ex: Taxa Especial VIP)</label>
              <input type="text" name="name" value={formData.name} onChange={handleBasicChange} required />
            </div>
            <div className={styles.field} style={{ flex: 2 }}>
              <label>Descrição Opcional</label>
              <input type="text" name="description" value={formData.description} onChange={handleBasicChange} />
            </div>
          </div>
        </section>

        {/* PIX e Boleto */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Taxas à Vista (PIX e Boleto)</h2>
          <p className={styles.sectionDesc}>Configure o custo transacional para métodos de pagamento à vista.</p>
          
          <div className={styles.inputRow}>
            <div className={styles.field}>
              <label>Taxa PIX</label>
              <div className={styles.inputWithSymbol}>
                <input type="number" step="0.01" name="pixRate" value={formData.pixRate} onChange={handleBasicChange} required />
                <span className={styles.symbol}>%</span>
              </div>
            </div>

            <div className={styles.field}>
              <label>Configuração de Boleto</label>
              <div className={styles.inputWithSymbol} style={{ gap: '0.5rem', border: 'none', background: 'transparent', padding: 0 }}>
                <select name="boletoType" value={formData.boletoType} onChange={handleBasicChange} style={{ flex: 1 }}>
                  <option value="fixed">Valor Fixo (R$)</option>
                  <option value="percentage">Percentual (%)</option>
                </select>
                <div className={styles.inputWithSymbol} style={{ flex: 1.5 }}>
                  <input type="number" step="0.01" name="boletoRate" value={formData.boletoRate} onChange={handleBasicChange} required />
                  <span className={styles.symbol}>{formData.boletoType === 'fixed' ? 'R$' : '%'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liberação de Saldo (Schedules) */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Liberação de Saldo</h2>
          <p className={styles.sectionDesc}>Configure os prazos em que o saldo ficará disponível para saque após cada venda.</p>
          
          <div className={styles.inputRow}>
            <div className={styles.field}>
              <label>Prazo Cartão de Crédito</label>
              <select name="creditCardRelease" value={formData.creditCardRelease} onChange={handleBasicChange} required>
                <option value="d30">D+30 (Padrão - Após 30 dias)</option>
                <option value="d15">D+15 (Após 15 dias)</option>
                <option value="d7">D+7 (Após 7 dias)</option>
                <option value="d2">D+2 (Após 2 dias)</option>
                <option value="installments">Conforme Pagamento das Parcelas</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Prazo PIX</label>
              <select name="pixRelease" value={formData.pixRelease} onChange={handleBasicChange} required>
                <option value="24h">24 Horas</option>
                <option value="instant">Imediato</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Prazo Boleto</label>
              <select name="boletoRelease" value={formData.boletoRelease} onChange={handleBasicChange} required>
                <option value="d2">D+2 (Padrão)</option>
                <option value="d1">D+1</option>
              </select>
            </div>
          </div>
        </section>

        {/* Matriz de Cartões */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Taxas de Cartão (Por Bandeira e Parcela)</h2>
          <p className={styles.sectionDesc}>Defina as taxas exatas para cada modalidade de pagamento em diferentes bandeiras.</p>
          
          <div className={styles.matrixContainer}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th className={styles.rowHeader}>Parcelamento</th>
                  {BRANDS.map(brand => (
                    <th key={brand}>{brand}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INSTALLMENTS.map(installment => (
                  <tr key={installment.key}>
                    <td className={styles.rowHeader}>{installment.label}</td>
                    {BRANDS.map(brand => {
                      const valueKey = `${brand}_${installment.key}`;
                      return (
                        <td key={valueKey}>
                          <div className={styles.matrixInputWrapper}>
                            <input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              value={matrixRates[valueKey] || ''} 
                              onChange={(e) => handleMatrixChange(brand, installment.key, e.target.value)}
                            />
                            <span>%</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </form>
    </div>
  );
}

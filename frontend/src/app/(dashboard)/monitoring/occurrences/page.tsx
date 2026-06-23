"use client";

import { useState } from 'react';
import styles from './occurrences.module.css';

type Severity = 'critical' | 'major' | 'minor' | 'maintenance';

interface Occurrence {
  id: number;
  service: string;
  title: string;
  severity: Severity;
  date: string;
  time: string;
  comment: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
}

const SERVICES = [
  'API de Pagamentos',
  'Gateway de Cartão',
  'Antifraude',
  'Webhook Delivery',
  'Notificações',
  'Conciliação',
  'Dashboard',
  'Portal do Cliente',
];

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Crítico',
  major: 'Grave',
  minor: 'Leve',
  maintenance: 'Manutenção',
};

const STATUS_LABELS: Record<Occurrence['status'], string> = {
  investigating: 'Investigando',
  identified: 'Identificado',
  monitoring: 'Monitorando',
  resolved: 'Resolvido',
};

const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: 1,
    service: 'API de Pagamentos',
    title: 'Latência elevada nas requisições de pagamento',
    severity: 'major',
    date: '2026-06-23',
    time: '14:32',
    comment: 'Identificado aumento anormal na latência das requisições. Tempo médio de resposta subiu de 120ms para 850ms. Equipe de infraestrutura acionada para investigação.',
    status: 'resolved',
  },
  {
    id: 2,
    service: 'Gateway de Cartão',
    title: 'Instabilidade na comunicação com adquirente',
    severity: 'critical',
    date: '2026-06-22',
    time: '09:15',
    comment: 'Falhas intermitentes na comunicação com a adquirente Cielo. Transações com cartão de crédito com taxa de erro em torno de 12%. Adquirente notificada e equipe técnica trabalhando na resolução.',
    status: 'resolved',
  },
  {
    id: 3,
    service: 'Notificações',
    title: 'Atraso no envio de e-mails transacionais',
    severity: 'minor',
    date: '2026-06-20',
    time: '16:50',
    comment: 'E-mails de confirmação de pagamento com atraso de até 15 minutos. Fila de envio apresentou acúmulo por conta de pico de transações.',
    status: 'resolved',
  },
  {
    id: 4,
    service: 'Dashboard',
    title: 'Manutenção programada — atualização de infraestrutura',
    severity: 'maintenance',
    date: '2026-06-18',
    time: '02:00',
    comment: 'Janela de manutenção para atualização dos servidores de aplicação. Indisponibilidade prevista de 30 minutos. Concluída sem intercorrências.',
    status: 'resolved',
  },
];

const EMPTY_FORM = {
  service: '',
  title: '',
  severity: 'minor' as Severity,
  date: '',
  time: '',
  comment: '',
  status: 'investigating' as Occurrence['status'],
};

export default function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>(MOCK_OCCURRENCES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterSeverity, setFilterSeverity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOccurrence: Occurrence = {
      id: Date.now(),
      ...form,
    };
    setOccurrences(prev => [newOccurrence, ...prev]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const filtered = occurrences.filter(o =>
    !filterSeverity || o.severity === filterSeverity
  );

  const grouped = filtered.reduce<Record<string, Occurrence[]>>((acc, o) => {
    const key = o.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="title">Ocorrências</h1>
          <p className="subtitle">Histórico de incidentes, degradações e manutenções registradas nos serviços.</p>
        </div>
        <button className={styles.btnNew} onClick={() => setShowModal(true)}>
          + Registrar ocorrência
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {(['', 'critical', 'major', 'minor', 'maintenance'] as const).map((sev) => (
            <button
              key={sev}
              className={`${styles.filterBtn} ${filterSeverity === sev ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev === '' ? 'Todos' : SEVERITY_LABELS[sev]}
            </button>
          ))}
        </div>
        <span className={styles.count}>{filtered.length} ocorrência{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>✓</span>
          <p>Nenhuma ocorrência registrada.</p>
        </div>
      )}

      <div className={styles.timeline}>
        {sortedDates.map(date => (
          <div key={date} className={styles.timelineGroup}>
            <div className={styles.dateLabel}>{formatDate(date)}</div>
            {grouped[date].map(occ => (
              <div key={occ.id} className={`${styles.occurrenceCard} card ${styles[`sev_${occ.severity}`]}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardMeta}>
                    <span className={`${styles.severityBadge} ${styles[`badge_${occ.severity}`]}`}>
                      {SEVERITY_LABELS[occ.severity]}
                    </span>
                    <span className={`${styles.statusBadge} ${styles[`status_${occ.status}`]}`}>
                      {STATUS_LABELS[occ.status]}
                    </span>
                    <span className={styles.serviceTag}>{occ.service}</span>
                  </div>
                  <span className={styles.time}>{occ.time}</span>
                </div>
                <h3 className={styles.occurrenceTitle}>{occ.title}</h3>
                <p className={styles.occurrenceComment}>{occ.comment}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Registrar Ocorrência</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Painel / Serviço *</label>
                  <select
                    className={styles.select}
                    value={form.service}
                    onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                    required
                  >
                    <option value="">Selecione o serviço</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Severidade *</label>
                  <select
                    className={styles.select}
                    value={form.severity}
                    onChange={e => setForm(f => ({ ...f, severity: e.target.value as Severity }))}
                    required
                  >
                    <option value="critical">Crítico</option>
                    <option value="major">Grave</option>
                    <option value="minor">Leve</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Título *</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Ex: Latência elevada na API de Pagamentos"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Data *</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Horário *</label>
                  <input
                    className={styles.input}
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status *</label>
                  <select
                    className={styles.select}
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Occurrence['status'] }))}
                    required
                  >
                    <option value="investigating">Investigando</option>
                    <option value="identified">Identificado</option>
                    <option value="monitoring">Monitorando</option>
                    <option value="resolved">Resolvido</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Comentário / Descrição *</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Descreva o que foi identificado, impacto e ações tomadas..."
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

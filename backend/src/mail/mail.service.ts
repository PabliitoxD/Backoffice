import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // Use true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendWithdrawalNotification(withdrawals: any[]) {
    const recipients = ['tania.souza@superfin.com.br', 'pablo.werner@superfin.com.br'];
    
    const totalAmount = withdrawals.reduce((sum, w) => sum + (w.amount - w.fee), 0);
    const today = new Date().toLocaleDateString('pt-BR');

    let htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Autorização de Repasse PIX</h2>
        </div>
        <div style="padding: 20px;">
          <p>Olá,</p>
          <p>As seguintes solicitações de saque foram <strong>autorizadas</strong> e estão prontas para processamento financeiro:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Qtd:</strong> ${withdrawals.length}</p>
            <p style="margin: 5px 0;"><strong>Valor Total:</strong> <span style="color: #10b981; font-weight: bold;">R$ ${totalAmount.toFixed(2).replace('.', ',')}</span></p>
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          ${withdrawals.map(w => {
            const payout = w.amount - w.fee;
            const formatDate = (date: any) => date ? new Date(date).toLocaleString('pt-BR') : 'N/A';
            
            return `
              <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #4f46e5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold; width: 160px;">PRODUTOR:</td>
                    <td style="padding: 5px 0;">${w.producer?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">ID:</td>
                    <td style="padding: 5px 0;"><code>${w.id}</code></td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">VALOR LÍQUIDO:</td>
                    <td style="padding: 5px 0; color: #10b981; font-weight: bold; font-size: 1.1em;">R$ ${payout.toFixed(2).replace('.', ',')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">CHAVE PIX:</td>
                    <td style="padding: 5px 0; font-weight: bold; color: #4f46e5;">${w.pixKey || w.producer?.pixKey || 'Não informada'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">STATUS:</td>
                    <td style="padding: 5px 0;">${w.status}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">DATA SOLICITAÇÃO:</td>
                    <td style="padding: 5px 0;">${formatDate(w.createdAt)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">DATA APROVAÇÃO:</td>
                    <td style="padding: 5px 0;">${formatDate(w.approvedAt)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">DATA PAGAMENTO:</td>
                    <td style="padding: 5px 0;">${today}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">PARECER DO RISCO:</td>
                    <td style="padding: 5px 0; font-style: italic;">${w.observation || 'N/A'}</td>
                  </tr>
                </table>
              </div>
            `;
          }).join('')}
          
          <p style="margin-top: 30px; font-size: 0.85em; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
            Este é um e-mail automático gerado pelo Sistema SuperFin. Por favor, não responda.
          </p>
        </div>
      </div>
    `;

    return this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipients.join(', '),
      subject: `[FINANCEIRO] Autorização de Repasse - ${withdrawals.length} solicitações`,
      html: htmlContent,
    });
  }
}

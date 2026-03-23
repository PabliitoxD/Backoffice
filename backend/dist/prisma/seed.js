"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@superfin.com.br' },
        update: {},
        create: {
            email: 'admin@superfin.com.br',
            name: 'Administrador',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    const producer = await prisma.producer.upsert({
        where: { document: '12345678900' },
        update: {},
        create: {
            name: 'Produtor Exemplo',
            document: '12345678900',
            email: 'produtor@exemplo.com',
            phone: '11999999999'
        }
    });
    const customer = await prisma.customer.upsert({
        where: { document: '09876543211' },
        update: {},
        create: {
            name: 'Cliente Exemplo',
            document: '09876543211',
            email: 'cliente@exemplo.com',
        }
    });
    const product = await prisma.product.upsert({
        where: { code: 'PROD-001' },
        update: {},
        create: {
            code: 'PROD-001',
            name: 'Produto Inicial',
            price: 150.00,
            producerId: producer.id,
        }
    });
    const transaction = await prisma.transaction.create({
        data: {
            producerId: producer.id,
            customerId: customer.id,
            productId: product.id,
            amount: 150.00,
            method: 'PIX',
            status: 'APPROVED',
            history: {
                create: [
                    { status: 'WAITING', details: 'Aguardando pagamento' },
                    { status: 'APPROVED', details: 'Pagamento aprovado via PIX' }
                ]
            }
        }
    });
    console.log('Seed executado com sucesso: User admin@superfin.com.br (senha: 123456) cadastrado. Exemplos de Produtor, Cliente, Produto e Transação criados.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
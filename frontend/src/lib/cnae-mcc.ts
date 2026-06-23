/**
 * Mapeamento CNAE → MCC baseado na tabela oficial ABECS (Associação Brasileira
 * das Empresas de Cartões de Crédito e Serviços) e ISO 18245.
 *
 * Estrutura: chave = 4 primeiros dígitos do CNAE fiscal
 * Fonte: Tabela ABECS de Códigos de Categoria de Estabelecimento (MCC)
 *
 * Para atualizar esta tabela, acesse Configurações → MCC / ABECS no backoffice.
 */

export interface MccEntry {
  mcc: string;
  label: string;
  sector: string;
}

export const CNAE_MCC_TABLE: Record<string, MccEntry> = {
  // ─── AGROPECUÁRIA ────────────────────────────────────────────────────────
  '0111': { mcc: '0763', label: 'Cooperativas Agrícolas', sector: 'Agropecuária' },
  '0112': { mcc: '0763', label: 'Cooperativas Agrícolas', sector: 'Agropecuária' },
  '0115': { mcc: '0763', label: 'Cooperativas Agrícolas', sector: 'Agropecuária' },
  '0119': { mcc: '0763', label: 'Cooperativas Agrícolas', sector: 'Agropecuária' },
  '0141': { mcc: '0742', label: 'Serviços Veterinários', sector: 'Agropecuária' },
  '0142': { mcc: '0742', label: 'Serviços Veterinários', sector: 'Agropecuária' },
  '0150': { mcc: '0742', label: 'Serviços Veterinários', sector: 'Agropecuária' },
  '0155': { mcc: '0742', label: 'Serviços Veterinários', sector: 'Agropecuária' },
  '0159': { mcc: '0742', label: 'Serviços Veterinários', sector: 'Agropecuária' },

  // ─── CONSTRUÇÃO CIVIL ────────────────────────────────────────────────────
  '4110': { mcc: '1520', label: 'Empreiteiras / Construção Geral', sector: 'Construção' },
  '4120': { mcc: '1520', label: 'Empreiteiras / Construção Geral', sector: 'Construção' },
  '4211': { mcc: '1711', label: 'Instalações Hidráulicas e Climatização', sector: 'Construção' },
  '4212': { mcc: '1711', label: 'Instalações Hidráulicas e Climatização', sector: 'Construção' },
  '4213': { mcc: '1711', label: 'Instalações Hidráulicas e Climatização', sector: 'Construção' },
  '4221': { mcc: '1731', label: 'Instalações Elétricas', sector: 'Construção' },
  '4222': { mcc: '1731', label: 'Instalações Elétricas', sector: 'Construção' },
  '4291': { mcc: '1740', label: 'Obras de Alvenaria e Revestimento', sector: 'Construção' },
  '4292': { mcc: '1761', label: 'Impermeabilização e Cobertura', sector: 'Construção' },
  '4299': { mcc: '1799', label: 'Serviços Especializados de Construção', sector: 'Construção' },
  '4311': { mcc: '1771', label: 'Preparação de Terrenos', sector: 'Construção' },
  '4312': { mcc: '1771', label: 'Preparação de Terrenos', sector: 'Construção' },
  '4313': { mcc: '1771', label: 'Preparação de Terrenos', sector: 'Construção' },

  // ─── COMÉRCIO DE VEÍCULOS ────────────────────────────────────────────────
  '4511': { mcc: '5511', label: 'Concessionárias — Veículos Novos', sector: 'Veículos' },
  '4512': { mcc: '5511', label: 'Concessionárias — Veículos Novos', sector: 'Veículos' },
  '4520': { mcc: '7538', label: 'Manutenção e Reparação de Veículos', sector: 'Veículos' },
  '4530': { mcc: '5533', label: 'Peças e Acessórios para Veículos', sector: 'Veículos' },
  '4541': { mcc: '5561', label: 'Concessionárias — Motocicletas', sector: 'Veículos' },
  '4542': { mcc: '5571', label: 'Reparação de Motocicletas', sector: 'Veículos' },
  '4543': { mcc: '5571', label: 'Peças e Acessórios para Motocicletas', sector: 'Veículos' },
  '4581': { mcc: '4582', label: 'Serviços de Aeronaves', sector: 'Veículos' },

  // ─── COMBUSTÍVEIS ────────────────────────────────────────────────────────
  '4731': { mcc: '5541', label: 'Postos de Combustível', sector: 'Combustíveis' },
  '4732': { mcc: '5541', label: 'Postos de Combustível', sector: 'Combustíveis' },
  '4741': { mcc: '5983', label: 'Distribuidoras de Combustível', sector: 'Combustíveis' },

  // ─── TRANSPORTE ──────────────────────────────────────────────────────────
  '4911': { mcc: '4011', label: 'Transporte Ferroviário', sector: 'Transporte' },
  '4912': { mcc: '4011', label: 'Transporte Ferroviário de Cargas', sector: 'Transporte' },
  '4921': { mcc: '4121', label: 'Táxi e Transporte por Aplicativo', sector: 'Transporte' },
  '4922': { mcc: '4121', label: 'Transporte Escolar', sector: 'Transporte' },
  '4923': { mcc: '4131', label: 'Transporte Coletivo Urbano', sector: 'Transporte' },
  '4924': { mcc: '4131', label: 'Transporte Rodoviário Intermunicipal', sector: 'Transporte' },
  '4929': { mcc: '4789', label: 'Outros Transportes Terrestres', sector: 'Transporte' },
  '4930': { mcc: '4900', label: 'Transporte Dutoviário', sector: 'Transporte' },
  '4941': { mcc: '4214', label: 'Transporte Rodoviário de Cargas', sector: 'Transporte' },
  '4942': { mcc: '4214', label: 'Transporte Rodoviário de Cargas', sector: 'Transporte' },
  '4950': { mcc: '4215', label: 'Transporte Aquaviário', sector: 'Transporte' },
  '4961': { mcc: '4215', label: 'Transporte Marítimo', sector: 'Transporte' },
  '4971': { mcc: '4215', label: 'Transporte Fluvial', sector: 'Transporte' },
  '4981': { mcc: '4215', label: 'Navegação de Apoio', sector: 'Transporte' },
  '4991': { mcc: '4215', label: 'Transporte Aquaviário Especial', sector: 'Transporte' },

  // ─── ARMAZENAGEM E LOGÍSTICA ─────────────────────────────────────────────
  '5211': { mcc: '4225', label: 'Armazenagem e Depósitos', sector: 'Logística' },
  '5212': { mcc: '4225', label: 'Frigoríficos e Armazenagem Frigorificada', sector: 'Logística' },
  '5221': { mcc: '4215', label: 'Carga e Descarga', sector: 'Logística' },
  '5229': { mcc: '4215', label: 'Serviços de Logística', sector: 'Logística' },
  '5231': { mcc: '4215', label: 'Operadores Logísticos', sector: 'Logística' },
  '5232': { mcc: '4215', label: 'Agentes de Cargas e Despachos', sector: 'Logística' },

  // ─── CORREIO E ENTREGA ───────────────────────────────────────────────────
  '5310': { mcc: '4215', label: 'Atividades de Correio', sector: 'Correios' },
  '5320': { mcc: '4215', label: 'Serviços de Entrega Expressa', sector: 'Correios' },

  // ─── ALIMENTAÇÃO E RESTAURANTES ──────────────────────────────────────────
  '5611': { mcc: '5812', label: 'Restaurantes e Lanchonetes', sector: 'Alimentação' },
  '5612': { mcc: '5812', label: 'Bares e Restaurantes', sector: 'Alimentação' },
  '5620': { mcc: '5812', label: 'Alimentação — Serviços de Catering', sector: 'Alimentação' },
  '5621': { mcc: '5812', label: 'Restaurantes em Transporte', sector: 'Alimentação' },
  '5629': { mcc: '5812', label: 'Outros Serviços de Alimentação', sector: 'Alimentação' },
  '5630': { mcc: '5814', label: 'Fast Food e Lanchonetes', sector: 'Alimentação' },
  '5631': { mcc: '5814', label: 'Fast Food — Franchises', sector: 'Alimentação' },
  '5639': { mcc: '5814', label: 'Outros Serviços de Fast Food', sector: 'Alimentação' },

  // ─── SUPERMERCADOS E MERCEARIAS ──────────────────────────────────────────
  '4711': { mcc: '5411', label: 'Supermercados e Hipermercados', sector: 'Varejo Alimentar' },
  '4712': { mcc: '5411', label: 'Mercearias e Minimercados', sector: 'Varejo Alimentar' },
  '4721': { mcc: '5462', label: 'Padarias e Confeitarias', sector: 'Varejo Alimentar' },
  '4722': { mcc: '5441', label: 'Doces, Balas e Chocolates', sector: 'Varejo Alimentar' },
  '4723': { mcc: '5411', label: 'Comércio de Alimentos Especializados', sector: 'Varejo Alimentar' },
  '4724': { mcc: '5451', label: 'Laticínios e Frios', sector: 'Varejo Alimentar' },
  '4729': { mcc: '5499', label: 'Outros Comércios Alimentares', sector: 'Varejo Alimentar' },
  '4731': { mcc: '5541', label: 'Postos de Combustível', sector: 'Varejo Alimentar' },
  '4741': { mcc: '5921', label: 'Bebidas Alcoólicas — Varejo', sector: 'Varejo Alimentar' },
  '4751': { mcc: '5732', label: 'Eletrodomésticos e Eletrônicos', sector: 'Varejo' },
  '4752': { mcc: '5732', label: 'Equipamentos de Informática', sector: 'Varejo' },
  '4753': { mcc: '5734', label: 'Lojas de Informática e Software', sector: 'Varejo' },
  '4754': { mcc: '5722', label: 'Eletrodomésticos — Linha Branca', sector: 'Varejo' },
  '4755': { mcc: '5732', label: 'Eletrônicos — Varejo Especializado', sector: 'Varejo' },
  '4756': { mcc: '5065', label: 'Material Elétrico e Componentes', sector: 'Varejo' },
  '4757': { mcc: '5065', label: 'Equipamentos de Automação', sector: 'Varejo' },
  '4759': { mcc: '5732', label: 'Outros Eletrônicos', sector: 'Varejo' },
  '4761': { mcc: '5942', label: 'Livrarias', sector: 'Varejo' },
  '4762': { mcc: '5943', label: 'Papelarias e Material de Escritório', sector: 'Varejo' },
  '4763': { mcc: '5733', label: 'Instrumentos Musicais', sector: 'Varejo' },
  '4764': { mcc: '5940', label: 'Artigos Esportivos', sector: 'Varejo' },
  '4765': { mcc: '5945', label: 'Brinquedos e Jogos', sector: 'Varejo' },
  '4771': { mcc: '5912', label: 'Farmácias e Drogarias', sector: 'Saúde' },
  '4772': { mcc: '5122', label: 'Distribuidoras de Medicamentos', sector: 'Saúde' },
  '4773': { mcc: '5912', label: 'Perfumarias e Cosméticos — Varejo', sector: 'Saúde' },
  '4774': { mcc: '5977', label: 'Produtos de Higiene e Beleza', sector: 'Saúde' },
  '4781': { mcc: '5521', label: 'Concessionárias — Veículos Usados', sector: 'Veículos' },
  '4782': { mcc: '5521', label: 'Lojas de Veículos Usados', sector: 'Veículos' },
  '4783': { mcc: '5599', label: 'Peças e Acessórios — Varejo', sector: 'Veículos' },
  '4784': { mcc: '4784', label: 'Pedágios e Estradas com Pedágio', sector: 'Transporte' },
  '4785': { mcc: '5561', label: 'Motocicletas — Varejo', sector: 'Veículos' },
  '4789': { mcc: '5592', label: 'Trailers e Motorhomes', sector: 'Veículos' },
  '4791': { mcc: '5999', label: 'Comércio de Combustíveis Sólidos', sector: 'Varejo' },
  '4792': { mcc: '5983', label: 'Lenha e Gás a Granel', sector: 'Varejo' },
  '4793': { mcc: '5983', label: 'Botijões de Gás — Varejo', sector: 'Varejo' },

  // ─── VESTUÁRIO E CALÇADOS ────────────────────────────────────────────────
  '4641': { mcc: '5691', label: 'Lojas de Roupas', sector: 'Moda' },
  '4642': { mcc: '5621', label: 'Moda Feminina', sector: 'Moda' },
  '4643': { mcc: '5611', label: 'Moda Masculina', sector: 'Moda' },
  '4644': { mcc: '5641', label: 'Moda Infantil', sector: 'Moda' },
  '4645': { mcc: '5655', label: 'Artigos Esportivos — Vestuário', sector: 'Moda' },
  '4646': { mcc: '5699', label: 'Tecidos e Armarinho', sector: 'Moda' },
  '4647': { mcc: '5699', label: 'Acessórios de Moda', sector: 'Moda' },
  '4648': { mcc: '5631', label: 'Bolsas, Cintos e Acessórios Femininos', sector: 'Moda' },
  '4649': { mcc: '5699', label: 'Outros Artigos de Vestuário', sector: 'Moda' },
  '4661': { mcc: '5661', label: 'Calçados — Varejo', sector: 'Moda' },
  '4662': { mcc: '5661', label: 'Sapatarias e Tênis', sector: 'Moda' },
  '4663': { mcc: '5661', label: 'Calçados Esportivos', sector: 'Moda' },
  '4664': { mcc: '5948', label: 'Artigos de Couro e Viagem', sector: 'Moda' },

  // ─── MÓVEIS E DECORAÇÃO ──────────────────────────────────────────────────
  '4616': { mcc: '5712', label: 'Móveis e Decoração', sector: 'Casa' },
  '4617': { mcc: '5719', label: 'Objetos de Arte e Decoração', sector: 'Casa' },
  '4618': { mcc: '5714', label: 'Cortinas e Persianas', sector: 'Casa' },
  '4619': { mcc: '5712', label: 'Outros Artigos de Decoração', sector: 'Casa' },
  '4623': { mcc: '5021', label: 'Móveis para Escritório', sector: 'Casa' },
  '4624': { mcc: '5712', label: 'Móveis Artesanais', sector: 'Casa' },

  // ─── CONSTRUÇÃO — MATERIAIS ──────────────────────────────────────────────
  '4744': { mcc: '5211', label: 'Madeireiras e Materiais de Construção', sector: 'Construção' },
  '4745': { mcc: '5251', label: 'Ferragens e Ferramentas', sector: 'Construção' },
  '4746': { mcc: '5211', label: 'Materiais Hidráulicos e Elétricos', sector: 'Construção' },
  '4747': { mcc: '5231', label: 'Tintas, Vernizes e Solventes', sector: 'Construção' },
  '4748': { mcc: '5261', label: 'Jardins, Plantas e Viveiros', sector: 'Construção' },

  // ─── JOIAS E RELOJOARIA ──────────────────────────────────────────────────
  '4721': { mcc: '5944', label: 'Joalherias e Bijouterias', sector: 'Joias' },
  '4722': { mcc: '5944', label: 'Relojoarias', sector: 'Joias' },
  '4723': { mcc: '5944', label: 'Joias, Relógios e Acessórios', sector: 'Joias' },

  // ─── FARMÁCIAS E SAÚDE ───────────────────────────────────────────────────
  '5912': { mcc: '5912', label: 'Farmácias e Drogarias', sector: 'Saúde' },
  '4771': { mcc: '5912', label: 'Farmácias e Drogarias', sector: 'Saúde' },

  // ─── SERVIÇOS DE SAÚDE ───────────────────────────────────────────────────
  '8610': { mcc: '8099', label: 'Atividades de Saúde Humana', sector: 'Saúde' },
  '8621': { mcc: '8021', label: 'Clínicas Odontológicas', sector: 'Saúde' },
  '8622': { mcc: '8021', label: 'Laboratórios de Prótese Dentária', sector: 'Saúde' },
  '8630': { mcc: '8099', label: 'Atividades de Enfermagem', sector: 'Saúde' },
  '8640': { mcc: '8099', label: 'Atividades Fisioterápicas', sector: 'Saúde' },
  '8650': { mcc: '8049', label: 'Atividades Psicológicas', sector: 'Saúde' },
  '8660': { mcc: '8049', label: 'Fonoaudiologia e Terapia Ocupacional', sector: 'Saúde' },
  '8690': { mcc: '8099', label: 'Outros Profissionais de Saúde', sector: 'Saúde' },
  '8711': { mcc: '8062', label: 'Hospitais Gerais', sector: 'Saúde' },
  '8712': { mcc: '8062', label: 'Hospitais Especializados', sector: 'Saúde' },
  '8720': { mcc: '8050', label: 'Clínicas e Residências Geriátricas', sector: 'Saúde' },
  '8730': { mcc: '8099', label: 'Atividades de Atenção Ambulatorial', sector: 'Saúde' },
  '8731': { mcc: '8099', label: 'Clínicas Médicas Especializadas', sector: 'Saúde' },
  '8740': { mcc: '8071', label: 'Serviços de Diagnóstico por Imagem', sector: 'Saúde' },
  '8750': { mcc: '8071', label: 'Laborátorios de Análises Clínicas', sector: 'Saúde' },
  '8800': { mcc: '8099', label: 'Serviços de Saúde Coletiva', sector: 'Saúde' },
  '8610': { mcc: '8011', label: 'Médicos — Clínica Geral', sector: 'Saúde' },
  '8011': { mcc: '8011', label: 'Médicos e Clínicas Médicas', sector: 'Saúde' },
  '8021': { mcc: '8021', label: 'Odontologia', sector: 'Saúde' },
  '8031': { mcc: '8031', label: 'Osteopatia', sector: 'Saúde' },
  '8041': { mcc: '8041', label: 'Quiropraxia', sector: 'Saúde' },
  '8042': { mcc: '8042', label: 'Oftalmologia', sector: 'Saúde' },
  '8511': { mcc: '8049', label: 'Psicologia', sector: 'Saúde' },
  '8512': { mcc: '8049', label: 'Psiquiatria', sector: 'Saúde' },

  // ─── EDUCAÇÃO ────────────────────────────────────────────────────────────
  '8511': { mcc: '8211', label: 'Educação Infantil e Fundamental', sector: 'Educação' },
  '8512': { mcc: '8211', label: 'Ensino Médio', sector: 'Educação' },
  '8513': { mcc: '8220', label: 'Ensino Superior', sector: 'Educação' },
  '8520': { mcc: '8220', label: 'Universidades e Faculdades', sector: 'Educação' },
  '8531': { mcc: '8299', label: 'Educação Profissional e Técnica', sector: 'Educação' },
  '8532': { mcc: '8249', label: 'Cursos Profissionalizantes', sector: 'Educação' },
  '8540': { mcc: '8220', label: 'Pós-Graduação e MBA', sector: 'Educação' },
  '8550': { mcc: '8299', label: 'Atividades de Apoio à Educação', sector: 'Educação' },
  '8591': { mcc: '8241', label: 'Ensino a Distância (EAD)', sector: 'Educação' },
  '8592': { mcc: '8299', label: 'Cursos Livres e Idiomas', sector: 'Educação' },
  '8593': { mcc: '8299', label: 'Autoescolas', sector: 'Educação' },
  '8599': { mcc: '8299', label: 'Outras Atividades de Ensino', sector: 'Educação' },
  '8600': { mcc: '8351', label: 'Creches e Berçários', sector: 'Educação' },

  // ─── TECNOLOGIA DA INFORMAÇÃO ────────────────────────────────────────────
  '6201': { mcc: '7372', label: 'Desenvolvimento de Software', sector: 'TI' },
  '6202': { mcc: '7372', label: 'Desenvolvimento de Aplicativos', sector: 'TI' },
  '6203': { mcc: '7374', label: 'Processamento de Dados', sector: 'TI' },
  '6204': { mcc: '7374', label: 'Hospedagem e Infraestrutura Digital', sector: 'TI' },
  '6209': { mcc: '7372', label: 'Outras Atividades de TI', sector: 'TI' },
  '6311': { mcc: '7375', label: 'Portais e Provedores de Internet', sector: 'TI' },
  '6319': { mcc: '4816', label: 'Provedores de Internet e Infraestrutura', sector: 'TI' },
  '6391': { mcc: '7379', label: 'Manutenção e Suporte em TI', sector: 'TI' },
  '6399': { mcc: '7379', label: 'Outras Atividades de Suporte a TI', sector: 'TI' },
  '6201': { mcc: '5045', label: 'Comércio de Equipamentos de TI', sector: 'TI' },

  // ─── TELECOMUNICAÇÕES ────────────────────────────────────────────────────
  '6110': { mcc: '4813', label: 'Telefonia Fixa', sector: 'Telecom' },
  '6120': { mcc: '4812', label: 'Telefonia Móvel', sector: 'Telecom' },
  '6130': { mcc: '4814', label: 'Telecomunicações por Satélite', sector: 'Telecom' },
  '6141': { mcc: '4899', label: 'TV por Assinatura — Cabo', sector: 'Telecom' },
  '6142': { mcc: '4899', label: 'TV por Assinatura — Satélite', sector: 'Telecom' },
  '6143': { mcc: '4899', label: 'TV por Assinatura — Internet', sector: 'Telecom' },
  '6190': { mcc: '4814', label: 'Outras Telecomunicações', sector: 'Telecom' },

  // ─── SERVIÇOS FINANCEIROS ────────────────────────────────────────────────
  '6411': { mcc: '6012', label: 'Bancos Comerciais', sector: 'Financeiro' },
  '6412': { mcc: '6012', label: 'Bancos Múltiplos', sector: 'Financeiro' },
  '6421': { mcc: '6012', label: 'Bancos de Investimento', sector: 'Financeiro' },
  '6422': { mcc: '6012', label: 'Bancos de Câmbio', sector: 'Financeiro' },
  '6431': { mcc: '6012', label: 'Cooperativas de Crédito', sector: 'Financeiro' },
  '6432': { mcc: '6012', label: 'Associações de Poupança e Empréstimo', sector: 'Financeiro' },
  '6433': { mcc: '6012', label: 'Financeiras e Caixas Econômicas', sector: 'Financeiro' },
  '6434': { mcc: '6099', label: 'Sociedades de Crédito ao Microempreendedor', sector: 'Financeiro' },
  '6435': { mcc: '6099', label: 'Fintechs de Crédito', sector: 'Financeiro' },
  '6436': { mcc: '6530', label: 'Instituições de Pagamento', sector: 'Financeiro' },
  '6437': { mcc: '6099', label: 'Correspondentes Bancários', sector: 'Financeiro' },
  '6438': { mcc: '4829', label: 'Transferências e Remessas', sector: 'Financeiro' },
  '6450': { mcc: '6211', label: 'Corretoras e Distribuidoras de Valores', sector: 'Financeiro' },
  '6461': { mcc: '6211', label: 'Fundos de Investimento', sector: 'Financeiro' },
  '6462': { mcc: '6211', label: 'Administradoras de Carteiras', sector: 'Financeiro' },
  '6470': { mcc: '6300', label: 'Seguradoras', sector: 'Financeiro' },
  '6480': { mcc: '6381', label: 'Previdência Complementar', sector: 'Financeiro' },
  '6491': { mcc: '6099', label: 'Serviços Financeiros Auxiliares', sector: 'Financeiro' },
  '6492': { mcc: '6099', label: 'Factoring e Securitização', sector: 'Financeiro' },
  '6493': { mcc: '6051', label: 'Câmbio e Moedas Digitais', sector: 'Financeiro' },
  '6499': { mcc: '6099', label: 'Outras Atividades Financeiras', sector: 'Financeiro' },

  // ─── IMÓVEIS ─────────────────────────────────────────────────────────────
  '6811': { mcc: '6513', label: 'Incorporação Imobiliária', sector: 'Imóveis' },
  '6821': { mcc: '6513', label: 'Corretoras Imobiliárias', sector: 'Imóveis' },
  '6822': { mcc: '6513', label: 'Administradoras de Imóveis', sector: 'Imóveis' },

  // ─── SERVIÇOS JURÍDICOS ──────────────────────────────────────────────────
  '6911': { mcc: '8111', label: 'Advocacia', sector: 'Jurídico' },
  '6912': { mcc: '8111', label: 'Cartórios', sector: 'Jurídico' },
  '6920': { mcc: '8111', label: 'Atividades Jurídicas e Notariais', sector: 'Jurídico' },

  // ─── CONTABILIDADE E AUDITORIA ───────────────────────────────────────────
  '6920': { mcc: '8721', label: 'Contabilidade e Auditoria', sector: 'Contabilidade' },
  '6931': { mcc: '8721', label: 'Escritórios de Contabilidade', sector: 'Contabilidade' },
  '6932': { mcc: '8721', label: 'Auditoria e Perícia Contábil', sector: 'Contabilidade' },

  // ─── CONSULTORIA E ENGENHARIA ────────────────────────────────────────────
  '7111': { mcc: '8711', label: 'Engenharia Civil e Projetos', sector: 'Engenharia' },
  '7112': { mcc: '8711', label: 'Engenharia Elétrica e Eletrônica', sector: 'Engenharia' },
  '7119': { mcc: '8711', label: 'Outras Engenharias', sector: 'Engenharia' },
  '7120': { mcc: '8712', label: 'Arquitetura e Urbanismo', sector: 'Engenharia' },
  '7131': { mcc: '8713', label: 'Topografia e Geodésia', sector: 'Engenharia' },
  '7132': { mcc: '8713', label: 'Cartografia', sector: 'Engenharia' },
  '7190': { mcc: '8748', label: 'Consultoria Técnica e Especializada', sector: 'Consultoria' },
  '7210': { mcc: '8742', label: 'Pesquisa e Desenvolvimento', sector: 'Consultoria' },
  '7220': { mcc: '8731', label: 'Pesquisa Científica', sector: 'Consultoria' },
  '7311': { mcc: '7392', label: 'Publicidade e Propaganda', sector: 'Marketing' },
  '7312': { mcc: '7392', label: 'Agências de Publicidade', sector: 'Marketing' },
  '7319': { mcc: '7392', label: 'Outros Serviços de Publicidade', sector: 'Marketing' },
  '7320': { mcc: '8743', label: 'Pesquisa de Mercado e Opinião', sector: 'Marketing' },
  '7391': { mcc: '8742', label: 'Holding e Gestão de Participações', sector: 'Consultoria' },
  '7490': { mcc: '7399', label: 'Atividades Administrativas Especializadas', sector: 'Consultoria' },
  '7491': { mcc: '8742', label: 'Seleção e Agenciamento de Mão de Obra', sector: 'Consultoria' },
  '7492': { mcc: '7361', label: 'Serviços Temporários (RH)', sector: 'Consultoria' },
  '7493': { mcc: '7349', label: 'Limpeza e Conservação', sector: 'Serviços' },
  '7494': { mcc: '7349', label: 'Serviços de Vigilância e Segurança', sector: 'Serviços' },
  '7495': { mcc: '7342', label: 'Controle de Pragas', sector: 'Serviços' },
  '7496': { mcc: '7394', label: 'Locação de Máquinas e Equipamentos', sector: 'Serviços' },
  '7499': { mcc: '7399', label: 'Outros Serviços de Apoio a Negócios', sector: 'Serviços' },

  // ─── SERVIÇOS PESSOAIS ───────────────────────────────────────────────────
  '9601': { mcc: '7211', label: 'Lavanderias', sector: 'Serviços Pessoais' },
  '9602': { mcc: '7216', label: 'Lavanderias a Seco', sector: 'Serviços Pessoais' },
  '9603': { mcc: '7261', label: 'Serviços Funerários', sector: 'Serviços Pessoais' },
  '9609': { mcc: '7299', label: 'Outros Serviços Pessoais', sector: 'Serviços Pessoais' },
  '9611': { mcc: '7230', label: 'Cabeleireiros e Barbearias', sector: 'Serviços Pessoais' },
  '9612': { mcc: '7298', label: 'Clínicas de Estética e Beleza', sector: 'Serviços Pessoais' },
  '9613': { mcc: '7297', label: 'Massoterapia e Relaxamento', sector: 'Serviços Pessoais' },
  '9614': { mcc: '7230', label: 'Salões de Beleza e Spas', sector: 'Serviços Pessoais' },
  '9620': { mcc: '7251', label: 'Sapateiros e Reparação de Calçados', sector: 'Serviços Pessoais' },
  '9700': { mcc: '7276', label: 'Serviços de Assessoria Fiscal', sector: 'Serviços Pessoais' },

  // ─── HOSPEDAGEM ──────────────────────────────────────────────────────────
  '5510': { mcc: '7011', label: 'Hotéis e Pousadas', sector: 'Hospedagem' },
  '5590': { mcc: '7011', label: 'Outros Estabelecimentos de Hospedagem', sector: 'Hospedagem' },
  '5591': { mcc: '7011', label: 'Albergues e Hostels', sector: 'Hospedagem' },
  '5592': { mcc: '7033', label: 'Campings e Parques de Lazer', sector: 'Hospedagem' },
  '5599': { mcc: '7011', label: 'Outros Meios de Hospedagem', sector: 'Hospedagem' },

  // ─── VIAGENS E TURISMO ───────────────────────────────────────────────────
  '7911': { mcc: '4722', label: 'Agências de Viagens', sector: 'Turismo' },
  '7912': { mcc: '4723', label: 'Operadoras de Turismo', sector: 'Turismo' },
  '7990': { mcc: '7999', label: 'Serviços de Recreação e Lazer', sector: 'Turismo' },

  // ─── AVIAÇÃO ─────────────────────────────────────────────────────────────
  '5111': { mcc: '4511', label: 'Transporte Aéreo de Passageiros', sector: 'Aviação' },
  '5112': { mcc: '4511', label: 'Aviação Regional', sector: 'Aviação' },
  '5120': { mcc: '4511', label: 'Transporte Aéreo de Cargas', sector: 'Aviação' },

  // ─── ENTRETENIMENTO E MÍDIA ──────────────────────────────────────────────
  '5911': { mcc: '7832', label: 'Cinemas', sector: 'Entretenimento' },
  '5912': { mcc: '7832', label: 'Exibição de Filmes', sector: 'Entretenimento' },
  '5920': { mcc: '7929', label: 'Produção Musical e Artística', sector: 'Entretenimento' },
  '5930': { mcc: '7922', label: 'Teatro e Ópera', sector: 'Entretenimento' },
  '5940': { mcc: '7929', label: 'Produção de Shows e Eventos', sector: 'Entretenimento' },
  '5950': { mcc: '7929', label: 'Agências de Artistas', sector: 'Entretenimento' },
  '5960': { mcc: '7911', label: 'Escolas de Dança', sector: 'Entretenimento' },
  '9001': { mcc: '7996', label: 'Parques de Diversão', sector: 'Entretenimento' },
  '9002': { mcc: '7991', label: 'Museus e Pontos Turísticos', sector: 'Entretenimento' },
  '9003': { mcc: '7998', label: 'Aquários e Zoológicos', sector: 'Entretenimento' },
  '9200': { mcc: '7995', label: 'Loterias e Apostas', sector: 'Entretenimento' },
  '9201': { mcc: '7800', label: 'Hipódromos e Jóqueis', sector: 'Entretenimento' },
  '9204': { mcc: '7993', label: 'Bingos e Jogos de Azar', sector: 'Entretenimento' },

  // ─── ESPORTE E FITNESS ───────────────────────────────────────────────────
  '9311': { mcc: '7997', label: 'Clubes Sociais e Esportivos', sector: 'Esporte' },
  '9312': { mcc: '7941', label: 'Estádios e Arenas Esportivas', sector: 'Esporte' },
  '9313': { mcc: '7992', label: 'Golfe e Country Clubs', sector: 'Esporte' },
  '9319': { mcc: '7999', label: 'Outros Serviços Esportivos', sector: 'Esporte' },
  '9321': { mcc: '7997', label: 'Academias de Ginástica', sector: 'Esporte' },
  '9329': { mcc: '7999', label: 'Centros de Bem-estar e Fitness', sector: 'Esporte' },

  // ─── UTILIDADES PÚBLICAS ─────────────────────────────────────────────────
  '3510': { mcc: '4900', label: 'Geração de Energia Elétrica', sector: 'Utilidades' },
  '3520': { mcc: '4900', label: 'Transmissão de Energia Elétrica', sector: 'Utilidades' },
  '3530': { mcc: '4900', label: 'Distribuição de Energia Elétrica', sector: 'Utilidades' },
  '3600': { mcc: '4900', label: 'Produção e Distribuição de Gás', sector: 'Utilidades' },
  '3700': { mcc: '4900', label: 'Saneamento Ambiental', sector: 'Utilidades' },
  '3811': { mcc: '4900', label: 'Gestão de Resíduos Sólidos', sector: 'Utilidades' },
  '3812': { mcc: '4900', label: 'Coleta de Resíduos Perigosos', sector: 'Utilidades' },
  '3821': { mcc: '4900', label: 'Tratamento de Resíduos', sector: 'Utilidades' },
  '3822': { mcc: '4900', label: 'Recuperação de Materiais', sector: 'Utilidades' },
  '3900': { mcc: '4900', label: 'Descontaminação e Serviços Ambientais', sector: 'Utilidades' },

  // ─── SERVIÇOS GOVERNAMENTAIS ─────────────────────────────────────────────
  '8411': { mcc: '9399', label: 'Administração Pública Federal', sector: 'Governo' },
  '8412': { mcc: '9399', label: 'Administração Pública Estadual', sector: 'Governo' },
  '8413': { mcc: '9399', label: 'Administração Pública Municipal', sector: 'Governo' },
  '8421': { mcc: '9311', label: 'Regulação e Fiscalização', sector: 'Governo' },
  '8422': { mcc: '9222', label: 'Segurança Pública', sector: 'Governo' },
  '8430': { mcc: '9211', label: 'Defesa e Segurança Nacional', sector: 'Governo' },
  '8440': { mcc: '9311', label: 'Serviços Tributários', sector: 'Governo' },
  '8450': { mcc: '9399', label: 'Serviços de Saúde Pública', sector: 'Governo' },
  '8460': { mcc: '9399', label: 'Serviços de Educação Pública', sector: 'Governo' },
  '8491': { mcc: '9399', label: 'Serviços Públicos de Assistência Social', sector: 'Governo' },
  '8499': { mcc: '9399', label: 'Outros Serviços Governamentais', sector: 'Governo' },
  '8500': { mcc: '9402', label: 'Correios e Serviços Postais Oficiais', sector: 'Governo' },

  // ─── ORGANIZAÇÕES SEM FINS LUCRATIVOS ────────────────────────────────────
  '9411': { mcc: '8641', label: 'Associações e Organizações Civis', sector: 'Terceiro Setor' },
  '9412': { mcc: '8398', label: 'ONGs e Entidades Filantrópicas', sector: 'Terceiro Setor' },
  '9420': { mcc: '8651', label: 'Partidos e Organizações Políticas', sector: 'Terceiro Setor' },
  '9430': { mcc: '8641', label: 'Sindicatos e Confederações', sector: 'Terceiro Setor' },
  '9491': { mcc: '8661', label: 'Organizações Religiosas', sector: 'Terceiro Setor' },
  '9492': { mcc: '8661', label: 'Igrejas e Templos', sector: 'Terceiro Setor' },
  '9493': { mcc: '8699', label: 'Maçonaria e Organizações Fraternas', sector: 'Terceiro Setor' },
  '9499': { mcc: '8699', label: 'Outras Organizações Associativas', sector: 'Terceiro Setor' },

  // ─── COMÉRCIO DIGITAL / INFOPRODUTOS ────────────────────────────────────
  '7319': { mcc: '5815', label: 'Venda de Conteúdo Digital', sector: 'Digital' },
  '7490': { mcc: '5816', label: 'Jogos Digitais', sector: 'Digital' },
  '7431': { mcc: '5817', label: 'Aplicativos e Software', sector: 'Digital' },
  '7432': { mcc: '5818', label: 'Marketplace Digital', sector: 'Digital' },
  '5961': { mcc: '5961', label: 'Comércio por Catálogo e Internet', sector: 'Digital' },
  '4791': { mcc: '5968', label: 'Assinaturas Digitais', sector: 'Digital' },

  // ─── ESTACIONAMENTOS E GARAGENS ──────────────────────────────────────────
  '5223': { mcc: '7521', label: 'Estacionamentos e Garagens', sector: 'Transporte' },
  '7810': { mcc: '7521', label: 'Estacionamentos', sector: 'Transporte' },

  // ─── SERVIÇOS AUTOMOTIVOS ────────────────────────────────────────────────
  '7720': { mcc: '7538', label: 'Oficinas e Mecânicas', sector: 'Automotivo' },
  '7731': { mcc: '7531', label: 'Funilaria e Pintura', sector: 'Automotivo' },
  '7732': { mcc: '7542', label: 'Lava-Rápido e Higienização', sector: 'Automotivo' },
  '7733': { mcc: '7534', label: 'Borracharias', sector: 'Automotivo' },
  '7734': { mcc: '7549', label: 'Guincho e Assistência 24h', sector: 'Automotivo' },
  '7735': { mcc: '7532', label: 'Instalação de Som e Acessórios', sector: 'Automotivo' },
  '7739': { mcc: '7538', label: 'Outros Serviços Automotivos', sector: 'Automotivo' },

  // ─── SERVIÇOS DE IMPRESSÃO E GRÁFICAS ───────────────────────────────────
  '1811': { mcc: '2741', label: 'Edição de Livros e Publicações', sector: 'Editorial' },
  '1812': { mcc: '2741', label: 'Edição de Jornais e Revistas', sector: 'Editorial' },
  '1813': { mcc: '2741', label: 'Edição de Conteúdo Exclusivamente Digital', sector: 'Editorial' },
  '1821': { mcc: '7338', label: 'Impressão de Jornais e Materiais Gráficos', sector: 'Editorial' },
  '1822': { mcc: '2791', label: 'Impressão de Material de Segurança', sector: 'Editorial' },
  '1830': { mcc: '7338', label: 'Reprodução de Materiais Gravados', sector: 'Editorial' },

  // ─── SERVIÇOS DE FOTOGRAFIA E AUDIOVISUAL ───────────────────────────────
  '7420': { mcc: '7221', label: 'Fotografia Profissional', sector: 'Mídia' },
  '5912': { mcc: '7946', label: 'Locação de Filmes e DVDs', sector: 'Mídia' },
  '5913': { mcc: '7829', label: 'Produção e Distribuição Audiovisual', sector: 'Mídia' },
  '5914': { mcc: '7832', label: 'Produção Cinematográfica', sector: 'Mídia' },
  '6010': { mcc: '7333', label: 'Fotografia Comercial e Publicidade', sector: 'Mídia' },

  // ─── ALUGUEL E LOCAÇÃO ───────────────────────────────────────────────────
  '7711': { mcc: '7512', label: 'Locação de Automóveis', sector: 'Locação' },
  '7719': { mcc: '7513', label: 'Locação de Outros Transportes', sector: 'Locação' },
  '7721': { mcc: '7394', label: 'Locação de Equipamentos', sector: 'Locação' },
  '7722': { mcc: '7394', label: 'Locação de Máquinas', sector: 'Locação' },
  '7729': { mcc: '7394', label: 'Locação de Outros Bens Móveis', sector: 'Locação' },
  '7731': { mcc: '7296', label: 'Aluguel de Fantasias e Roupas Formais', sector: 'Locação' },

  // ─── PET SHOPS ───────────────────────────────────────────────────────────
  '4789': { mcc: '5995', label: 'Pet Shops e Produtos para Animais', sector: 'Pet' },
  '0141': { mcc: '5995', label: 'Serviços Veterinários e Pet Shops', sector: 'Pet' },
  '9609': { mcc: '5995', label: 'Banho e Tosa', sector: 'Pet' },
};

/**
 * Resolve o MCC a partir dos primeiros 4 dígitos do CNAE fiscal.
 * Retorna null se o CNAE não estiver mapeado na tabela ABECS.
 */
export function resolveMcc(cnae: string): MccEntry | null {
  const prefix = String(cnae).replace(/\D/g, '').slice(0, 4);
  return CNAE_MCC_TABLE[prefix] ?? null;
}

/**
 * Lista todos os setores disponíveis na tabela.
 */
export function listSectors(): string[] {
  return [...new Set(Object.values(CNAE_MCC_TABLE).map(e => e.sector))].sort();
}

/**
 * Lista todos os MCCs únicos disponíveis.
 */
export function listMccs(): string[] {
  return [...new Set(Object.values(CNAE_MCC_TABLE).map(e => e.mcc))].sort();
}

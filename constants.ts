import { User, UserRole, Document } from './types';

// Palette from image
export const COLORS = {
  darkest: '#051F20',
  dark: '#0B2B26',
  mediumDark: '#163832',
  primary: '#235347',
  accent: '#8EB69B',
  lightest: '#DAF1DE',
  white: '#FFFFFF',
};

export const LOGO_URL = "https://raw.githubusercontent.com/synapiens/uteis/refs/heads/main/LogoPaipe/Marca_paipe-full-inverted.png";
export const LOGO_COLOR_URL = "https://raw.githubusercontent.com/synapiens/uteis/refs/heads/main/LogoPaipe/Marca_paipe-color-full.png";

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Silva', email: 'alice@paipe.co', role: UserRole.ADMIN, status: 'Active' },
  { id: '2', name: 'Bob Santos', email: 'bob@paipe.co', role: UserRole.USER, status: 'Active' },
  { id: '3', name: 'Charlie Costa', email: 'charlie@paipe.co', role: UserRole.VIEWER, status: 'Inactive' },
];

export const MOCK_DOCS: Document[] = [
  { id: '1', name: 'Contrato_Prestacao_Servicos_XPTO.pdf', type: 'Contrato', uploadedBy: 'Alice Silva', date: '2023-10-25', size: '2.4 MB', status: 'Processed' },
  { id: '2', name: 'Manual_Conduta_Interna.docx', type: 'Normativo', uploadedBy: 'Bob Santos', date: '2023-10-24', size: '1.1 MB', status: 'Processed' },
  { id: '3', name: 'Relatorio_Financeiro_Q3.csv', type: 'Relatório', uploadedBy: 'Alice Silva', date: '2023-10-20', size: '500 KB', status: 'Processed' },
  { id: '4', name: 'NDA_Partner_Y.pdf', type: 'NDA', uploadedBy: 'Bob Santos', date: '2023-10-18', size: '1.8 MB', status: 'Pending' },
];

export const DOC_TYPES = ['Contrato de Trabalho', 'Contrato de Locação', 'NDA', 'Proposta Comercial', 'Relatório Técnico'];
export const COMPANIES = ['Paipe Tecnologia', 'Empresa X', 'Partner Corp', 'Consultoria ABC'];
export const KNOWLEDGE_SUBJECTS = ['Política de RH', 'Processos de Vendas', 'Normas de Segurança', 'Documentação Técnica', 'Jurídico Geral'];
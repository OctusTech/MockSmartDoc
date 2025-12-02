import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layout } from './components/Layout';
import { LOGO_URL, LOGO_COLOR_URL, MOCK_USERS, MOCK_DOCS, DOC_TYPES, COMPANIES, KNOWLEDGE_SUBJECTS } from './constants';
import { User, ChatMessage, Document, UserRole } from './types';
import { generateChatResponse, analyzeDocument } from './geminiService';

// --- Shared UI Components ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 p-8 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, sub, icon }: { title: string; value: string; sub?: string; icon: React.ReactNode }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="absolute top-0 right-0 w-24 h-24 bg-smart-lightest/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
    
    <div className="flex justify-between items-start z-10">
       <div className="p-2 bg-smart-lightest text-smart-primary rounded-xl">
         {icon}
       </div>
       {sub && <span className="text-xs font-semibold text-gray-400 bg-white/50 px-2 py-1 rounded-full uppercase">{sub}</span>}
    </div>
    
    <div className="z-10 mt-2">
      <h3 className="text-3xl font-bold text-smart-darkest">{value}</h3>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
    </div>
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const isProcessed = status === 'Processed' || status === 'Active';
  const isPending = status === 'Pending';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide
      ${isProcessed ? 'bg-green-100 text-green-700' : 
        isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
      {status}
    </span>
  );
};

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-smart-darkest p-4">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-smart-primary to-smart-accent"></div>
      <div className="bg-white p-10 text-center">
         <img src={LOGO_COLOR_URL} alt="Logo" className="h-16 mx-auto mb-6 object-contain" />
         <h1 className="text-3xl font-bold text-smart-darkest mb-2">Bem-vindo</h1>
         <p className="text-gray-500 text-sm">Smart Doc AI Intelligence Platform</p>
      </div>
      <div className="px-10 pb-10 space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smart-primary focus:bg-white transition-all outline-none"
            placeholder="usuario@empresa.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha</label>
          <input 
            type="password" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smart-primary focus:bg-white transition-all outline-none"
            placeholder="••••••••"
          />
        </div>
        <button 
          onClick={onLogin}
          className="w-full bg-smart-darkest hover:bg-smart-primary text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg mt-4"
        >
          Acessar Painel
        </button>
      </div>
    </div>
  </div>
);

const KnowledgeView = () => {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCS);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: 'Novo Upload',
        uploadedBy: 'Alice Silva',
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'Pending'
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Knowledge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Documentos Indexados" value={documents.length.toString()} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <StatCard title="Armazenamento Utilizado" value="4.2 GB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>} />
        <StatCard title="Uploads Recentes" value="12" sub="Esta Semana" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <h2 className="text-2xl font-bold text-smart-darkest mb-2">Base de Conhecimento</h2>
          <p className="text-gray-500 mb-6">Gerencie os arquivos utilizados para alimentar a inteligência artificial.</p>
          
          {/* Upload Box */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors mb-8 cursor-pointer relative overflow-hidden
              ${dragActive ? 'border-smart-primary bg-smart-lightest/30' : 'border-gray-200 hover:border-smart-accent bg-gray-50/50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
             <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none">
                <div className="h-16 w-16 bg-white shadow-sm text-smart-primary rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h3 className="text-lg font-bold text-smart-darkest">Arraste arquivos aqui ou clique para upload</h3>
                <p className="text-gray-400 mt-2">Suporte para PDF, DOCX, CSV, MD e TXT</p>
             </div>
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                   const newDoc: Document = {
                      id: Date.now().toString(),
                      name: file.name,
                      type: 'Upload Manual',
                      uploadedBy: 'Você',
                      date: new Date().toISOString().split('T')[0],
                      size: 'Calculating...',
                      status: 'Pending'
                    };
                    setDocuments(prev => [newDoc, ...prev]);
                }
             }} />
          </div>

          {/* Search & Filter */}
          <div className="flex items-center justify-between mb-6">
             <div className="relative w-full max-w-md">
                <span className="absolute left-4 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou tipo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-smart-lightest"
                />
             </div>
             <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">Filtrar</button>
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-4 px-4">Nome do Arquivo</th>
                  <th className="py-4 px-4">Tipo</th>
                  <th className="py-4 px-4">Tamanho</th>
                  <th className="py-4 px-4">Enviado por</th>
                  <th className="py-4 px-4">Data</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-0">
                    <td className="py-4 px-4 font-medium text-smart-darkest flex items-center gap-3">
                      <div className="p-2 bg-white border border-gray-100 rounded-lg text-smart-primary">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      {doc.name}
                    </td>
                    <td className="py-4 px-4 text-gray-500">{doc.type}</td>
                    <td className="py-4 px-4 text-gray-500">{doc.size}</td>
                    <td className="py-4 px-4 text-gray-500">{doc.uploadedBy}</td>
                    <td className="py-4 px-4 text-gray-500">{doc.date}</td>
                    <td className="py-4 px-4">
                      <Badge status={doc.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                       <button className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ConfigView = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'docTypes' | 'usage'>('users');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [docTypes, setDocTypes] = useState<string[]>(DOC_TYPES);
  const [usageTypes, setUsageTypes] = useState<string[]>(COMPANIES); // Reusing Companies as Usage Contexts

  const [newItem, setNewItem] = useState('');

  const handleAddItem = (listSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (newItem.trim()) {
      listSetter(prev => [...prev, newItem]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (item: string, list: string[], listSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    listSetter(list.filter(i => i !== item));
  };

  return (
    <div className="space-y-8">
      <Card>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-smart-darkest">Configurações</h2>
              <p className="text-gray-500">Gerencie usuários, permissões e tabelas auxiliares do sistema.</p>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex space-x-2 border-b border-gray-100 mb-8 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap
                ${activeTab === 'users' ? 'border-smart-primary text-smart-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Gestão de Usuários e Perfis
            </button>
            <button 
              onClick={() => setActiveTab('docTypes')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap
                ${activeTab === 'docTypes' ? 'border-smart-primary text-smart-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Tipos de Documento
            </button>
            <button 
              onClick={() => setActiveTab('usage')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap
                ${activeTab === 'usage' ? 'border-smart-primary text-smart-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Contextos e Uso (Empresas)
            </button>
         </div>

         {/* Content */}
         <div className="min-h-[400px]">
            {activeTab === 'users' && (
               <div className="space-y-6">
                 <div className="flex justify-end">
                    <button className="bg-smart-darkest hover:bg-smart-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       Novo Usuário
                    </button>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                         <th className="py-3 px-4">Nome</th>
                         <th className="py-3 px-4">Email</th>
                         <th className="py-3 px-4">Perfil (Role)</th>
                         <th className="py-3 px-4">Status</th>
                         <th className="py-3 px-4 text-right">Ações</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {users.map(user => (
                         <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                           <td className="py-4 px-4 font-medium text-smart-darkest">{user.name}</td>
                           <td className="py-4 px-4 text-gray-500">{user.email}</td>
                           <td className="py-4 px-4">
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{user.role}</span>
                           </td>
                           <td className="py-4 px-4">
                             <span className={`w-2 h-2 inline-block rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                             {user.status === 'Active' ? 'Ativo' : 'Inativo'}
                           </td>
                           <td className="py-4 px-4 text-right">
                             <button className="text-smart-primary hover:text-smart-darkest font-medium text-xs">Editar</button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            )}

            {(activeTab === 'docTypes' || activeTab === 'usage') && (
               <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex gap-4">
                     <input 
                       type="text" 
                       value={newItem}
                       onChange={(e) => setNewItem(e.target.value)}
                       placeholder={activeTab === 'docTypes' ? "Ex: Contrato de Confidencialidade" : "Ex: Departamento Jurídico"}
                       className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smart-lightest outline-none"
                     />
                     <button 
                       onClick={() => handleAddItem(activeTab === 'docTypes' ? setDocTypes : setUsageTypes)}
                       className="bg-smart-primary hover:bg-smart-medium text-white px-6 py-3 rounded-xl font-bold transition-colors"
                     >
                       Adicionar
                     </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                     {(activeTab === 'docTypes' ? docTypes : usageTypes).map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 group">
                          <span className="text-gray-700 font-medium">{item}</span>
                          <button 
                            onClick={() => handleRemoveItem(item, activeTab === 'docTypes' ? docTypes : usageTypes, activeTab === 'docTypes' ? setDocTypes : setUsageTypes)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </Card>
    </div>
  );
};

const DashboardView = () => {
  // Stats
  const stats = [
    { title: 'Total de Fontes de Conhecimento', value: '1,215', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { title: 'Consultas no Mês', value: '8,432', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    { title: 'Análises no Mês', value: '942', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> }
  ];

  // Analysis State
  const [selectedDocType, setSelectedDocType] = useState(DOC_TYPES[0]);
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [chatSubject, setChatSubject] = useState(KNOWLEDGE_SUBJECTS[0]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Olá! Sou o assistente Smart Doc. Selecione um tópico para começar.', timestamp: new Date() }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setAnalysisResult('');
    }
  };

  // Helper to reset analysis when context changes
  const resetAnalysisContext = () => {
    setUploadedFile(null);
    setAnalysisResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    const result = await analyzeDocument(
      uploadedFile.name, 
      uploadedFile.type, 
      selectedCompany, 
      selectedDocType
    );
    
    setAnalysisResult(result || "Falha na análise.");
    setIsAnalyzing(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const historyForApi = chatHistory.map(m => ({ role: m.role, text: m.text }));
    const responseText = await generateChatResponse(newUserMsg.text, chatSubject, historyForApi);

    const newAiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "Erro ao processar.",
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newAiMsg]);
    setIsChatLoading(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Analysis (Takes up 1 col now - 50%) */}
        <div className="space-y-6">
           <Card className="h-[700px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-smart-darkest">Análise de Documentos</h2>
                  <p className="text-gray-400 text-sm">Upload e Inteligência Artificial</p>
                </div>
              </div>
              
              {/* Controls Row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipo de Documento</label>
                   <select 
                      value={selectedDocType} 
                      onChange={(e) => {
                        setSelectedDocType(e.target.value);
                        resetAnalysisContext();
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-smart-lightest outline-none"
                    >
                      {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Empresa / Fonte</label>
                    <select 
                      value={selectedCompany} 
                      onChange={(e) => {
                        setSelectedCompany(e.target.value);
                        resetAnalysisContext();
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-smart-lightest outline-none"
                    >
                      {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              {/* Upload Area */}
              <div className="bg-[#F8FBFA] border-2 border-dashed border-smart-accent/30 rounded-2xl p-6 text-center hover:border-smart-primary transition-colors cursor-pointer group mb-4">
                 <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="file-upload" 
                  accept=".pdf,.doc,.docx,.txt" 
                 />
                 <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                    <div className="h-12 w-12 bg-smart-lightest text-smart-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <span className="font-semibold text-smart-darkest">{uploadedFile ? uploadedFile.name : 'Arraste ou clique para upload'}</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOCX, CSV (Max 10MB)</span>
                 </label>
              </div>

              {/* Actions Area */}
              <div className="flex items-center justify-between mb-6 gap-4">
                {/* Download Button */}
                <button 
                  disabled={!analysisResult}
                  onClick={() => alert("Simulação: Download do PDF da análise iniciado.")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border-2 transition-all text-sm
                    ${analysisResult 
                      ? 'border-gray-200 text-smart-primary hover:border-smart-primary hover:bg-smart-lightest/20 cursor-pointer' 
                      : 'border-transparent text-gray-300 bg-gray-50 cursor-not-allowed'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Download PDF</span>
                </button>

                {/* Start Analysis Button */}
                <button 
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || isAnalyzing}
                  className={`px-8 py-3 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center gap-2 text-sm
                    ${!uploadedFile || isAnalyzing 
                      ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                      : 'bg-smart-darkest hover:bg-smart-primary hover:shadow-xl transform hover:-translate-y-1'}`}
                >
                  {isAnalyzing ? (
                    <>Processando...</>
                  ) : (
                    <>
                      Iniciar Análise
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </>
                  )}
                </button>
              </div>

              {/* Result Area */}
              <div className="flex-1 bg-[#F8FBFA] rounded-2xl p-6 overflow-y-auto custom-scrollbar border border-gray-100 relative">
                {isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center fade-in">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-smart-lightest rounded-full opacity-50"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-t-smart-primary rounded-full animate-spin"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                         <svg className="w-8 h-8 text-smart-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                    </div>
                    <p className="text-smart-darkest font-bold text-lg animate-pulse">Lendo e analisando...</p>
                    <p className="text-sm text-gray-400 mt-2 text-center max-w-[200px]">A IA está identificando cláusulas e gerando insights.</p>
                  </div>
                ) : analysisResult ? (
                  <div className="prose prose-sm max-w-none text-gray-800 prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 animate-fade-in-up">
                     <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold uppercase text-gray-400">Análise Concluída</span>
                     </div>
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     <p className="text-sm">Selecione um documento para visualizar os insights.</p>
                  </div>
                )}
              </div>
           </Card>
        </div>

        {/* Right: Chat (Takes up 1 col now - 50%) */}
        <div className="h-[700px]">
          <Card className="h-full flex flex-col p-0 overflow-hidden">
             {/* Header */}
             <div className="p-6 bg-white border-b border-gray-100">
                <h3 className="font-bold text-smart-darkest text-lg mb-4">Assistente Virtual</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assunto / Base de Conhecimento</label>
                  <select 
                    value={chatSubject}
                    onChange={(e) => setChatSubject(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-600 py-3 px-4 outline-none focus:ring-2 focus:ring-smart-lightest"
                  >
                    {KNOWLEDGE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
             </div>
             
             {/* Messages */}
             <div className="flex-1 bg-[#F9FAFB] p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[90%]">
                      <div 
                        className={`rounded-2xl p-4 text-sm shadow-sm
                          ${msg.role === 'user' 
                            ? 'bg-smart-darkest text-white rounded-br-none' 
                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'}`}
                      >
                        {msg.role === 'model' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                      </div>
                      <span className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                   <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                   </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input */}
             <div className="p-4 bg-white border-t border-gray-100">
               <div className="relative">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="Digite sua pergunta..."
                   className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl border-none text-sm text-gray-900 focus:ring-2 focus:ring-smart-lightest outline-none"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={isChatLoading || !chatInput.trim()}
                   className="absolute right-2 top-2 p-1.5 bg-smart-primary text-white rounded-lg hover:bg-smart-darkest transition-colors disabled:opacity-50"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const user = MOCK_USERS[0];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardView />;
      case 'knowledge': return <KnowledgeView />;
      case 'config': return <ConfigView />;
      default: return <DashboardView />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onChangeView={setActiveView} 
      onLogout={handleLogout}
      userRole={user.role}
      userName={user.name}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

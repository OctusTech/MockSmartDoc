import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layout } from './components/Layout';
import { LOGO_URL, LOGO_COLOR_URL, MOCK_USERS, MOCK_DOCS, DOC_TYPES, COMPANIES, KNOWLEDGE_SUBJECTS } from './constants';
import { User, ChatMessage } from './types';
import { generateChatResponse, analyzeDocument } from './geminiService';

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
       <span className="text-xs font-semibold text-gray-400 bg-white/50 px-2 py-1 rounded-full uppercase">Mês</span>
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

  return (
    <Layout 
      activeView={activeView} 
      onChangeView={setActiveView} 
      onLogout={handleLogout}
      userRole={user.role}
      userName={user.name}
    >
      {activeView === 'dashboard' ? (
        <DashboardView />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-white/50 p-8 rounded-3xl shadow-sm border border-white/60 backdrop-blur-sm">
               <svg className="w-16 h-16 text-smart-primary mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               <h2 className="text-2xl font-bold text-smart-darkest mb-2">Em Construção</h2>
               <p className="text-gray-500">O módulo de {activeView === 'knowledge' ? 'Conhecimento' : 'Configurações'} será implementado em breve.</p>
            </div>
         </div>
      )}
    </Layout>
  );
};

export default App;
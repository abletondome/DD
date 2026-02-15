import React, { useState, useRef } from 'react';
import { 
  FileCode, 
  Settings, 
  Wand2, 
  Copy, 
  CheckCircle2, 
  FileText, 
  LayoutTemplate
} from 'lucide-react';
import { Button } from './components/Button';
import { Select } from './components/Select';
import { Input } from './components/Input';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { 
  OutputFormat, 
  DetailLevel, 
  TargetAudience, 
  CloudEnvironment, 
  GeneratorConfig 
} from './types';
import { generateDocumentation } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [sourceCode, setSourceCode] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [format, setFormat] = useState<OutputFormat>(OutputFormat.MARKDOWN);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(DetailLevel.DETAILED);
  const [audience, setAudience] = useState<TargetAudience>(TargetAudience.DEVELOPERS);
  const [cloudEnv, setCloudEnv] = useState<CloudEnvironment>(CloudEnvironment.NONE);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [output, setOutput] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleGenerate = async () => {
    if (!sourceCode.trim()) {
      setError("Kérlek illeszd be a forráskódot!");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setHasCopied(false);

    const config: GeneratorConfig = {
      sourceCode,
      additionalContext,
      format,
      detailLevel,
      audience,
      cloudEnv
    };

    try {
      const result = await generateDocumentation(config);
      setOutput(result);
      
      // Auto-scroll to output on mobile
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err: any) {
      setError(err.message || "Ismeretlen hiba történt.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  // Helper to convert Enum to options for Select
  const getOptions = (enumObj: any) => Object.values(enumObj).map(val => ({ label: val as string, value: val as string }));

  const getPlaceholder = () => {
    if (format === OutputFormat.OPENAPI) {
      return "// Illeszd be az API vezérlőket (Controllers) vagy Route definíciókat...\n// Vagy írd le szövegesen az endpointokat (pl. GET /users - lista)";
    }
    return "// Illeszd be ide a forráskódot, amit dokumentálni szeretnél...";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      
      {/* LEFT SIDEBAR / CONFIG PANEL */}
      <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
        
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <FileCode className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">ArchitectAI</h1>
            <p className="text-xs text-slate-400 mt-1">Docs Generator</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Settings className="w-4 h-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Konfiguráció</h2>
          </div>

          <Select 
            label="Kimeneti Formátum" 
            value={format} 
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            options={getOptions(OutputFormat)}
          />
          
          <Input 
            label={format === OutputFormat.OPENAPI ? "API Adatok (Név, Verzió)" : "Extra Kontextus (Opcionális)"}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder={format === OutputFormat.OPENAPI ? "Pl. User Service v1.0, https://api.example.com" : "Pl. fókuszálj a biztonsági aspektusokra..."}
          />

          <Select 
            label="Részletesség" 
            value={detailLevel} 
            onChange={(e) => setDetailLevel(e.target.value as DetailLevel)}
            options={getOptions(DetailLevel)}
          />

          <Select 
            label="Célközönség" 
            value={audience} 
            onChange={(e) => setAudience(e.target.value as TargetAudience)}
            options={getOptions(TargetAudience)}
          />

          <Select 
            label="Felhő Környezet" 
            value={cloudEnv} 
            onChange={(e) => setCloudEnv(e.target.value as CloudEnvironment)}
            options={getOptions(CloudEnvironment)}
          />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400 leading-relaxed">
             <p className="mb-2 font-semibold text-slate-300">Tipp:</p>
             {format === OutputFormat.CURSOR_RULES && "A .cursorrules formátum a Cursor IDE számára generál optimalizált utasításokat."}
             {format === OutputFormat.AZURE_DEPLOYMENT && "A generátor az Azure Best Practices alapján javasol erőforrásokat."}
             {format === OutputFormat.OPENAPI && "A kód alapján generált API specifikáció Swagger/Postman kompatibilis."}
             {format === OutputFormat.MARKDOWN && "Ideális README.md vagy technikai wiki oldalak létrehozásához."}
             {format !== OutputFormat.CURSOR_RULES && format !== OutputFormat.AZURE_DEPLOYMENT && format !== OutputFormat.OPENAPI && format !== OutputFormat.MARKDOWN && "A generált dokumentáció a megadott kód struktúráját követi."}
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* INPUT SECTION (Top Half) */}
        <div className="flex-1 p-6 flex flex-col gap-4 min-h-[40%] border-b border-slate-800 bg-slate-925 relative group">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-300">
              <FileCode className="w-4 h-4" />
              <span className="text-sm font-medium">
                {format === OutputFormat.OPENAPI ? "Forráskód / API Leírás" : "Forráskód"}
              </span>
            </div>
            <Button 
              onClick={handleGenerate} 
              isLoading={isGenerating}
              icon={<Wand2 className="w-4 h-4" />}
            >
              Generálás
            </Button>
          </div>
          
          <textarea
            className="flex-1 w-full bg-slate-900 text-slate-200 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder-slate-600 transition-colors"
            placeholder={getPlaceholder()}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck={false}
          />
          
          {error && (
            <div className="absolute bottom-6 left-6 right-6 mx-auto max-w-lg bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded shadow-xl flex items-center justify-center animate-in fade-in slide-in-from-bottom-2">
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* OUTPUT SECTION (Bottom Half) */}
        <div ref={outputRef} className="flex-1 bg-slate-950 flex flex-col min-h-[40%] relative">
          
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 text-slate-300">
              <LayoutTemplate className="w-4 h-4" />
              <span className="text-sm font-medium">Kimenet ({format})</span>
            </div>
            {output && (
              <Button variant="secondary" onClick={handleCopy} className="text-xs py-1.5 px-3 h-8">
                 {hasCopied ? (
                   <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                    Másolva
                   </>
                 ) : (
                   <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Másolás
                   </>
                 )}
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {!output && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                  <FileText className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">Még nincs generált dokumentáció.</p>
                <p className="text-xs opacity-60 mt-2">Illessz be kódot és kattints a Generálás gombra.</p>
              </div>
            )}

            {isGenerating && !output && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                 <p className="text-sm animate-pulse">Az ArchitectAI elemzi a kódot...</p>
              </div>
            )}

            {output && (
              <div className="max-w-4xl mx-auto pb-20">
                <MarkdownRenderer content={output} />
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

// Simple loader component defined locally for the empty state usage
const Loader2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default App;
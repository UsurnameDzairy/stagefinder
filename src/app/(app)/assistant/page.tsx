"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, Suspense, lazy } from "react";
import {
  Plus,
  SlidersHorizontal,
  ArrowUp,
  X,
  ImageIcon,
  ChevronDown,
  Check,
  Loader2,
  Copy,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TextType from "@/components/ui/text-type";
import { useTranslation, useLanguage } from "@/lib/i18n";
import AIThinkingBlock from "@/components/ui/ai-thinking-block";
import TextTypeAI from "@/components/ui/text-type-ai";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  textContent?: string;
}

interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  apiModel: string;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const PASTE_THRESHOLD = 200;

// Modèles IA disponibles
const DEFAULT_MODELS: ModelOption[] = [
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3",
    description: "Modèle puissant et rapide",
    badge: "Gratuit",
    apiModel: "llama-3.3-70b-versatile"
  },
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 Fast",
    description: "Ultra rapide pour les réponses simples",
    badge: "Gratuit",
    apiModel: "llama-3.1-8b-instant"
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    description: "Excellent pour l'analyse de documents",
    badge: "Gratuit",
    apiModel: "mixtral-8x7b-32768"
  },
  {
    id: "gemma2-9b",
    name: "Gemma 2",
    description: "Modèle Google compact et efficace",
    badge: "Gratuit",
    apiModel: "gemma2-9b-it"
  },
];

const isTextualFile = (file: File): boolean => {
  const textualTypes = ["text/", "application/json", "application/xml", "application/pdf"];
  const textualExtensions = ["txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "css", "json", "pdf", "doc", "docx"];
  const isTextualMimeType = textualTypes.some((type) => file.type.toLowerCase().startsWith(type));
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return isTextualMimeType || textualExtensions.includes(extension);
};

const readFileAsText = async (file: File, t: (key: string) => string): Promise<string> => {
  const fileName = file.name.toLowerCase();

  // Pour les PDFs et fichiers Word, utiliser l'API serveur
  if (fileName.endsWith(".pdf") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.text || `[${file.name}] - ${t("assistantPage.cvUpload.extractError")} ${t("assistantPage.cvUpload.pasteInstruction")}`;
      }
    } catch (e) {
      console.error("Server extraction failed:", e);
    }
    return `[${file.name}] - ${t("assistantPage.cvUpload.pasteInstruction")}`;
  }

  // Pour les fichiers texte simples
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const getFileExtension = (filename: string): string => {
  const extension = filename.split(".").pop()?.toUpperCase() || "FILE";
  return extension.length > 8 ? extension.substring(0, 8) + "..." : extension;
};

const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.length > 10) label = label.substring(0, 10) + "...";
  return label;
};

const TextualFilePreviewCard: React.FC<{ file: FileWithPreview; onRemove: (id: string) => void }> = ({ file, onRemove }) => {
  const { t } = useTranslation();
  const previewText = file.textContent?.slice(0, 150) || "";
  const needsTruncation = (file.textContent?.length || 0) > 150;
  const fileExtension = getFileExtension(file.file.name);

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto scrollbar-hide">
        {file.textContent ? (needsTruncation ? previewText + "..." : file.textContent) : (
          <div className="flex items-center justify-center h-full text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /></div>
        )}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">{fileExtension}</p>
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          {file.textContent && <Button size="icon" variant="outline" className="size-6" onClick={() => navigator.clipboard.writeText(file.textContent || "")}><Copy className="h-3 w-3" /></Button>}
          <Button size="icon" variant="outline" className="size-6" onClick={() => onRemove(file.id)}><X className="h-3 w-3" /></Button>
        </div>
      </div>
    </div>
  );
};

const FilePreviewCard: React.FC<{ file: FileWithPreview; onRemove: (id: string) => void }> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  const isTextual = isTextualFile(file.file);
  if (isTextual) return <TextualFilePreviewCard file={file} onRemove={onRemove} />;

  return (
    <div className={cn("relative group bg-zinc-700 border border-zinc-600 rounded-lg size-[125px] shadow-md flex-shrink-0 overflow-hidden", isImage ? "p-0" : "p-3")}>
      {isImage && file.preview ? (
        <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
            <p className="absolute bottom-2 left-2 capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">{getFileTypeLabel(file.type)}</p>
          </div>
        </div>
      )}
      <Button size="icon" variant="outline" className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => onRemove(file.id)}><X className="h-4 w-4" /></Button>
    </div>
  );
};

const PastedContentCard: React.FC<{ content: PastedContent; onRemove: (id: string) => void }> = ({ content, onRemove }) => {
  const { t } = useTranslation();
  const previewText = content.content.slice(0, 150);
  const needsTruncation = content.content.length > 150;

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto scrollbar-hide">
        {needsTruncation ? previewText + "..." : content.content}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">{t("assistantPage.pasted") || "COLLÉ"}</p>
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          <Button size="icon" variant="outline" className="size-6" onClick={() => navigator.clipboard.writeText(content.content)}><Copy className="h-3 w-3" /></Button>
          <Button size="icon" variant="outline" className="size-6" onClick={() => onRemove(content.id)}><X className="h-3 w-3" /></Button>
        </div>
      </div>
    </div>
  );
};

const ModelSelectorDropdown: React.FC<{ models: ModelOption[]; selectedModel: string; onModelChange: (modelId: string) => void }> = ({ models, selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const selectedModelData = models.find((m) => m.id === selectedModel) || models[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="sm" className="h-9 px-2.5 text-sm font-serif text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700" onClick={() => setIsOpen(!isOpen)}>
        <span className="truncate max-w-[150px] sm:max-w-[200px]">{selectedModelData.name}</span>
        <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-20 p-2 backdrop-blur-sm">
          <p className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t("modelSelector.title")}</p>
          {models.map((model) => (
            <button key={model.id} className={cn("w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-between", model.id === selectedModel && "bg-zinc-800")} onClick={() => { onModelChange(model.id); setIsOpen(false); }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-zinc-100">{model.name}</span>
                  {model.badge && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full uppercase tracking-wide">{model.badge}</span>}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{model.description}</p>
              </div>
              {model.id === selectedModel && <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ClaudeChatInput: React.FC<{
  onSendMessage?: (message: string, files: FileWithPreview[], pastedContent: PastedContent[], model: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}> = ({ onSendMessage, disabled = false, placeholder, isLoading = false }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b");
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [cvAnalysisMode, setCvAnalysisMode] = useState(false); // Track if upload is from CV analysis button

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          setSelectedModel(data.models[0].id);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        // Keep DEFAULT_MODELS as fallback
      }
    };
    fetchModels();
  }, []);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || files.length >= MAX_FILES) return;
    const filesToAdd = Array.from(selectedFiles).slice(0, MAX_FILES - files.length);

    const newFiles = filesToAdd.filter((file) => file.size <= MAX_FILE_SIZE).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      type: file.type || "application/octet-stream",
      uploadStatus: "complete" as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((f) => {
      if (isTextualFile(f.file)) {
        readFileAsText(f.file, t).then((text) => {
          setFiles((prev) => prev.map((p) => p.id === f.id ? { ...p, textContent: text } : p));

          // If in CV analysis mode, auto-send message once text is extracted
          if (cvAnalysisMode && text && text.length > 50) {
            setTimeout(() => {
              const cvMessage = "Analyse mon CV en détail et donne-moi des recommandations pour l'améliorer.";
              setMessage(cvMessage);
              setCvAnalysisMode(false);
              // Trigger send after a short delay to ensure file is ready
              setTimeout(() => {
                if (onSendMessage) {
                  onSendMessage(cvMessage, [{ ...f, textContent: text }], [], selectedModel);
                  setFiles([]);
                  setMessage("");
                }
              }, 100);
            }, 500);
          }
        });
      }
    });
  }, [files.length, cvAnalysisMode, onSendMessage, selectedModel, t]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const fileItems = Array.from(items).filter((item) => item.kind === "file");
    if (fileItems.length > 0) {
      e.preventDefault();
      const pastedFiles = fileItems.map((item) => item.getAsFile()).filter(Boolean) as File[];
      const dt = new DataTransfer();
      pastedFiles.forEach((f) => dt.items.add(f));
      handleFileSelect(dt.files);
      return;
    }
    const text = e.clipboardData.getData("text");
    if (text && text.length > PASTE_THRESHOLD && pastedContent.length < 5) {
      e.preventDefault();
      setMessage(message + text.slice(0, PASTE_THRESHOLD) + "...");
      setPastedContent((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), content: text, timestamp: new Date(), wordCount: text.split(/\s+/).length }]);
    }
  }, [handleFileSelect, pastedContent.length, message]);

  const handleStarterClick = async (action: 'cvAnalysis' | 'interviewPrep') => {
    if (action === 'cvAnalysis') {
      // Set CV analysis mode and open file dialog
      setCvAnalysisMode(true);
      fileInputRef.current?.click();
    } else if (action === 'interviewPrep') {
      // Fetch user's applications/interviews from database
      try {
        const response = await fetch('/api/applications');
        if (response.ok) {
          const data = await response.json();
          const interviews = data.applications?.filter((app: any) => app.status === 'interview') || [];

          let prompt = "Je voudrais préparer un entretien. ";
          if (interviews.length > 0) {
            prompt += `\n\nVoici mes entretiens programmés :\n${interviews.map((app: any, idx: number) =>
              `${idx + 1}. ${app.position} chez ${app.company}`
            ).join('\n')}\n\nAide-moi à me préparer pour ces entretiens.`;
          } else {
            prompt += "Je n'ai pas encore d'entretien programmé, mais j'aimerais m'entraîner pour des entretiens en général.";
          }

          if (onSendMessage) {
            onSendMessage(prompt, [], [], DEFAULT_MODELS[0].apiModel);
          }
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
        // Fallback if API fails
        const prompt = "Je voudrais préparer un entretien. Aide-moi à m'entraîner.";
        if (onSendMessage) {
          onSendMessage(prompt, [], [], DEFAULT_MODELS[0].apiModel);
        }
      }
    }
  };

  const suggestions = (t("assistantPage.suggestions") as unknown as string[]) || ["Analysez mon CV...", "Aidez-moi à rédiger une lettre..."];

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }, [handleFileSelect]);

  const handleSend = useCallback(() => {
    if (disabled || isLoading || (!message.trim() && files.length === 0 && pastedContent.length === 0)) return;
    const modelData = DEFAULT_MODELS.find(m => m.id === selectedModel);
    onSendMessage?.(message, files, pastedContent, modelData?.apiModel || "openai/gpt-4o-mini");
    setMessage("");
    files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
    setPastedContent([]);
  }, [message, files, pastedContent, disabled, isLoading, onSendMessage, selectedModel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const hasContent = message.trim() || files.length > 0 || pastedContent.length > 0;
  const canSend = hasContent && !disabled && !isLoading;
  const inputPlaceholder = placeholder || t("assistantPage.inputPlaceholder");

  const showDynamicPlaceholder = !hasContent && !isLoading && !disabled;

  return (
    <div className="relative w-full max-w-2xl mx-auto" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1C3F62] border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center pointer-events-none">
          <p className="text-sm text-blue-500 flex items-center gap-2"><ImageIcon className="size-4" />{t("assistantPage.dropFiles")}</p>
        </div>
      )}
      <div className="bg-[#30302E] border border-zinc-700 rounded-xl shadow-lg flex flex-col">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            className="h-[80px] w-full p-4 focus:outline-none border-none resize-none bg-transparent text-zinc-100 text-sm scrollbar-hide z-10 relative"
            rows={3}
          />
          {showDynamicPlaceholder && (
            <div className="absolute top-4 left-4 pointer-events-none text-zinc-500 text-sm z-0 opacity-50">
              <TextType
                text={suggestions}
                typingSpeed={50}
                deletingSpeed={30}
                pauseDuration={2000}
                loop={true}
                showCursor={true}
                cursorClassName="text-zinc-500"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between w-full px-3 pb-2">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700" onClick={() => fileInputRef.current?.click()} disabled={disabled || isLoading}><Plus className="h-5 w-5" /></Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700" disabled={disabled || isLoading}><SlidersHorizontal className="h-5 w-5" /></Button>
          </div>

          <div className="flex items-center gap-2">

            <ModelSelectorDropdown models={availableModels} selectedModel={selectedModel} onModelChange={setSelectedModel} />
            <Button size="icon" className={cn("h-9 w-9 rounded-md wait-animation", canSend ? "bg-[#C2C0B6] hover:bg-[#B0AEA4] text-black" : "bg-zinc-700 text-zinc-500")} onClick={handleSend} disabled={!canSend}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {(files.length > 0 || pastedContent.length > 0) && (
          <div className="overflow-x-auto border-t border-zinc-700 p-3 bg-[#262624] scrollbar-hide">
            <div className="flex gap-3">
              {pastedContent.map((c) => <PastedContentCard key={c.id} content={c} onRemove={(id) => setPastedContent((prev) => prev.filter((p) => p.id !== id))} />)}
              {files.map((f) => <FilePreviewCard key={f.id} file={f} onRemove={removeFile} />)}
            </div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt,.md,.json" onChange={(e) => { handleFileSelect(e.target.files); if (e.target) e.target.value = ""; }} />
    </div >
  );
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Simple markdown renderer
function renderMarkdown(text: string) {
  // Split by lines and process
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inList = false;

  const processInlineMarkdown = (line: string) => {
    // Bold
    line = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    // Italic
    line = line.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    // Code
    line = line.replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-400">$1</code>');
    return line;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-zinc-500 mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: processInlineMarkdown(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Numbered list
    if (/^\d+\.\s/.test(trimmedLine)) {
      if (!inList) flushList();
      inList = true;
      listItems.push(trimmedLine.replace(/^\d+\.\s*/, ''));
      return;
    }

    // Bullet list
    if (/^[-•]\s/.test(trimmedLine)) {
      if (!inList) flushList();
      inList = true;
      listItems.push(trimmedLine.replace(/^[-•]\s*/, ''));
      return;
    }

    // Not a list item, flush any pending list
    flushList();

    // Empty line
    if (!trimmedLine) {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Headers
    if (trimmedLine.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-sm font-semibold text-white mt-3 mb-1">
          {trimmedLine.replace('### ', '')}
        </h4>
      );
      return;
    }
    if (trimmedLine.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-base font-semibold text-white mt-3 mb-1">
          {trimmedLine.replace('## ', '')}
        </h3>
      );
      return;
    }
    if (trimmedLine.startsWith('# ')) {
      elements.push(
        <h2 key={index} className="text-lg font-bold text-white mt-3 mb-2">
          {trimmedLine.replace('# ', '')}
        </h2>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={index} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineMarkdown(trimmedLine) }} />
    );
  });

  flushList();
  return elements;
}

export default function AssistantPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user name for personalized greeting
  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => {
        if (data.user?.name) {
          setUserName(data.user.name.split(' ')[0]); // First name only
        } else if (data.user?.email) {
          setUserName(data.user.email.split('@')[0]);
        }
      })
      .catch(() => { });
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("common.goodMorning");
    if (hour < 18) return t("common.goodAfternoon");
    return t("common.goodEvening");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string, files: FileWithPreview[], pastedContent: PastedContent[], model: string) => {
    setIsLoading(true);

    // Ajouter le message utilisateur immédiatement
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Construire le contenu avec les fichiers et texte collé
      let fullContent = message;

      // Ajouter le contenu collé (souvent un CV copié-collé)
      if (pastedContent.length > 0) {
        const pastedTexts = pastedContent.map(p => p.content).join("\n\n");
        fullContent += "\n\n=== CONTENU DE MON CV (copié-collé) ===\n" + pastedTexts + "\n=== FIN DU CV ===";
      }

      // Ajouter le contenu des fichiers uploadés
      let hasCVContent = pastedContent.length > 0;
      if (files.length > 0) {
        const fileContents = files.filter(f => f.textContent && f.textContent.length > 50).map(f => {
          const isPdf = f.file.name.toLowerCase().endsWith('.pdf');
          const isDoc = f.file.name.toLowerCase().endsWith('.doc') || f.file.name.toLowerCase().endsWith('.docx');
          const fileType = isPdf ? 'PDF' : isDoc ? 'Word' : 'Fichier';
          console.log(`[CV Upload] Fichier: ${f.file.name}, Contenu extrait: ${f.textContent?.length || 0} caractères`);
          return `=== CONTENU DE MON CV (${fileType}: ${f.file.name}) ===\n${f.textContent}\n=== FIN DU CV ===`;
        });
        if (fileContents.length > 0) {
          fullContent += "\n\n" + fileContents.join("\n\n");
          hasCVContent = true;
        }
      }

      // Si un CV est fourni, ajouter une instruction explicite
      if (hasCVContent) {
        fullContent = "INSTRUCTION IMPORTANTE: Analyse UNIQUEMENT le CV fourni ci-dessous. IGNORE complètement les données du profil stocké (école, compétences, candidatures). Base ton analyse EXCLUSIVEMENT sur le contenu du CV que je te fournis.\n\n" + fullContent;
      }

      console.log("[Assistant] Message envoyé:", fullContent.substring(0, 500) + "...");

      // Appeler l'API assistant
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: fullContent }],
          model: model,
          language: language,
          ignoreStoredProfile: hasCVContent, // Flag pour ignorer le profil stocké
        }),
      });

      if (!res.ok) throw new Error("Erreur API");

      const data = await res.json();
      const assistantResponse = data.message?.content || "Pas de réponse";

      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Sauvegarder la conversation dans la base de données
      try {
        const saveRes = await fetch("/api/assistant/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationId,
            userMessage: fullContent,
            assistantMessage: assistantResponse,
            language: language,
            model: model,
            attachments: files.length > 0 ? files.map(f => ({ name: f.file.name, type: f.type })) : null,
          }),
        });

        if (saveRes.ok) {
          const saveData = await saveRes.json();
          if (saveData.conversationId) {
            setConversationId(saveData.conversationId);
          }
        }
      } catch (saveError) {
        console.error("Erreur sauvegarde conversation:", saveError);
        // Ne pas bloquer l'utilisateur si la sauvegarde échoue
      }
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: t("assistantPage.error"),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full flex justify-center items-center px-4 overflow-hidden">
      <div
        className="w-full max-w-4xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[48px] border border-border bg-card shadow-sm h-[600px] flex flex-col items-center justify-center">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen grayscale contrast-125">
              <Dithering
                colorBack="#00000000"
                colorFront="#ffffff"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.4 : 0.15}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          {/* Settings button */}
          <Link href="/models" className="absolute top-4 right-4 z-20">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          <div className="relative z-10 px-6 w-full max-w-2xl mx-auto flex flex-col items-center justify-center h-full">
            {messages.length === 0 ? (
              /* État initial - centré */
              <>
                <h1 className="text-3xl font-serif font-light text-[#C2C0B6] mb-8 text-center">
                  <TextType
                    text={[
                      userName ? `${getGreeting()} ${userName} !` : `${getGreeting()} !`,
                      "Comment puis-je vous aider ?",
                      "Prêt à travailler ?"
                    ]}
                    typingSpeed={60}
                    deletingSpeed={30}
                    pauseDuration={2000}
                    showCursor={true}
                    cursorCharacter="_"
                    cursorClassName="text-[#C2C0B6]"
                    loop={true}
                    className="inline"
                  />
                </h1>

                <ClaudeChatInput
                  onSendMessage={handleSendMessage}
                  placeholder={t("assistantPage.inputPlaceholder")}
                  isLoading={isLoading}
                />

                <div className="w-full flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80 transition-all"
                    onClick={() => handleSendMessage("Analyse mon CV en détail et donne-moi des recommandations pour l'améliorer.", [], [], DEFAULT_MODELS[0].apiModel)}
                  >
                    {t("assistantPage.starters.cvAnalysis")}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80 transition-all"
                    onClick={() => handleSendMessage("Prépare mon entretien - Aide-moi à m'entraîner pour un entretien.", [], [], DEFAULT_MODELS[0].apiModel)}
                  >
                    {t("assistantPage.starters.interviewPrep")}
                  </Button>
                </div>
              </>
            ) : (
              /* État conversation - layout chat */
              <div className="flex flex-col h-full w-full py-4">
                <div className="text-xl font-serif font-light text-[#C2C0B6] text-center mb-4 shrink-0">
                  <TextType
                    text={["KAM", "Votre Assistant", "Expert Carrière"]}
                    className="inline"
                    typingSpeed={100}
                    deletingSpeed={50}
                    pauseDuration={2000}
                    cursorClassName="text-[#C2C0B6]"
                  />
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide min-h-0 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          msg.role === "user"
                            ? "bg-zinc-700 text-white rounded-br-md border border-zinc-600"
                            : "bg-zinc-800/90 text-white rounded-bl-md border border-zinc-700"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none text-white">
                            <TextTypeAI
                              text={msg.content}
                              typingSpeed={5}
                              showCursor={false}
                              loop={false}
                              variableSpeed={{ min: 3, max: 10 }}
                              className="text-sm leading-relaxed text-white"
                            />
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                        <p className={cn(
                          "text-[10px] mt-2 opacity-50",
                          msg.role === "user" ? "text-right" : "text-left"
                        )}>
                          {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <AIThinkingBlock />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="shrink-0">
                  <ClaudeChatInput
                    onSendMessage={handleSendMessage}
                    placeholder={t("assistantPage.inputPlaceholderContinue")}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

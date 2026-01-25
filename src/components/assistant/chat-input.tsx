"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  SlidersHorizontal,
  ArrowUp,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  textContent?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

interface ChatInputProps {
  onSendMessage?: (message: string, files: FileWithPreview[], pastedContent: PastedContent[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  models?: ModelOption[];
  defaultModel?: string;
  onModelChange?: (modelId: string) => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const PASTE_THRESHOLD = 200;

const DEFAULT_MODELS: ModelOption[] = [
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", description: "Modèle équilibré", badge: "Latest" },
  { id: "claude-opus-3.5", name: "Claude Opus 3.5", description: "Intelligence maximale" },
  { id: "claude-haiku-3", name: "Claude Haiku 3", description: "Réponses rapides" },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.length > 10) label = label.substring(0, 10) + "...";
  return label;
};

const isTextualFile = (file: File): boolean => {
  const textualTypes = ["text/", "application/json", "application/xml", "application/javascript"];
  const textualExtensions = ["txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "yaml", "yml", "csv", "sql"];
  const isTextualMimeType = textualTypes.some((type) => file.type.toLowerCase().startsWith(type));
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return isTextualMimeType || textualExtensions.includes(extension);
};

const readFileAsText = (file: File): Promise<string> => {
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

const TextualFilePreviewCard: React.FC<{ file: FileWithPreview; onRemove: (id: string) => void }> = ({ file, onRemove }) => {
  const previewText = file.textContent?.slice(0, 150) || "";
  const needsTruncation = (file.textContent?.length || 0) > 150;
  const fileExtension = getFileExtension(file.file.name);

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto scrollbar-hide">
        {file.textContent ? (
          <>{needsTruncation ? previewText + "..." : file.textContent}</>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">{fileExtension}</p>
        {file.uploadStatus === "uploading" && <div className="absolute top-2 left-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" /></div>}
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
          {file.uploadStatus === "uploading" && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />}
        </div>
      )}
      <Button size="icon" variant="outline" className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => onRemove(file.id)}><X className="h-4 w-4" /></Button>
    </div>
  );
};

const PastedContentCard: React.FC<{ content: PastedContent; onRemove: (id: string) => void }> = ({ content, onRemove }) => {
  const previewText = content.content.slice(0, 150);
  const needsTruncation = content.content.length > 150;

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto scrollbar-hide">
        {needsTruncation ? previewText + "..." : content.content}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">PASTED</p>
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
  const selectedModelData = models.find((m) => m.id === selectedModel) || models[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="sm" className="h-9 px-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700" onClick={() => setIsOpen(!isOpen)}>
        <span className="truncate max-w-[150px] sm:max-w-[200px]">{selectedModelData.name}</span>
        <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 p-2">
          {models.map((model) => (
            <button key={model.id} className={cn("w-full text-left p-2.5 rounded-md hover:bg-zinc-700 transition-colors flex items-center justify-between", model.id === selectedModel && "bg-zinc-700")} onClick={() => { onModelChange(model.id); setIsOpen(false); }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-100">{model.name}</span>
                  {model.badge && <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">{model.badge}</span>}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{model.description}</p>
              </div>
              {model.id === selectedModel && <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function AssistantChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Décrivez votre objectif de carrière...",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  models = DEFAULT_MODELS,
  defaultModel,
  onModelChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState(defaultModel || models[0]?.id || "");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    if (files.length >= maxFiles) return;

    const availableSlots = maxFiles - files.length;
    const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots);

    const newFiles = filesToAdd.filter((file) => file.size <= maxFileSize).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      type: file.type || "application/octet-stream",
      uploadStatus: "pending" as const,
      uploadProgress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((fileToUpload) => {
      if (isTextualFile(fileToUpload.file)) {
        readFileAsText(fileToUpload.file).then((textContent) => {
          setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, textContent } : f));
        }).catch(() => {
          setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, textContent: "Erreur de lecture" } : f));
        });
      }
      setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, uploadStatus: "uploading" } : f));
      setTimeout(() => {
        setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, uploadStatus: "complete", uploadProgress: 100 } : f));
      }, 800);
    });
  }, [files.length, maxFiles, maxFileSize]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;

    const fileItems = Array.from(items).filter((item) => item.kind === "file");
    if (fileItems.length > 0 && files.length < maxFiles) {
      e.preventDefault();
      const pastedFiles = fileItems.map((item) => item.getAsFile()).filter(Boolean) as File[];
      const dataTransfer = new DataTransfer();
      pastedFiles.forEach((file) => dataTransfer.items.add(file));
      handleFileSelect(dataTransfer.files);
      return;
    }

    const textData = clipboardData.getData("text");
    if (textData && textData.length > PASTE_THRESHOLD && pastedContent.length < 5) {
      e.preventDefault();
      setMessage(message + textData.slice(0, PASTE_THRESHOLD) + "...");
      setPastedContent((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), content: textData, timestamp: new Date(), wordCount: textData.split(/\s+/).filter(Boolean).length }]);
    }
  }, [handleFileSelect, files.length, maxFiles, pastedContent.length, message]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files); }, [handleFileSelect]);

  const handleSend = useCallback(() => {
    if (disabled || (!message.trim() && files.length === 0 && pastedContent.length === 0)) return;
    if (files.some((f) => f.uploadStatus === "uploading")) return;
    onSendMessage?.(message, files, pastedContent);
    setMessage("");
    files.forEach((file) => { if (file.preview) URL.revokeObjectURL(file.preview); });
    setFiles([]);
    setPastedContent([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, files, pastedContent, disabled, onSendMessage]);

  const handleModelChangeInternal = useCallback((modelId: string) => { setSelectedModel(modelId); onModelChange?.(modelId); }, [onModelChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const hasContent = message.trim() || files.length > 0 || pastedContent.length > 0;
  const canSend = hasContent && !disabled && !files.some((f) => f.uploadStatus === "uploading");

  return (
    <div className="relative w-full max-w-2xl mx-auto" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1C3F62] border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-blue-500 flex items-center gap-2"><ImageIcon className="size-4 opacity-50" />Déposez vos fichiers ici</p>
        </div>
      )}
      <div className="bg-[#30302E] border border-zinc-700 rounded-xl shadow-lg items-end gap-2 min-h-[150px] flex flex-col relative">
        {animatedPlaceholder && !message && (
          <div className="absolute top-4 left-4 pointer-events-none z-10">
            <TextType
              text={placeholderSuggestions}
              typingSpeed={50}
              deletingSpeed={30}
              pauseDuration={2000}
              loop={true}
              showCursor={false}
              className="text-zinc-500 text-sm sm:text-base"
            />
          </div>
        )}
        <textarea ref={textareaRef} value={message} onChange={(e) => setMessage(e.target.value)} onPaste={handlePaste} onKeyDown={handleKeyDown} placeholder={!animatedPlaceholder ? placeholder : ""} disabled={disabled} className="flex-1 min-h-[100px] w-full p-4 focus:outline-none border-none max-h-[120px] resize-none bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm sm:text-base scrollbar-hide relative z-20" rows={1} />
        <div className="flex items-center gap-2 justify-between w-full px-3 pb-1.5">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0" onClick={() => fileInputRef.current?.click()} disabled={disabled || files.length >= maxFiles}><Plus className="h-5 w-5" /></Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0" disabled={disabled}><SlidersHorizontal className="h-5 w-5" /></Button>
          </div>
          <div className="flex items-center gap-2">
            {models && models.length > 0 && <ModelSelectorDropdown models={models} selectedModel={selectedModel} onModelChange={handleModelChangeInternal} />}
            <Button size="icon" className={cn("h-9 w-9 p-0 flex-shrink-0 rounded-md transition-colors", canSend ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-zinc-700 text-zinc-500 cursor-not-allowed")} onClick={handleSend} disabled={!canSend}><ArrowUp className="h-5 w-5" /></Button>
          </div>
        </div>
        {(files.length > 0 || pastedContent.length > 0) && (
          <div className="overflow-x-auto border-t-[1px] p-3 border-zinc-700 w-full bg-[#262624] scrollbar-hide">
            <div className="flex gap-3">
              {pastedContent.map((content) => <PastedContentCard key={content.id} content={content} onRemove={(id) => setPastedContent((prev) => prev.filter((c) => c.id !== id))} />)}
              {files.map((file) => <FilePreviewCard key={file.id} file={file} onRemove={removeFile} />)}
            </div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { handleFileSelect(e.target.files); if (e.target) e.target.value = ""; }} />
    </div>
  );
}

export default AssistantChatInput;

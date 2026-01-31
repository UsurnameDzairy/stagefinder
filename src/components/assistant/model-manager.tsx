"use client";

import { useState, useEffect } from "react";
import { X, Plus, Search, Loader2, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  apiModel: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  topProvider: any;
}

interface ModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentModels: ModelOption[];
  onModelsUpdate: (models: ModelOption[]) => void;
}

export default function ModelManager({ isOpen, onClose, currentModels, onModelsUpdate }: ModelManagerProps) {
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState<ModelOption[]>(currentModels);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableModels();
    }
  }, [isOpen]);

  const fetchAvailableModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/openrouter/models");
      const data = await res.json();
      setAvailableModels(data.models || []);
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = (model: OpenRouterModel) => {
    const newModel: ModelOption = {
      id: model.id,
      name: model.name,
      description: model.description,
      apiModel: model.id,
      badge: parseFloat(model.pricing.prompt) === 0 ? "Gratuit" : undefined,
    };

    if (!selectedModels.find(m => m.id === model.id)) {
      setSelectedModels([...selectedModels, newModel]);
    }
  };

  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(selectedModels.filter(m => m.id !== modelId));
  };

  const handleSave = async () => {
    setSaving(true);
    console.log("[ModelManager] Saving models:", selectedModels);
    try {
      const res = await fetch("/api/user/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models: selectedModels }),
      });

      const data = await res.json();
      console.log("[ModelManager] Save response:", data);

      if (res.ok && data.success) {
        console.log("[ModelManager] Calling onModelsUpdate with:", selectedModels);
        onModelsUpdate(selectedModels);
        onClose();
      } else {
        console.error("[ModelManager] Save failed:", data.error);
      }
    } catch (error) {
      console.error("Failed to save models:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white">Gérer les Modèles IA</h2>
            <p className="text-sm text-zinc-500 mt-1">Ajoutez ou supprimez des modèles depuis OpenRouter</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left: Available Models */}
          <div className="flex-1 p-6 border-r border-zinc-800 flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Rechercher un modèle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : (
                filteredModels.map((model) => {
                  const isSelected = selectedModels.find(m => m.id === model.id);
                  const isFree = parseFloat(model.pricing.prompt) === 0;

                  return (
                    <button
                      key={model.id}
                      onClick={() => handleAddModel(model)}
                      disabled={!!isSelected}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isSelected
                          ? "bg-zinc-800 border-zinc-700 opacity-50 cursor-not-allowed"
                          : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white truncate">{model.name}</span>
                            {isFree && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full uppercase">
                                Gratuit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2">{model.description}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">
                            Context: {model.contextLength.toLocaleString()} tokens
                          </p>
                        </div>
                        {isSelected ? (
                          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Plus className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Models */}
          <div className="w-80 p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Modèles Sélectionnés ({selectedModels.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {selectedModels.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <p className="text-sm text-zinc-500">
                    Aucun modèle sélectionné.<br />
                    Ajoutez-en depuis la liste.
                  </p>
                </div>
              ) : (
                selectedModels.map((model) => (
                  <div
                    key={model.id}
                    className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm truncate">{model.name}</span>
                          {model.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full uppercase">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{model.description}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveModel(model.id)}
                        className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || selectedModels.length === 0}
            className="bg-[#C2C0B6] hover:bg-[#B0AEA4] text-black font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

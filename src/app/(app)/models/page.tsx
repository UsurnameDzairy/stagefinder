"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Check, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AIModel {
    id: string;
    name: string;
    description: string;
    badge?: string;
    apiModel: string;
    provider: string;
}

export default function ModelsManagementPage() {
    const { t } = useTranslation();
    const [models, setModels] = useState<AIModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newModel, setNewModel] = useState<Partial<AIModel>>({
        provider: "openrouter"
    });

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const res = await fetch("/api/models");
            const data = await res.json();
            setModels(data.models || []);
        } catch (error) {
            console.error("Failed to fetch models:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveModels = async () => {
        setSaving(true);
        try {
            await fetch("/api/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ models })
            });
        } catch (error) {
            console.error("Failed to save models:", error);
        } finally {
            setSaving(false);
        }
    };

    const addModel = () => {
        if (!newModel.name || !newModel.apiModel) return;

        const model: AIModel = {
            id: Math.random().toString(36).substring(7),
            name: newModel.name,
            description: newModel.description || "",
            badge: newModel.badge,
            apiModel: newModel.apiModel,
            provider: newModel.provider || "openrouter"
        };

        setModels([...models, model]);
        setNewModel({ provider: "openrouter" });
        saveModels();
    };

    const removeModel = (id: string) => {
        setModels(models.filter(m => m.id !== id));
        saveModels();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-zinc-500">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-4xl font-serif font-normal tracking-tight text-white">
                    Gestion des Modèles IA
                </h1>
                <p className="text-sm text-zinc-500 mt-2">
                    Ajoutez ou supprimez des modèles depuis OpenRouter
                </p>
            </div>

            {/* Current Models */}
            <Card className="bg-black border-zinc-900">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                        Modèles Actifs
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {models.map((model) => (
                        <div
                            key={model.id}
                            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-white">{model.name}</h3>
                                    {model.badge && (
                                        <span className="px-2 py-0.5 text-[9px] font-bold bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                                            {model.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">{model.description}</p>
                                <p className="text-[10px] text-zinc-600 mt-1 font-mono">{model.apiModel}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeModel(model.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Add New Model */}
            <Card className="bg-black border-zinc-900">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                        Ajouter un Modèle
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-xs text-zinc-400">Nom du modèle</Label>
                            <Input
                                value={newModel.name || ""}
                                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                                placeholder="GPT-4"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-zinc-400">Badge (optionnel)</Label>
                            <Input
                                value={newModel.badge || ""}
                                onChange={(e) => setNewModel({ ...newModel, badge: e.target.value })}
                                placeholder="GRATUIT"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-400">Description</Label>
                        <Input
                            value={newModel.description || ""}
                            onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                            placeholder="Modèle puissant pour..."
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-400">
                            API Model (OpenRouter)
                            <a
                                href="https://openrouter.ai/models"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-500 hover:underline"
                            >
                                Voir les modèles →
                            </a>
                        </Label>
                        <Input
                            value={newModel.apiModel || ""}
                            onChange={(e) => setNewModel({ ...newModel, apiModel: e.target.value })}
                            placeholder="meta-llama/llama-3.3-70b-instruct"
                            className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs"
                        />
                    </div>

                    <Button
                        onClick={addModel}
                        disabled={!newModel.name || !newModel.apiModel}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter le modèle
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={saveModels}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    {saving ? (
                        <>
                            <Check className="h-4 w-4 mr-2 animate-spin" />
                            Sauvegarde...
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Sauvegarder
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

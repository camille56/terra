"use client";

import { useCallback, useEffect, useState } from "react";

type FileEntry = {
  key: string;
  size: number;
  lastModified: string | null;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);

  const refreshFiles = useCallback(async () => {
    const response = await fetch("/api/files");
    if (response.ok) {
      const data = await response.json();
      setFiles(data.files);
    }
  }, []);

  useEffect(() => {
    // Chargement initial de la liste depuis le bucket principal ; setFiles ne s'exécute
    // qu'après la réponse réseau, pas de cascade de rendus synchrones.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshFiles();
  }, [refreshFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert(`Fichier "${file.name}" uploadé avec succès.`);
        setFile(null);
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        await refreshFiles();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible d'uploader le fichier."}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Une erreur réseau est survenue.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    const confirmed = window.confirm(
      "Cette action va remplacer le contenu du bucket principal par celui du bucket froid : tout fichier absent du backup sera supprimé. Continuer ?"
    );
    if (!confirmed) return;

    setIsRestoring(true);
    try {
      const response = await fetch("/api/restore", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        alert(`Restauration terminée : ${data.restored} fichier(s) restauré(s), ${data.deleted} supprimé(s).`);
        await refreshFiles();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible de restaurer."}`);
      }
    } catch (error) {
      console.error("Restore error:", error);
      alert("Une erreur réseau est survenue.");
    } finally {
      setIsRestoring(false);
    }
  };

  const isBusy = isLoading || isRestoring;

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
      <main className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-zinc-800">
          Uploader un document
        </h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="sr-only">
              Choisir un fichier
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={isBusy}
              className="block w-full text-sm text-zinc-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-100 file:text-blue-700
                hover:file:bg-blue-200"
            />
            {file && (
              <p className="mt-3 text-sm text-zinc-600">
                Fichier prêt : <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || isBusy}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isLoading ? "Envoi..." : "Validation"}
            </button>
            <button
              onClick={handleRestore}
              disabled={isBusy}
              className="w-full px-6 py-3 bg-zinc-500 hover:bg-zinc-600 disabled:bg-zinc-400 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50"
            >
              {isRestoring ? "Restauration..." : "Restore"}
            </button>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-zinc-700 mb-2">
              Fichiers sur le bucket principal
            </h2>
            {files.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun fichier pour le moment.</p>
            ) : (
              <ul className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg">
                {files.map((entry) => (
                  <li key={entry.key} className="px-3 py-2 text-sm flex justify-between gap-3">
                    <span className="text-zinc-800 truncate">{entry.key}</span>
                    <span className="text-zinc-500 shrink-0">
                      {entry.lastModified ? new Date(entry.lastModified).toLocaleString() : "-"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

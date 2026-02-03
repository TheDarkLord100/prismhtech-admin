"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/utils/store/userStore";
import { notify, Notification } from "@/utils/notify";

interface MediaPickerDialogProps {
  bucket: string;
  open: boolean;
  onClose: () => void;

  // single select (existing usage)
  onSelect?: (url: string) => void;

  // multi select (bulk usage)
  onSelectMultiple?: (urls: string[]) => void;
}

export default function MediaPickerDialog({
  bucket,
  open,
  onClose,
  onSelect,
  onSelectMultiple,
}: MediaPickerDialogProps) {
  const token = useUserStore((s) => s.token);

  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // always array (single select uses first element)
  const [selected, setSelected] = useState<string[]>([]);

  // upload staging
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMultiSelect = !!onSelectMultiple;

  // --------------------------------
  // Helpers
  // --------------------------------
  function getFileName(url: string) {
    return url.split("/").pop()?.toLowerCase() || "";
  }

  const filteredFiles = files.filter((url) =>
    getFileName(url).includes(search.toLowerCase())
  );

  // --------------------------------
  // Load media
  // --------------------------------
  async function loadFiles() {
    if (!token) return;

    setLoading(true);

    const res = await fetch(`/api/media?bucket=${bucket}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      setLoading(false);
      return;
    }

    setFiles(data.files || []);
    setLoading(false);
  }

  useEffect(() => {
    if (open) {
      loadFiles();
      setSelected([]);
      setSearch("");
      clearPending();
    }
  }, [open]);

  // --------------------------------
  // Upload helpers
  // --------------------------------
  function clearPending() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setPendingFileName("");
  }

  async function handleSubmitUpload() {
    if (!pendingFile || !token) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", pendingFile);
    formData.append("bucket", bucket);
    formData.append(
      "fileName",
      pendingFileName.trim() || `media-${Date.now()}`
    );

    const res = await fetch("/api/media", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      setUploading(false);
      return;
    }

    setFiles((prev) => [data.url, ...prev]);
    setSelected([data.url]);
    clearPending();
    setUploading(false);
  }

  // --------------------------------
  // Selection
  // --------------------------------
  function toggleSelect(url: string) {
    if (isMultiSelect) {
      setSelected((prev) =>
        prev.includes(url)
          ? prev.filter((u) => u !== url)
          : [...prev, url]
      );
    } else {
      setSelected([url]);
    }
  }

  function confirmSelection() {
    if (isMultiSelect && onSelectMultiple) {
      onSelectMultiple(selected);
    } else if (onSelect) {
      onSelect(selected[0]);
    }
    onClose();
  }

  // --------------------------------
  // Render
  // --------------------------------
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* IMPORTANT: flex layout fixes the narrow-column bug */}
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        {/* ================= TOP CONTROLS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Search by file name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </Button>

          {selected.length > 0 && (
            <Button onClick={confirmSelection}>
              Select {selected.length}
            </Button>
          )}
        </div>

        {/* ================= FILE INPUT ================= */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setPendingFile(file);
            setPendingPreview(URL.createObjectURL(file));
            setPendingFileName(file.name.replace(/\.[^/.]+$/, ""));
            e.target.value = "";
          }}
        />

        {/* ================= PENDING UPLOAD ================= */}
        {pendingFile && (
          <div className="flex gap-4 items-center border rounded-lg p-4 mb-4 bg-gray-50">
            <img
              src={pendingPreview!}
              alt="preview"
              className="h-32 w-32 object-contain border rounded"
            />

            <div className="flex-1 space-y-2">
              <Input
                value={pendingFileName}
                onChange={(e) => setPendingFileName(e.target.value)}
                placeholder="File name"
              />

              <div className="flex gap-2">
                <Button disabled={uploading} onClick={handleSubmitUpload}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>

                <Button variant="outline" onClick={clearPending}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MEDIA GRID ================= */}
        <div className="w-full flex-1 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 h-full overflow-y-auto">
            {loading && <p>Loading images...</p>}

            {!loading && filteredFiles.length === 0 && (
              <p className="text-gray-500 col-span-full">
                No media found
              </p>
            )}

            {filteredFiles.map((url) => (
              <div
                key={url}
                onClick={() => toggleSelect(url)}
                className={`border rounded-xl p-3 cursor-pointer bg-white transition
                  ${
                    selected.includes(url)
                      ? "border-[#4CAF50] ring-2 ring-[#4CAF50]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="aspect-square w-full overflow-hidden rounded-md">
                  <img
                    src={url}
                    alt="media"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

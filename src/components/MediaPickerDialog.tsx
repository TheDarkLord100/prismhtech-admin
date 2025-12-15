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
  onSelect: (url: string) => void;
}

export default function MediaPickerDialog({
  bucket,
  open,
  onClose,
  onSelect,
}: MediaPickerDialogProps) {
  const token = useUserStore((s) => s.token);

  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // staged upload state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function getFileName(url: string) {
    return url.split("/").pop()?.toLowerCase() || "";
  }

  const filteredFiles = files.filter((url) =>
    getFileName(url).includes(search.toLowerCase())
  );

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

    setFiles(data.files);
    setLoading(false);
  }

  useEffect(() => {
    if (open) {
      loadFiles();
      setSelected(null);
      setSearch("");
      clearPending();
    }
  }, [open]);

  function clearPending() {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
    }
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      setUploading(false);
      return;
    }

    setFiles((prev) => [data.url, ...prev]);
    setSelected(data.url);
    clearPending();
    setUploading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        {/* Top controls */}
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

          {selected && (
            <Button
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
            >
              Select
            </Button>
          )}
        </div>

        {/* Hidden file input */}
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

        {/* Pending upload preview */}
        {pendingFile && (
          <div className="flex gap-4 items-center border rounded-lg p-4 mb-6 bg-gray-50">
            <img
              src={pendingPreview!}
              alt="preview"
              className="h-24 w-24 object-contain border rounded"
            />

            <div className="flex-1 space-y-2">
              <Input
                value={pendingFileName}
                onChange={(e) => setPendingFileName(e.target.value)}
                placeholder="File name"
              />

              <div className="flex gap-2">
                <Button
                  disabled={uploading}
                  onClick={handleSubmitUpload}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>

                <Button
                  variant="outline"
                  onClick={clearPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Media grid */}
        <div className="grid grid-cols-6 md:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto">
          {loading && <p>Loading images...</p>}

          {!loading && filteredFiles.length === 0 && (
            <p className="text-gray-500 col-span-full">
              No media found
            </p>
          )}

          {filteredFiles.map((url) => (
            <div
              key={url}
              onClick={() => setSelected(url)}
              className={`border rounded-lg p-3 cursor-pointer flex items-center justify-center
                ${
                  selected === url
                    ? "border-[#4CAF50] ring-2 ring-[#4CAF50]"
                    : "border-gray-200"
                }`}
            >
              <img
                src={url}
                alt="media"
                className="h-40 w-full object-contain"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

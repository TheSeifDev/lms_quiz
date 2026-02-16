"use client";

import { useState } from "react";
import CameraCapture from "./CameraCapture";
import ImagePreview from "./ImagePreview";

interface UploadCardProps {
  onImageSelect?: (file: File) => void;
}

export default function UploadCard({ onImageSelect }: UploadCardProps) {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Handle Selection
  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setImage(file);
    setPreviewUrl(url);

    // Notify parent component
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  // 2. Handle Delete
  const handleDelete = () => {
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl); // Cleanup memory
    setPreviewUrl(null);
  };

  // 3. Handle Add New (In this context, it resets to allow a new photo)
  // If you want multiple images, this would push to an array instead.
  const handleAdd = () => {
    // Logic could be: Save current to a list, then clear to take another
    alert("Ready to take another photo (Logic to be expanded)");
    handleDelete();
  };

  const handleEdit = () => {
    alert("Open Crop/Edit Modal here");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {previewUrl ? (
        <ImagePreview
          imageSrc={previewUrl}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAdd={handleAdd}
        />
      ) : (
        <CameraCapture onImageSelect={handleImageSelect} />
      )}
    </div>
  );
}
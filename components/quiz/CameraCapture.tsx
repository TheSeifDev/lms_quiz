"use client";

import { Camera, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

interface CameraCaptureProps {
  onImageSelect: (file: File) => void;
}

export default function CameraCapture({ onImageSelect }: CameraCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors gap-4 text-center h-64">
      <div className="p-4 bg-blue-100 rounded-full">
        <ImageIcon className="w-8 h-8 text-blue-600" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-700">Upload Quiz Answer</h3>
        <p className="text-sm text-gray-500">Take a photo or upload from gallery</p>
      </div>

      <div className="flex gap-3 mt-2">
        {/* Button 1: Open Camera */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Camera size={18} />
          <span>Open Camera</span>
        </button>

        {/* Button 2: Open Gallery */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          <ImageIcon size={18} />
          <span>Gallery</span>
        </button>
      </div>

      {/* Hidden Inputs */}
      {/* Capture="environment" forces rear camera on mobile */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Standard file picker for gallery */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
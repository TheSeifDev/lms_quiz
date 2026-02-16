"use client";

import { Trash2, Edit, Plus } from "lucide-react";
import Image from "next/image";

interface ImagePreviewProps {
  imageSrc: string;
  onDelete: () => void;
  onEdit: () => void; // Placeholder for future crop logic
  onAdd: () => void;  // Logic to add another image or reset
}

export default function ImagePreview({ imageSrc, onDelete, onEdit, onAdd }: ImagePreviewProps) {
  return (
    <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden group">
      {/* Image Display */}
      <div className="relative w-full h-full">
        <Image 
          src={imageSrc} 
          alt="Quiz Preview" 
          fill 
          className="object-contain" // Keeps aspect ratio intact
        />
      </div>

      {/* Overlay Actions (The 3 Buttons) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-sm flex justify-between items-center">
        
        {/* Action: Add New (Reset/Add) */}
        <button 
          onClick={onAdd}
          className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition"
        >
          <Plus size={20} />
          <span className="text-xs">Add New</span>
        </button>

        {/* Action: Edit (Crop/Rotate) */}
        <button 
          onClick={onEdit}
          className="flex flex-col items-center gap-1 text-white hover:text-yellow-400 transition"
        >
          <Edit size={20} />
          <span className="text-xs">Edit Image</span>
        </button>

        {/* Action: Delete */}
        <button 
          onClick={onDelete}
          className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition"
        >
          <Trash2 size={20} />
          <span className="text-xs">Delete Image</span>
        </button>
      </div>
    </div>
  );
}
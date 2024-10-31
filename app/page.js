"use client";

import ImageCropper from "@/components/ImageCropper";

export default function Home() {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-blue-300 to-blue-500 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-2 text-center drop-shadow-lg">
          Image Cropper
        </h1>
        <p className="text-center text-white/80 mb-8 text-lg">
          Crop multiple images to perfect squares in seconds
        </p>
        <ImageCropper />
      </div>
    </div>
  );
}

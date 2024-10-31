"use client";

import ImageCropper from "@/components/ImageCropper";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100 via-amber-300 to-amber-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-950 mb-2 text-center md:text-left drop-shadow-lg">
              Image Cropper Pro
            </h1>
            <p className="text-center md:text-left text-amber-900/80 text-lg">
              Advanced image processing tool
            </p>
          </div>
          <a
            href="https://github.com/yourusername/image-cropper"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-amber-900/90 hover:text-amber-950 transition-colors"
          >
            <Github className="w-6 h-6" />
            <span>View on GitHub</span>
          </a>
        </div>
        <ImageCropper />
      </div>
    </div>
  );
}

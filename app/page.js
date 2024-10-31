"use client";

import ImageCropper from "@/components/ImageCropper";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100 via-amber-300 to-amber-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ImageCropper />
      </div>
    </div>
  );
}

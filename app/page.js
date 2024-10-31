"use client";

import ImageCropper from "@/components/ImageCropper";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-emerald-200 to-purple-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ImageCropper />
      </div>
    </div>
  );
}

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  X,
  Settings2,
  Loader2,
  Progress,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ImageCropper = () => {
  const [croppedImages, setCroppedImages] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState({
    quality: 0.8,
    maxSize: 1024,
    maintainMetadata: true,
    format: "png",
  });

  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Invalid file type"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Calculate the square size (take the smaller dimension)
          const size = Math.min(img.width, img.height);

          // Set canvas size to be square
          canvas.width = size;
          canvas.height = size;

          // Calculate cropping position (from top, horizontally centered)
          const offsetX = (img.width - size) / 2;
          const offsetY = 0; // Start from top

          // Clear canvas and draw cropped image
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            img,
            offsetX,
            offsetY, // Source position
            size,
            size, // Source dimensions
            0,
            0, // Destination position
            size,
            size // Destination dimensions
          );

          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            fileName: file.name,
            originalFile: file,
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setError("");

    try {
      const processedImages = await Promise.all(
        files.map((file) => processImage(file))
      );
      setCroppedImages((prevImages) => [...prevImages, ...processedImages]);
    } catch (err) {
      setError(
        "Error processing one or more images. Please ensure all files are valid images."
      );
    }
  };

  const handleDownloadSingle = (dataUrl, fileName) => {
    const link = document.createElement("a");
    link.download = `cropped-${fileName}`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadAll = () => {
    if (croppedImages.length > 1) {
      import("jszip").then(({ default: JSZip }) => {
        const zip = new JSZip();

        croppedImages.forEach((image, index) => {
          const imageData = image.dataUrl.split(",")[1];
          zip.file(`cropped-${image.fileName}`, imageData, { base64: true });
        });

        zip.generateAsync({ type: "blob" }).then((content) => {
          const link = document.createElement("a");
          link.download = "cropped-images.zip";
          link.href = URL.createObjectURL(content);
          link.click();
          URL.revokeObjectURL(link.href);
        });
      });
    } else if (croppedImages.length === 1) {
      handleDownloadSingle(croppedImages[0].dataUrl, croppedImages[0].fileName);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      const input = fileInputRef.current;
      input.files = files;
      handleImageUpload({ target: input });
    }
  };

  const handleRemoveImage = (index) => {
    setCroppedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto backdrop-blur-md bg-white/30 shadow-2xl border-purple-100/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-purple-900">Image Processing</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-purple-200 hover:bg-purple-100/50"
              >
                <Settings2 className="w-4 h-4 text-purple-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/90 backdrop-blur-lg">
              <DialogHeader>
                <DialogTitle className="text-purple-900">
                  Advanced Settings
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-purple-900">
                    Output Quality ({Math.round(settings.quality * 100)}%)
                  </Label>
                  <Slider
                    value={[settings.quality * 100]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, quality: value / 100 }))
                    }
                    max={100}
                    step={1}
                    className="[&>div]:bg-emerald-200 [&>div>div]:bg-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-900">
                    Maximum Dimension ({settings.maxSize}px)
                  </Label>
                  <Slider
                    value={[settings.maxSize]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, maxSize: value }))
                    }
                    min={1024}
                    max={8192}
                    step={256}
                    className="[&>div]:bg-emerald-200 [&>div>div]:bg-purple-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-purple-900">Maintain Metadata</Label>
                  <Switch
                    checked={settings.maintainMetadata}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintainMetadata: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-900">Output Format</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-white border-purple-200 text-purple-900 focus:ring-purple-500 focus:border-purple-500"
                    value={settings.format}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        format: e.target.value,
                      }))
                    }
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl p-10 mb-6 text-center transition-all duration-300 ${
              processing ? "bg-white/80" : "bg-white/30 hover:bg-white/50"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {processing ? (
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <div className="space-y-2">
                  <Progress
                    value={progress}
                    className="bg-emerald-200/50 [&>div]:bg-purple-600"
                  />
                  <p className="text-sm text-purple-700">
                    Processing images...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="imageInput"
                />
                <label
                  htmlFor="imageInput"
                  className="cursor-pointer flex flex-col items-center gap-3 group"
                >
                  <div className="p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-purple-900">
                      Drop your images here
                    </p>
                    <p className="text-sm text-purple-700">
                      or click to browse from your computer
                    </p>
                  </div>
                </label>
              </>
            )}
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="mb-6 bg-red-100 text-red-900 border-red-200"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {croppedImages.length > 0 && (
            <div className="space-y-6">
              <Button
                onClick={handleDownloadAll}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={processing}
              >
                <Download className="w-5 h-5 mr-2" />
                Download All Images
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {croppedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white/50"
                  >
                    <img
                      src={image.dataUrl}
                      alt={`Cropped ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(image.dataUrl, image.fileName)
                        }
                        className="bg-white/90 hover:bg-white text-purple-900"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                        className="bg-red-500/90 hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-purple-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium truncate">
                        {image.fileName}
                      </p>
                      <p className="text-white/80 text-xs">
                        {image.dimensions} • {Math.round(image.size)}KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ImageCropper;

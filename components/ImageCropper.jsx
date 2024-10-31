import React, { useState, useRef } from "react";
import { Upload, Download, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ImageCropper = () => {
  const [croppedImages, setCroppedImages] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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
    <Card className="w-full max-w-4xl mx-auto backdrop-blur-sm bg-white/90 shadow-2xl border-white/20">
      <CardHeader>
        <CardTitle className="text-center text-gray-800">
          Upload Your Images
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl p-10 mb-6 text-center transition-colors duration-300 bg-blue-50/50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
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
            <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                Drop your images here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse from your computer
              </p>
            </div>
          </label>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {croppedImages.length > 0 && (
          <div className="space-y-6">
            <Button
              onClick={handleDownloadAll}
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Download All Images
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {croppedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={image.dataUrl}
                    alt={`Cropped ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleDownloadSingle(image.dataUrl, image.fileName)
                      }
                      className="bg-white/90 hover:bg-white"
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
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm truncate">
                      {image.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageCropper;

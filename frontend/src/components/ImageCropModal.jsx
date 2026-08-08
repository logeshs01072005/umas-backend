import React, { useState, useRef, useEffect } from "react";
import { Crop, ZoomIn, ZoomOut, Check, X, RotateCw } from "lucide-react";

export default function ImageCropModal({ imageSrc, onCropComplete, onClose, title = "Crop & Adjust Image" }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("3:4"); // default 3:4 for fashion/product
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      setOffset({ x: 0, y: 0 });
    };
    img.src = typeof imageSrc === "string" ? imageSrc : URL.createObjectURL(imageSrc);
  }, [imageSrc]);

  // Draw crop preview on canvas
  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    // Determine target canvas dimensions based on aspect ratio
    let targetWidth = 400;
    let targetHeight = 500; // 3:4 default
    if (aspectRatio === "1:1") {
      targetWidth = 400;
      targetHeight = 400;
    } else if (aspectRatio === "16:9") {
      targetWidth = 533;
      targetHeight = 300;
    } else if (aspectRatio === "free") {
      targetWidth = 450;
      targetHeight = 450;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.save();

    // Center point
    ctx.translate(targetWidth / 2 + offset.x, targetHeight / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate scaled dimensions
    const scale = Math.max(targetWidth / img.width, targetHeight / img.height) * zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [imageLoaded, zoom, rotation, offset, aspectRatio]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCrop = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onCropComplete(dataUrl, blob);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Crop className="w-5 h-5 text-rose-600" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Workspace */}
        <div
          className="relative bg-gray-900 flex items-center justify-center p-6 min-h-[360px] cursor-grab active:cursor-grabbing select-none overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageLoaded ? (
            <div className="relative shadow-2xl border-2 border-rose-500/80 rounded-lg overflow-hidden bg-black/40">
              <canvas ref={canvasRef} className="block" />
              {/* Overlay Crop Grid */}
              <div className="absolute inset-0 border border-white/40 pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              Loading image...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 bg-white">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aspect Ratio</span>
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              {[
                { label: "3:4 Portrait", val: "3:4" },
                { label: "1:1 Square", val: "1:1" },
                { label: "16:9 Wide", val: "16:9" },
              ].map((ar) => (
                <button
                  key={ar.val}
                  type="button"
                  onClick={() => setAspectRatio(ar.val)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    aspectRatio === ar.val
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider & Controls */}
          <div className="flex items-center gap-4">
            <ZoomOut className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-rose-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Rotate Image"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCrop}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

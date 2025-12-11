import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function CropperModal({ imgSrc, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function cropImage() {
    const croppedImage = await getCroppedImage(imgSrc, croppedAreaPixels);
    onCropDone(croppedImage);
  }

  return (
    <div className="crop-modal">
      <div className="crop-container">
        <Cropper
          image={imgSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="crop-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={cropImage}>Crop</button>
      </div>
    </div>
  );
}

// Helper: Convert cropped area to actual image file
async function getCroppedImage(imageSrc, croppedAreaPixels) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

function createImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
}

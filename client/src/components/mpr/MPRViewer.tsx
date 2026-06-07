import React, { useState, useEffect, useRef } from 'react';

// Data shape for the 3D MRI volume
interface VolumeData {
  dimensions: [number, number, number]; // [width (X), height (Y), depth (Z)]
  data: Float32Array;                   // Flattened 3D voxel array
}

interface MPRViewerProps {
  volume: VolumeData | null;
}

export const MPRViewer: React.FC<MPRViewerProps> = ({ volume }) => {
  // 1. STATE: Tracks current slice index for each plane
  const [slices, setSlices] = useState({ axial: 0, coronal: 0, sagittal: 0 });
  
  // References to HTML canvas elements
  const axialRef = useRef<HTMLCanvasElement>(null);
  const coronalRef = useRef<HTMLCanvasElement>(null);
  const sagittalRef = useRef<HTMLCanvasElement>(null);

  // Automatically reset sliders to the center of the volume when a new scan loads
  useEffect(() => {
    if (volume) {
      setSlices({
        axial: Math.floor(volume.dimensions[2] / 2),
        coronal: Math.floor(volume.dimensions[1] / 2),
        sagittal: Math.floor(volume.dimensions[0] / 2),
      });
    }
  }, [volume]);

  // 2. RENDERING ENGINE: Draws slices whenever volume or slider states change
  useEffect(() => {
    if (!volume) return;

    const [X, Y, Z] = volume.dimensions;
    
    // Config style for crosshair lines
    const crosshairColor = '#00ff00'; // Bright Neon Green
    const lineWidth = 1;

    // Render Axial Plane (X-Y slicing across Z-axis)
    const renderAxial = () => {
      const canvas = axialRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.createImageData(X, Y);
      const zOffset = slices.axial * X * Y;

      for (let y = 0; y < Y; y++) {
        for (let x = 0; x < X; x++) {
          const idx = (y * X + x) * 4;
          const voxelVal = volume.data[zOffset + y * X + x] * 255; 
          imgData.data[idx] = voxelVal;     // Red
          imgData.data[idx + 1] = voxelVal; // Green
          imgData.data[idx + 2] = voxelVal; // Blue
          imgData.data[idx + 3] = 255;      // Alpha (Opacity)
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // --- Draw Crosshairs ---
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = crosshairColor;

      // Vertical line tracking Sagittal slice (X coordinate)
      ctx.beginPath();
      ctx.moveTo(slices.sagittal, 0);
      ctx.lineTo(slices.sagittal, Y);
      ctx.stroke();

      // Horizontal line tracking Coronal slice (Y coordinate)
      ctx.beginPath();
      ctx.moveTo(0, slices.coronal);
      ctx.lineTo(X, slices.coronal);
      ctx.stroke();
    };

    // Render Coronal Plane (X-Z slicing across Y-axis)
    const renderCoronal = () => {
      const canvas = coronalRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.createImageData(X, Z);

      for (let z = 0; z < Z; z++) {
        for (let x = 0; x < X; x++) {
          const idx = (z * X + x) * 4;
          const voxelVal = volume.data[z * X * Y + slices.coronal * X + x] * 255;
          imgData.data[idx] = voxelVal;
          imgData.data[idx + 1] = voxelVal;
          imgData.data[idx + 2] = voxelVal;
          imgData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // --- Draw Crosshairs ---
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = crosshairColor;

      // Vertical line tracking Sagittal slice (X coordinate)
      ctx.beginPath();
      ctx.moveTo(slices.sagittal, 0);
      ctx.lineTo(slices.sagittal, Z);
      ctx.stroke();

      // Horizontal line tracking Axial slice (Z coordinate)
      ctx.beginPath();
      ctx.moveTo(0, slices.axial);
      ctx.lineTo(X, slices.axial);
      ctx.stroke();
    };

    // Render Sagittal Plane (Y-Z slicing across X-axis)
    const renderSagittal = () => {
      const canvas = sagittalRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.createImageData(Y, Z);

      for (let z = 0; z < Z; z++) {
        for (let y = 0; y < Y; y++) {
          const idx = (z * Y + y) * 4;
          const voxelVal = volume.data[z * X * Y + y * X + slices.sagittal] * 255;
          imgData.data[idx] = voxelVal;
          imgData.data[idx + 1] = voxelVal;
          imgData.data[idx + 2] = voxelVal;
          imgData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // --- Draw Crosshairs ---
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = crosshairColor;

      // Vertical line tracking Coronal slice (Y coordinate)
      ctx.beginPath();
      ctx.moveTo(slices.coronal, 0);
      ctx.lineTo(slices.coronal, Z);
      ctx.stroke();

      // Horizontal line tracking Axial slice (Z coordinate)
      ctx.beginPath();
      ctx.moveTo(0, slices.axial);
      ctx.lineTo(Y, slices.axial);
      ctx.stroke();
    };

    renderAxial();
    renderCoronal();
    renderSagittal();
  }, [volume, slices]);

  if (!volume) return <div className="text-slate-400 p-4 text-center">No volume data loaded.</div>;

  // 3. UI LAYOUT: Grid template containing views and slice sliders
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-900 rounded-xl border border-slate-800 w-full max-w-5xl">
      {/* Axial Panel */}
      <div className="flex flex-col items-center gap-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <span className="text-xs font-bold text-slate-400 tracking-wider">AXIAL PLANE (Z)</span>
        <canvas ref={axialRef} width={volume.dimensions[0]} height={volume.dimensions[1]} className="border border-slate-800 bg-black w-full object-contain aspect-square rounded" />
        <input type="range" min={0} max={volume.dimensions[2] - 1} value={slices.axial} onChange={(e) => setSlices({ ...slices, axial: parseInt(e.target.value) })} className="w-full mt-2 accent-indigo-500" />
        <span className="text-xs text-slate-500">Slice: {slices.axial}</span>
      </div>

      {/* Coronal Panel */}
      <div className="flex flex-col items-center gap-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <span className="text-xs font-bold text-slate-400 tracking-wider">CORONAL PLANE (Y)</span>
        <canvas ref={coronalRef} width={volume.dimensions[0]} height={volume.dimensions[2]} className="border border-slate-800 bg-black w-full object-contain aspect-square rounded" />
        <input type="range" min={0} max={volume.dimensions[1] - 1} value={slices.coronal} onChange={(e) => setSlices({ ...slices, coronal: parseInt(e.target.value) })} className="w-full mt-2 accent-indigo-500" />
        <span className="text-xs text-slate-500">Slice: {slices.coronal}</span>
      </div>

      {/* Sagittal Panel */}
      <div className="flex flex-col items-center gap-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <span className="text-xs font-bold text-slate-400 tracking-wider">SAGITTAL PLANE (X)</span>
        <canvas ref={sagittalRef} width={volume.dimensions[1]} height={volume.dimensions[2]} className="border border-slate-800 bg-black w-full object-contain aspect-square rounded" />
        <input type="range" min={0} max={volume.dimensions[0] - 1} value={slices.sagittal} onChange={(e) => setSlices({ ...slices, sagittal: parseInt(e.target.value) })} className="w-full mt-2 accent-indigo-500" />
        <span className="text-xs text-slate-500">Slice: {slices.sagittal}</span>
      </div>
    </div>
  );
};
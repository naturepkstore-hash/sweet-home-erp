'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Baby, ImagePlus, Trash2 } from 'lucide-react';
import { childPhotoDisplaySrc } from '@/lib/child-photo';

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ChildPhotoPickerProps {
  currentPhoto?: string | null;
  onFileSelected: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ChildPhotoPicker({ currentPhoto, onFileSelected, onRemove, disabled = false }: ChildPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(childPhotoDisplaySrc(currentPhoto) || currentPhoto || null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setPreview(childPhotoDisplaySrc(currentPhoto) || currentPhoto || null);
  }, [currentPhoto]);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Photo must be 4 MB or smaller.');
      return;
    }

    setError('');
    setProcessing(true);
    let preparedFile = file;
    if (file.size > 1024 * 1024) {
      try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const optimizedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        if (optimizedBlob) preparedFile = new File([optimizedBlob], 'child-profile.jpg', { type: 'image/jpeg' });
        bitmap.close();
      } catch {
        setError('The image could not be prepared. Please choose another image.');
        setProcessing(false);
        return;
      }
    }
    setPreview((oldPreview) => {
      if (oldPreview?.startsWith('blob:')) URL.revokeObjectURL(oldPreview);
      return URL.createObjectURL(preparedFile);
    });
    onFileSelected(preparedFile);
    setProcessing(false);
  };

  const removePhoto = () => {
    setError('');
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileSelected(null);
    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white">
        {preview ? (
          <img src={preview} alt="Child profile preview" className="h-full w-full object-cover" />
        ) : (
          <Baby className="h-10 w-10 text-slate-300" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 text-xs">
        <div className="font-bold text-slate-800">Profile Photo</div>
        <p className="mt-1 text-[11px] text-slate-500">JPEG, PNG, or WebP up to 4 MB.</p>
        {error && <p className="mt-1 font-semibold text-red-700" role="alert">{error}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" disabled={disabled || processing} onClick={() => inputRef.current?.click()} className="flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
            <ImagePlus className="h-3.5 w-3.5" />{processing ? 'Preparing...' : preview ? 'Replace Photo' : 'Upload Photo'}
          </button>
          {preview && <button type="button" disabled={disabled} onClick={removePhoto} className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={disabled} onChange={(event) => handleFile(event.target.files?.[0])} />
      </div>
    </div>
  );
}

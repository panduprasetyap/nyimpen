"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { Camera, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// --- Canvas Utils for Cropping ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); 
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
}
// --- End Utils ---

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    job_title: "",
    estimated_monthly_income: "",
    photos: "",
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            job_title: data.job_title || "",
            estimated_monthly_income: data.estimated_monthly_income?.toString() || "",
            photos: data.photos || "",
          });
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      if (type === 'success') {
          setTimeout(() => setNotification(null), 3000);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropModalOpen(true);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        // Upload immediately
        const formDataUpload = new FormData();
        formDataUpload.append("file", croppedBlob, "profile.jpg");
        
        const res = await fetch("/api/user/upload", {
            method: "POST",
            body: formDataUpload
        });

        if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({ ...prev, photos: data.url }));
            setIsCropModalOpen(false);
            setImageSrc(null);
            showNotification('success', 'Photo updated successfully');
        } else {
            showNotification('error', "Upload failed");
        }
      }
    } catch (e) {
      console.error(e);
      showNotification('error', "Failed to crop/upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotification('success', "Profile updated successfully!");
        router.refresh();
      } else {
        showNotification('error', "Failed to update profile");
      }
    } catch (e) {
      console.error(e);
      showNotification('error', "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        
        {/* Notification Toast */}
        {notification && (
            <div className={`absolute top-0 left-0 right-0 p-4 text-center font-medium text-sm transition-all transform ${
                notification.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
                {notification.message}
            </div>
        )}

        {/* Photo Upload */}
        <div className="flex flex-col items-center mb-8 mt-2">
            <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                    {formData.photos ? (
                        <img src={formData.photos} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                            {formData.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                </div>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileChange}
                />
            </div>
            <p className="mt-2 text-sm text-slate-500">Click to change photo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                    type="text" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input 
                    type="text" 
                    name="job_title"
                    value={formData.job_title} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="e.g. Software Engineer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Monthly Income</label>
                <input 
                    type="number" 
                    name="estimated_monthly_income"
                    value={formData.estimated_monthly_income} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="0.00"
                />
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </form>
      </div>

      {/* Crop Modal */}
      {isCropModalOpen && imageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b">
                      <h3 className="font-bold text-center">Crop Photo</h3>
                  </div>
                  <div className="relative h-64 w-full bg-slate-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Zoom</span>
                          <input 
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1"
                          />
                      </div>
                      <div className="flex gap-3">
                          <button 
                            onClick={() => setIsCropModalOpen(false)}
                            className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleSaveCrop}
                            className="flex-1 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800"
                          >
                              Apply
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

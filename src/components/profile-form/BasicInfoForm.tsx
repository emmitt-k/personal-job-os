import { type Profile } from '@/types/profile';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/canvasUtils';

interface BasicInfoFormProps {
    formData: Profile;
    setFormData: React.Dispatch<React.SetStateAction<Profile>>;
    skillInput: string;
    setSkillInput: (value: string) => void;
    onRemoveSkill: (skill: string) => void;
    onKeyDownSkill: (e: React.KeyboardEvent) => void;
}

export function BasicInfoForm({
    formData,
    setFormData,
    skillInput,
    setSkillInput,
    onRemoveSkill,
    onKeyDownSkill
}: BasicInfoFormProps) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, photo: undefined }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- CROP STATE ---
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File is too large. Please select an image under 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setTempImgSrc(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCrop = async () => {
        if (!tempImgSrc || !croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(tempImgSrc, croppedAreaPixels);
            setFormData(prev => ({ ...prev, photo: croppedImage }));
            handleCancelCrop();
        } catch (e) {
            console.error(e);
            alert("Failed to crop image.");
        }
    };

    const handleCancelCrop = () => {
        setTempImgSrc(null);
        setIsCropping(false);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 relative">
            {/* Cropper Modal Overlay */}
            {isCropping && tempImgSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col h-[500px]">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <h3 className="font-semibold text-gray-800">Crop Profile Photo</h3>
                            <button onClick={handleCancelCrop} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                        </div>

                        <div className="relative flex-1 bg-zinc-900 w-full overflow-hidden">
                            <Cropper
                                image={tempImgSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>

                        <div className="p-4 bg-white space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelCrop}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveCrop}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-zinc-800"
                                >
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Upload */}
            <div className="flex items-center gap-6">
                <div className="relative group shrink-0">
                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center overflow-hidden bg-muted ${!formData.photo ? 'border-dashed border-zinc-300' : 'border-solid border-zinc-200'}`}>
                        {formData.photo ? (
                            <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-zinc-400" size={32} />
                        )}
                    </div>
                    {formData.photo && (
                        <button
                            onClick={removePhoto}
                            className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors border border-red-200 shadow-sm"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <p className="text-xs text-muted-foreground">Recommended: Square JPG or PNG, max 5MB.</p>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-xs gap-2"
                        >
                            <Upload size={14} /> Upload & Crop
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-border" />
            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Profile Name</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="e.g. Full Stack V2"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Role</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.targetRole}
                            onChange={e => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Intro */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Intro / Summary</label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-ring resize-y"
                    placeholder="Brief professional summary..."
                    value={formData.intro}
                    onChange={e => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                />
            </div>

            {/* Skills */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="min-h-[38px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-ring">
                    {formData.skills.map(skill => (
                        <span key={skill} className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                            {skill}
                            <button
                                type="button"
                                onClick={() => onRemoveSkill(skill)}
                                className="ml-1 rounded-full outline-none hover:bg-zinc-300 dark:hover:bg-zinc-700 p-0.5"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-sm min-w-[80px] placeholder:text-muted-foreground text-foreground"
                        placeholder="Add skill (Enter)..."
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={onKeyDownSkill}
                    />
                </div>
            </div>
        </div>
    );
}

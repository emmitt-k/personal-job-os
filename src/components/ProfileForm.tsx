import { useState, useEffect } from 'react';
import { type Profile, type Experience, type Project, type Education, type Certification } from '@/types/profile';
import { X, Plus, Trash2, Pencil } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProfileFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profile: Profile) => Promise<void>;
    initialData?: Profile | null;
}

const EMPTY_PROFILE: Profile = {
    name: '',
    targetRole: '',
    intro: '',
    skills: [],
    contactInfo: {},
    hrData: {},
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    updatedAt: new Date(),
};

export function ProfileForm({ isOpen, onClose, onSave, initialData }: ProfileFormProps) {
    const [formData, setFormData] = useState<Profile>(EMPTY_PROFILE);
    const [skillInput, setSkillInput] = useState('');

    // Sub-modal states
    const [activeSection, setActiveSection] = useState<'main' | 'experience' | 'project' | 'education' | 'certification'>('main');

    // Temp states for new items
    const [tempExperience, setTempExperience] = useState<Partial<Experience>>({});
    const [tempProject, setTempProject] = useState<Partial<Project>>({});
    const [tempEducation, setTempEducation] = useState<Partial<Education>>({});
    const [tempCertification, setTempCertification] = useState<Partial<Certification>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData, certifications: initialData.certifications || [] } : { ...EMPTY_PROFILE, skills: [], experience: [], projects: [], education: [], certifications: [] });
            setActiveSection('main');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // --- SKILLS HANDLERS ---
    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleKeyDownSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    // --- GENERIC LIST HANDLERS ---
    const removeItem = (listKey: keyof Profile, id: string) => {
        if (listKey === 'certifications' && !formData.certifications) return;
        setFormData(prev => ({
            ...prev,
            [listKey]: (prev[listKey] as any[]).filter((item: any) => item.id !== id)
        }));
    };

    // --- SUB-MODAL SAVERS ---
    const saveExperience = () => {
        if (!tempExperience.company || !tempExperience.role) return;

        if (tempExperience.id) {
            // Update existing
            setFormData(prev => ({
                ...prev,
                experience: prev.experience.map(item =>
                    item.id === tempExperience.id ? { ...item, ...tempExperience } as Experience : item
                )
            }));
        } else {
            // Add new
            const newExp: Experience = {
                id: uuidv4(),
                company: tempExperience.company,
                role: tempExperience.role,
                startDate: tempExperience.startDate || '',
                endDate: tempExperience.endDate || '',
                current: tempExperience.current || false,
                description: tempExperience.description || '',
            };
            setFormData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
        }
        setTempExperience({});
        setActiveSection('main');
    };

    const saveProject = () => {
        if (!tempProject.name) return;

        if (tempProject.id) {
            setFormData(prev => ({
                ...prev,
                projects: prev.projects.map(item =>
                    item.id === tempProject.id ? { ...item, ...tempProject } as Project : item
                )
            }));
        } else {
            const newProj: Project = {
                id: uuidv4(),
                name: tempProject.name,
                description: tempProject.description || '',
                url: tempProject.url || '',
            };
            setFormData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
        }
        setTempProject({});
        setActiveSection('main');
    };

    const saveEducation = () => {
        if (!tempEducation.institution || !tempEducation.degree) return;

        if (tempEducation.id) {
            setFormData(prev => ({
                ...prev,
                education: prev.education.map(item =>
                    item.id === tempEducation.id ? { ...item, ...tempEducation } as Education : item
                )
            }));
        } else {
            const newEdu: Education = {
                id: uuidv4(),
                institution: tempEducation.institution,
                degree: tempEducation.degree,
                startDate: tempEducation.startDate || '',
                endDate: tempEducation.endDate || '',
            };
            setFormData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
        }
        setTempEducation({});
        setActiveSection('main');
    };

    const saveCertification = () => {
        if (!tempCertification.name || !tempCertification.issuer) return;

        if (tempCertification.id) {
            setFormData(prev => ({
                ...prev,
                certifications: prev.certifications.map(item =>
                    item.id === tempCertification.id ? { ...item, ...tempCertification } as Certification : item
                )
            }));
        } else {
            const newCert: Certification = {
                id: uuidv4(),
                name: tempCertification.name,
                issuer: tempCertification.issuer,
                year: tempCertification.year || '',
                url: tempCertification.url || '',
            };
            setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
        }
        setTempCertification({});
        setActiveSection('main');
    };


    // --- RENDERERS ---

    // 1. MAIN FORM VIEW
    const renderMainForm = () => (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        {initialData ? 'Edit Profile' : 'Create New Profile'}
                    </h2>
                    <p className="text-sm text-muted-foreground p-0">Define a new persona for tailored resumes.</p>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Role</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="e.g. Senior Software Engineer"
                                value={formData.targetRole}
                                onChange={e => setFormData({ ...formData, targetRole: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & HR Info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="+1 (555) 000-0000"
                                value={formData.contactInfo?.phone || ''}
                                onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="you@example.com"
                                value={formData.contactInfo?.email || ''}
                                onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, email: e.target.value } })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="City, Country"
                                value={formData.contactInfo?.location || ''}
                                onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, location: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Work Preference</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                value={formData.hrData?.workPreference || 'Remote'}
                                onChange={e => setFormData({ ...formData, hrData: { ...formData.hrData, workPreference: e.target.value as any } })}
                            >
                                <option value="Remote">Remote</option>
                                <option value="On-Site">On-Site</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">LinkedIn</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="in/username"
                                value={formData.contactInfo?.linkedin || ''}
                                onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, linkedin: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">GitHub</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="username"
                                value={formData.contactInfo?.github || ''}
                                onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, github: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Portfolio / Website</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="https://..."
                                value={formData.contactInfo?.website || ''}
                                onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, website: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notice Period</label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="e.g. 2 Weeks"
                                value={formData.hrData?.noticePeriod || ''}
                                onChange={e => setFormData({ ...formData, hrData: { ...formData.hrData, noticePeriod: e.target.value } })}
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
                        onChange={e => setFormData({ ...formData, intro: e.target.value })}
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
                                    onClick={() => handleRemoveSkill(skill)}
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
                            onKeyDown={handleKeyDownSkill}
                        />
                    </div>
                </div>

                <hr className="border-border" />

                {/* EXPERIENCE SECTION */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Experience</label>
                        <button
                            onClick={() => { setTempExperience({}); setActiveSection('experience'); }}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                        >
                            <Plus size={14} /> Add Position
                        </button>
                    </div>
                    {formData.experience.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">No experience added yet.</div>
                    )}
                    <div className="space-y-2">
                        {formData.experience.map(exp => (
                            <div key={exp.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-foreground">{exp.role}</span>
                                        <span className="text-muted-foreground text-xs">at</span>
                                        <span className="font-medium text-sm text-foreground">{exp.company}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{exp.description}</p>
                                </div>
                                <button
                                    onClick={() => { setTempExperience(exp); setActiveSection('experience'); }}
                                    className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => removeItem('experience', exp.id)}
                                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PROJECTS SECTION */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Projects</label>
                        <button
                            onClick={() => { setTempProject({}); setActiveSection('project'); }}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                        >
                            <Plus size={14} /> Add Project
                        </button>
                    </div>
                    {formData.projects.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">No projects added yet.</div>
                    )}
                    <div className="space-y-2">
                        {formData.projects.map(proj => (
                            <div key={proj.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                                <div className="flex-1 space-y-1">
                                    <div className="font-medium text-sm text-foreground">{proj.name}</div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{proj.description}</p>
                                </div>
                                <button
                                    onClick={() => { setTempProject(proj); setActiveSection('project'); }}
                                    className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => removeItem('projects', proj.id)}
                                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDUCATION SECTION */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Education</label>
                        <button
                            onClick={() => { setTempEducation({}); setActiveSection('education'); }}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                        >
                            <Plus size={14} /> Add Education
                        </button>
                    </div>
                    {formData.education.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">No education added yet.</div>
                    )}
                    <div className="space-y-2">
                        {formData.education.map(edu => (
                            <div key={edu.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                                <div className="flex-1 space-y-1">
                                    <div className="font-medium text-sm text-foreground">{edu.degree}</div>
                                    <div className="text-xs text-muted-foreground">{edu.institution} • {edu.startDate} - {edu.endDate}</div>
                                </div>
                                <button
                                    onClick={() => { setTempEducation(edu); setActiveSection('education'); }}
                                    className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => removeItem('education', edu.id)}
                                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CERTIFICATIONS SECTION */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Certifications</label>
                        <button
                            onClick={() => { setTempCertification({}); setActiveSection('certification'); }}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                        >
                            <Plus size={14} /> Add Certification
                        </button>
                    </div>
                    {formData.certifications?.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">No certifications added yet.</div>
                    )}
                    <div className="space-y-2">
                        {formData.certifications?.map(cert => (
                            <div key={cert.id} className="rounded-md border border-border bg-muted/40 p-3 flex group relative">
                                <div className="flex-1 space-y-1">
                                    <div className="font-medium text-sm text-foreground">{cert.name}</div>
                                    <div className="text-xs text-muted-foreground">{cert.issuer} • {cert.year}</div>
                                </div>
                                <button
                                    onClick={() => { setTempCertification(cert); setActiveSection('certification'); }}
                                    className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => removeItem('certifications', cert.id)}
                                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(formData)}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm"
                >
                    {initialData ? 'Update Profile' : 'Create Profile'}
                </button>
            </div>
        </>
    );

    // 2. EXPERIENCE SUB-MODAL
    const renderExperienceForm = () => (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {tempExperience.id ? 'Edit Experience' : 'Add Experience'}
                </h2>
                <button onClick={() => setActiveSection('main')} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempExperience.company || ''}
                        onChange={e => setTempExperience({ ...tempExperience, company: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Role Title</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempExperience.role || ''}
                        onChange={e => setTempExperience({ ...tempExperience, role: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <input
                            type="text"
                            placeholder="MM/YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={tempExperience.startDate || ''}
                            onChange={e => setTempExperience({ ...tempExperience, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <input
                            type="text"
                            placeholder="Present"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={tempExperience.endDate || ''}
                            onChange={e => setTempExperience({ ...tempExperience, endDate: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempExperience.description || ''}
                        onChange={e => setTempExperience({ ...tempExperience, description: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                <button
                    onClick={() => setActiveSection('main')}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={saveExperience}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm"
                >
                    Save Position
                </button>
            </div>
        </>
    );

    // 3. PROJECT SUB-MODAL
    const renderProjectForm = () => (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {tempProject.id ? 'Edit Project' : 'Add Project'}
                </h2>
                <button onClick={() => setActiveSection('main')} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempProject.name || ''}
                        onChange={e => setTempProject({ ...tempProject, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">URL (Optional)</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempProject.url || ''}
                        onChange={e => setTempProject({ ...tempProject, url: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempProject.description || ''}
                        onChange={e => setTempProject({ ...tempProject, description: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                <button
                    onClick={() => setActiveSection('main')}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={saveProject}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm"
                >
                    Save Project
                </button>
            </div>
        </>
    );

    // 4. EDUCATION SUB-MODAL
    const renderEducationForm = () => (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {tempEducation.id ? 'Edit Education' : 'Add Education'}
                </h2>
                <button onClick={() => setActiveSection('main')} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">School / Institution</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempEducation.institution || ''}
                        onChange={e => setTempEducation({ ...tempEducation, institution: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Degree / Field of Study</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempEducation.degree || ''}
                        onChange={e => setTempEducation({ ...tempEducation, degree: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Year</label>
                        <input
                            type="text"
                            placeholder="YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={tempEducation.startDate || ''}
                            onChange={e => setTempEducation({ ...tempEducation, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Year</label>
                        <input
                            type="text"
                            placeholder="YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={tempEducation.endDate || ''}
                            onChange={e => setTempEducation({ ...tempEducation, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                <button
                    onClick={() => setActiveSection('main')}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={saveEducation}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm"
                >
                    Save Education
                </button>
            </div>
        </>
    );

    // 5. CERTIFICATION SUB-MODAL
    const renderCertificationForm = () => (
        <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                    {tempCertification.id ? 'Edit Certification' : 'Add Certification'}
                </h2>
                <button onClick={() => setActiveSection('main')} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Certification Name</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempCertification.name || ''}
                        onChange={e => setTempCertification({ ...tempCertification, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Issuer</label>
                    <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempCertification.issuer || ''}
                        onChange={e => setTempCertification({ ...tempCertification, issuer: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Year Issued</label>
                        <input
                            type="text"
                            placeholder="YYYY"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            value={tempCertification.year || ''}
                            onChange={e => setTempCertification({ ...tempCertification, year: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">URL (Optional)</label>
                    <input
                        type="text"
                        placeholder="https://..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={tempCertification.url || ''}
                        onChange={e => setTempCertification({ ...tempCertification, url: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 gap-3">
                <button
                    onClick={() => setActiveSection('main')}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={saveCertification}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm"
                >
                    Save Certification
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh] transition-all">

                {activeSection === 'main' && renderMainForm()}
                {activeSection === 'experience' && renderExperienceForm()}
                {activeSection === 'project' && renderProjectForm()}
                {activeSection === 'education' && renderEducationForm()}
                {activeSection === 'certification' && renderCertificationForm()}

            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { type Profile, type Experience, type Project, type Education, type Certification } from '@/types/profile';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { BasicInfoForm } from './profile-form/BasicInfoForm';
import { ContactSocialsForm } from './profile-form/ContactSocialsForm';
import { ExperienceSection } from './profile-form/ExperienceSection';
import { ProjectsSection } from './profile-form/ProjectsSection';
import { EducationSection } from './profile-form/EducationSection';
import { CertificationsSection } from './profile-form/CertificationsSection';
import { ExperienceEditForm } from './profile-form/ExperienceEditForm';
import { ProjectEditForm } from './profile-form/ProjectEditForm';
import { EducationEditForm } from './profile-form/EducationEditForm';
import { CertificationEditForm } from './profile-form/CertificationEditForm';

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
                company: tempExperience.company!,
                role: tempExperience.role!,
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
                name: tempProject.name!,
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
                institution: tempEducation.institution!,
                degree: tempEducation.degree!,
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
                name: tempCertification.name!,
                issuer: tempCertification.issuer!,
                year: tempCertification.year || '',
                url: tempCertification.url || '',
            };
            setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
        }
        setTempCertification({});
        setActiveSection('main');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh] transition-all">

                {activeSection === 'main' && (
                    <>
                        {/* Header */}
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

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <BasicInfoForm
                                formData={formData}
                                setFormData={setFormData}
                                skillInput={skillInput}
                                setSkillInput={setSkillInput}
                                onRemoveSkill={handleRemoveSkill}
                                onKeyDownSkill={handleKeyDownSkill}
                            />

                            <ContactSocialsForm
                                formData={formData}
                                setFormData={setFormData}
                            />

                            <hr className="border-border" />

                            <ExperienceSection
                                experience={formData.experience}
                                onAdd={() => { setTempExperience({}); setActiveSection('experience'); }}
                                onEdit={(exp) => { setTempExperience(exp); setActiveSection('experience'); }}
                                onRemove={(id) => removeItem('experience', id)}
                            />

                            <ProjectsSection
                                projects={formData.projects}
                                onAdd={() => { setTempProject({}); setActiveSection('project'); }}
                                onEdit={(proj) => { setTempProject(proj); setActiveSection('project'); }}
                                onRemove={(id) => removeItem('projects', id)}
                            />

                            <EducationSection
                                education={formData.education}
                                onAdd={() => { setTempEducation({}); setActiveSection('education'); }}
                                onEdit={(edu) => { setTempEducation(edu); setActiveSection('education'); }}
                                onRemove={(id) => removeItem('education', id)}
                            />

                            <CertificationsSection
                                certifications={formData.certifications}
                                onAdd={() => { setTempCertification({}); setActiveSection('certification'); }}
                                onEdit={(cert) => { setTempCertification(cert); setActiveSection('certification'); }}
                                onRemove={(id) => removeItem('certifications', id)}
                            />

                        </div>

                        {/* Footer */}
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
                )}

                {activeSection === 'experience' && (
                    <ExperienceEditForm
                        data={tempExperience}
                        setData={setTempExperience}
                        onSave={saveExperience}
                        onCancel={() => setActiveSection('main')}
                    />
                )}

                {activeSection === 'project' && (
                    <ProjectEditForm
                        data={tempProject}
                        setData={setTempProject}
                        onSave={saveProject}
                        onCancel={() => setActiveSection('main')}
                    />
                )}

                {activeSection === 'education' && (
                    <EducationEditForm
                        data={tempEducation}
                        setData={setTempEducation}
                        onSave={saveEducation}
                        onCancel={() => setActiveSection('main')}
                    />
                )}

                {activeSection === 'certification' && (
                    <CertificationEditForm
                        data={tempCertification}
                        setData={setTempCertification}
                        onSave={saveCertification}
                        onCancel={() => setActiveSection('main')}
                    />
                )}

            </div>
        </div>
    );
}

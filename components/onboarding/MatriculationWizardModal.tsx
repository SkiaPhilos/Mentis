'use client';

import React, { useState } from 'react';
import { UserProfile, Course, CommuteProfile } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import { AvatarVisual } from '@/components/character/AvatarVisual';
import { SCHOLAR_AVATARS } from '@/lib/avatars';
import {
  playParchmentRustle,
  playQuillScratch,
  playWaxSealStamp,
  playBrassBellChime,
  playClickTactile,
} from '@/lib/audio/soundEffects';
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Building2,
  Target,
  Award,
  Clock,
  MapPin,
  X,
  Scroll,
} from 'lucide-react';

interface MatriculationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialCourses?: Course[];
  initialCommute?: CommuteProfile;
  onComplete: (updatedProfile: UserProfile, courses: Course[], commute: CommuteProfile) => void;
}

const PRESET_COURSES: { name: string; code: string; credits: number; color: string }[] = [
  { name: 'Multivariable Calculus & Proofs', code: 'MATH-201', credits: 4, color: '#173B2D' },
  { name: 'Classical Mechanics & Systems', code: 'PHYS-102', credits: 4, color: '#8E7541' },
  { name: 'Data Structures & Algorithms', code: 'CS-210', credits: 4, color: '#2B4C6F' },
  { name: 'Epistemology & Symbolic Logic', code: 'PHIL-110', credits: 3, color: '#5B3A29' },
  { name: 'Organic Chemistry & Synthesis', code: 'CHEM-205', credits: 4, color: '#3A5A40' },
  { name: 'Linear Algebra & Vector Spaces', code: 'MATH-220', credits: 3, color: '#4A3B69' },
];

export const MatriculationWizardModal: React.FC<MatriculationWizardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialCourses = [],
  initialCommute,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Identity & Avatar
  const [fullName, setFullName] = useState<string>(currentUser.fullName || '');
  const [avatarId, setAvatarId] = useState<string>(currentUser.avatarId || 'scholar_m1');

  // Step 2: Curriculum & Goal
  const [institution, setInstitution] = useState<string>(
    currentUser.institution || 'COMSATS University'
  );
  const [educationType, setEducationType] = useState<
    'school' | 'college' | 'university' | 'graduate' | 'custom'
  >(currentUser.educationType || 'university');
  const [program, setProgram] = useState<string>(
    currentUser.program || 'Computer Science & Mathematics'
  );
  const [currentPeriod, setCurrentPeriod] = useState<string>(
    currentUser.currentPeriod || 'Semester 4'
  );
  const [targetGrade, setTargetGrade] = useState<string>(
    currentUser.targetGrade || '3.85 GPA / Summa Cum Laude'
  );

  // Step 3: Initial Courses & Commute
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>(
    initialCourses.length > 0
      ? initialCourses.map((c) => c.code)
      : ['MATH-201', 'PHYS-102', 'CS-210']
  );
  const [travelMinutes, setTravelMinutes] = useState<number>(
    initialCommute?.travelMinutes || 25
  );
  const [prepBufferMinutes, setPrepBufferMinutes] = useState<number>(
    initialCommute?.prepBufferMinutes || 15
  );

  if (!isOpen) return null;

  const handleNextStep = () => {
    playParchmentRustle();
    setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3));
  };

  const handlePrevStep = () => {
    playClickTactile();
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1));
  };

  const toggleCoursePreset = (code: string) => {
    playClickTactile();
    setSelectedCourseCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleFinalInduction = () => {
    playWaxSealStamp();
    setTimeout(() => playBrassBellChime(), 350);

    const updatedProfile: UserProfile = {
      ...currentUser,
      fullName: fullName.trim() || currentUser.fullName,
      avatarId,
      institution: institution.trim() || currentUser.institution,
      educationType,
      program: program.trim() || currentUser.program,
      currentPeriod: currentPeriod.trim() || currentUser.currentPeriod,
      targetGrade: targetGrade.trim() || currentUser.targetGrade,
    };

    // Build course list
    const chosenPresets = PRESET_COURSES.filter((p) => selectedCourseCodes.includes(p.code));
    const finalCourses: Course[] = chosenPresets.map((p, idx) => ({
      id: `course_${Date.now()}_${idx}`,
      userId: currentUser.id,
      name: p.name,
      code: p.code,
      instructor: 'Senior Academic Fellow',
      credits: p.credits,
      currentGrade: 'A',
      targetGrade: 'A+',
      color: p.color,
      notesCount: 0,
    }));

    // Commute Profile
    const finalCommute: CommuteProfile = {
      userId: currentUser.id,
      institution: institution.trim(),
      distanceKm: 8.5,
      travelMinutes,
      prepBufferMinutes,
    };

    MentisRepository.setMatriculationCompleted(true);
    onComplete(updatedProfile, finalCourses.length > 0 ? finalCourses : initialCourses, finalCommute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1710]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#FAF7EE] border border-[#B59A62]/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DAC1] bg-[#F3EEDB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173B2D] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                Matriculation Ceremony & Scholar Dossier
              </h3>
              <p className="text-xs text-[#8E7541] font-serif-scholarly">
                Induction Step {currentStep} of 3: {
                  currentStep === 1
                    ? 'Persona & Avatar Selection'
                    : currentStep === 2
                    ? 'Curriculum & Academic Goals'
                    : 'Discipline Folios & Daily Commute'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#202820]/60 hover:text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-3 bg-[#EAE2C8]/50 border-b border-[#E3DAC1] text-xs font-serif-scholarly text-[#202820]/70">
          <div
            className={`py-2 px-4 text-center border-r border-[#E3DAC1] transition-colors ${
              currentStep === 1
                ? 'bg-[#173B2D] text-[#F3EEDB] font-bold'
                : 'hover:bg-[#EAE2C8]'
            }`}
          >
            1. Scholar Persona
          </div>
          <div
            className={`py-2 px-4 text-center border-r border-[#E3DAC1] transition-colors ${
              currentStep === 2
                ? 'bg-[#173B2D] text-[#F3EEDB] font-bold'
                : 'hover:bg-[#EAE2C8]'
            }`}
          >
            2. Curriculum & Goals
          </div>
          <div
            className={`py-2 px-4 text-center transition-colors ${
              currentStep === 3
                ? 'bg-[#173B2D] text-[#F3EEDB] font-bold'
                : 'hover:bg-[#EAE2C8]'
            }`}
          >
            3. Folios & Commute
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* STEP 1: Avatar & Identity */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Scholar Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D]">
                  Scholarly Dignity & Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Scholar Julian Vance"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] focus:border-[#B59A62] outline-hidden text-sm font-serif-scholarly text-[#173B2D]"
                />
                <p className="text-[11px] text-[#202820]/60">
                  Your academic title as inscribed in lecture halls, vigil records, and certificates.
                </p>
              </div>

              {/* Avatar Selector Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D]">
                  Choose Your Academic Persona Avatar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SCHOLAR_AVATARS.map((av) => {
                    const isSelected = av.id === avatarId;
                    return (
                      <div
                        key={av.id}
                        onClick={() => {
                          playClickTactile();
                          setAvatarId(av.id);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                          isSelected
                            ? 'bg-[#F3EEDB] border-[#B59A62] shadow-sm ring-2 ring-[#B59A62]/40'
                            : 'bg-[#FAF7EE] border-[#E3DAC1] hover:border-[#B59A62]/60'
                        }`}
                      >
                        <AvatarVisual
                          avatarId={av.id}
                          size={64}
                          userName={fullName || av.name}
                          showFloatingName={isSelected}
                        />
                        <div className="mt-2">
                          <p className="font-serif-scholarly text-xs font-bold text-[#173B2D]">
                            {av.name}
                          </p>
                          <p className="text-[10px] text-[#8E7541] font-serif-scholarly">
                            {av.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Curriculum & Goal */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Education Type Preset Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D]">
                  Academic Institution Tier
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'university', label: 'University', desc: 'Semester 1 - 8+' },
                    { id: 'college', label: 'College', desc: 'Year 1 - 4' },
                    { id: 'graduate', label: 'Doctoral / Masters', desc: 'Postgraduate' },
                    { id: 'school', label: 'Senior Academy', desc: 'Class 9 - 12' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        playClickTactile();
                        setEducationType(tier.id as any);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        educationType === tier.id
                          ? 'bg-[#173B2D] text-[#F3EEDB] border-[#173B2D] shadow-xs'
                          : 'bg-[#FAF7EE] border-[#E3DAC1] text-[#202820] hover:bg-[#EAE2C8]'
                      }`}
                    >
                      <p className="font-serif-scholarly text-xs font-bold">{tier.label}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution & Program */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#8E7541]" />
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. COMSATS University Islamabad"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] focus:border-[#B59A62] outline-hidden text-xs font-serif-scholarly text-[#173B2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#8E7541]" />
                    Program / Faculty
                  </label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="e.g. Computer Science & Mathematics"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] focus:border-[#B59A62] outline-hidden text-xs font-serif-scholarly text-[#173B2D]"
                  />
                </div>
              </div>

              {/* Period & Target Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8E7541]" />
                    Current Academic Period
                  </label>
                  <input
                    type="text"
                    value={currentPeriod}
                    onChange={(e) => setCurrentPeriod(e.target.value)}
                    placeholder="e.g. Semester 4"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] focus:border-[#B59A62] outline-hidden text-xs font-serif-scholarly text-[#173B2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#8E7541]" />
                    Target Academic Benchmark
                  </label>
                  <input
                    type="text"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    placeholder="e.g. 3.85 GPA / Summa Cum Laude"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] focus:border-[#B59A62] outline-hidden text-xs font-serif-scholarly text-[#173B2D]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Courses & Commute */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D]">
                    Select Initial Disciplines for Your Desk & Notes
                  </label>
                  <span className="text-[11px] text-[#8E7541] font-serif-scholarly">
                    {selectedCourseCodes.length} disciplines selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_COURSES.map((course) => {
                    const isSelected = selectedCourseCodes.includes(course.code);
                    return (
                      <div
                        key={course.code}
                        onClick={() => toggleCoursePreset(course.code)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#FAF7EE] border-[#B59A62] shadow-2xs'
                            : 'bg-[#FAF7EE]/50 border-[#E3DAC1] hover:bg-[#FAF7EE]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: course.color }}
                          />
                          <div>
                            <p className="font-serif-scholarly text-xs font-bold text-[#173B2D]">
                              {course.name}
                            </p>
                            <p className="text-[10px] text-[#8E7541]">
                              {course.code} • {course.credits} Credits
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-[#173B2D] border-[#173B2D] text-[#D4AF37]'
                              : 'border-[#E3DAC1] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Commute Configuration */}
              <div className="p-4 rounded-2xl bg-[#F3EEDB] border border-[#E3DAC1] space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#8E7541]" />
                  <h4 className="font-serif-scholarly text-xs font-bold text-[#173B2D]">
                    Academic Journey & Commute Vigil
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#202820]/70 font-serif-scholarly">
                      Transit Duration: {travelMinutes} minutes
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      step={5}
                      value={travelMinutes}
                      onChange={(e) => setTravelMinutes(Number(e.target.value))}
                      className="w-full accent-[#173B2D]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#202820]/70 font-serif-scholarly">
                      Departure Buffer: {prepBufferMinutes} minutes
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={prepBufferMinutes}
                      onChange={(e) => setPrepBufferMinutes(Number(e.target.value))}
                      className="w-full accent-[#173B2D]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E3DAC1] bg-[#F3EEDB]">
          {currentStep > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif-scholarly text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-serif-scholarly text-[#202820]/60 hover:text-[#173B2D] transition-colors cursor-pointer"
            >
              Postpone Induction
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B59A62]" />
            </button>
          ) : (
            <button
              onClick={handleFinalInduction}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#173B2D] text-[#D4AF37] hover:bg-[#122E23] text-xs font-serif-scholarly font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Inscribe Matriculation Oath</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { ScheduleBlock, Course, ScheduleBlockType } from '@/types/mentis';
import { formatMinutesToTime } from '@/lib/commuteCalculator';
import { X, Clock, MapPin, Trash2, Calendar, BookOpen } from 'lucide-react';

interface ScheduleBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: {
    id?: string;
    title: string;
    courseId?: string;
    dayOfWeek: number;
    startMinutes: number;
    durationMinutes: number;
    color: string;
    type: ScheduleBlockType;
    roomOrLocation?: string;
    reminderMinutesBefore?: number;
  }) => void;
  onDelete?: (id: string) => void;
  initialBlock?: ScheduleBlock | null;
  defaultDay?: number;
  defaultStartMinutes?: number;
  courses: Course[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BLOCK_TYPES: { type: ScheduleBlockType; label: string; defaultColor: string }[] = [
  { type: 'class', label: 'Lecture / Class', defaultColor: '#173B2D' },
  { type: 'study', label: 'Library & Study', defaultColor: '#8E7541' },
  { type: 'assignment', label: 'Assignment Work', defaultColor: '#2B4C7E' },
  { type: 'exam', label: 'Examination / Quiz', defaultColor: '#8B263E' },
  { type: 'commute', label: 'Transit Commute', defaultColor: '#5C6B5E' },
  { type: 'break', label: 'Scholarly Repose', defaultColor: '#A08050' },
  { type: 'personal', label: 'Personal Discipline', defaultColor: '#4A5859' },
];

interface ScheduleBlockFormProps extends Omit<ScheduleBlockModalProps, 'isOpen'> {}

const ScheduleBlockForm: React.FC<ScheduleBlockFormProps> = ({
  onClose,
  onSave,
  onDelete,
  initialBlock,
  defaultDay = 0,
  defaultStartMinutes = 540,
  courses,
}) => {
  const clampedStart = Math.max(
    480,
    Math.min(1170, initialBlock ? initialBlock.startMinutes : defaultStartMinutes)
  );

  const [title, setTitle] = useState(() => (initialBlock ? initialBlock.title : ''));
  const [courseId, setCourseId] = useState<string>(() =>
    initialBlock ? initialBlock.courseId || '' : courses[0]?.id || ''
  );
  const [dayOfWeek, setDayOfWeek] = useState<number>(() =>
    initialBlock ? initialBlock.dayOfWeek : defaultDay
  );
  const [startHour, setStartHour] = useState<number>(() => Math.floor(clampedStart / 60));
  const [startMinute, setStartMinute] = useState<number>(() =>
    initialBlock ? clampedStart % 60 : Math.floor((clampedStart % 60) / 30) * 30
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(() =>
    initialBlock ? initialBlock.durationMinutes : 90
  );
  const [type, setType] = useState<ScheduleBlockType>(() =>
    initialBlock ? initialBlock.type : 'class'
  );
  const [room, setRoom] = useState(() => initialBlock?.roomOrLocation || '');
  const [reminderMinutes, setReminderMinutes] = useState<number>(
    () => initialBlock?.reminderMinutesBefore ?? 15
  );
  const [customColor, setCustomColor] = useState(() => initialBlock?.color || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedStart = startHour * 60 + startMinute;
    const selectedCourse = courses.find((c) => c.id === courseId);
    const resolvedColor =
      customColor ||
      (selectedCourse ? selectedCourse.color : null) ||
      BLOCK_TYPES.find((t) => t.type === type)?.defaultColor ||
      '#173B2D';

    onSave({
      id: initialBlock?.id,
      title: title.trim() || (selectedCourse ? selectedCourse.name : 'Scholarly Session'),
      courseId: courseId || undefined,
      dayOfWeek,
      startMinutes: calculatedStart,
      durationMinutes,
      color: resolvedColor,
      type,
      roomOrLocation: room.trim() || undefined,
      reminderMinutesBefore: reminderMinutes,
    });
    onClose();
  };

  const calculatedStartMinutes = startHour * 60 + startMinute;
  const calculatedEndMinutes = calculatedStartMinutes + durationMinutes;

  return (
    <div
      id="schedule-block-modal-content"
      className="w-full max-w-lg rounded-2xl bg-[#F4EEDC] p-6 shadow-2xl border border-[#B59A62]/60 text-[#173B2D] space-y-4 max-h-[92vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#173B2D]/10 flex items-center justify-center border border-[#173B2D]/20">
            <Calendar className="w-4 h-4 text-[#173B2D]" />
          </div>
          <div>
            <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
              {initialBlock ? 'Refine Scholarly Commitment' : 'Inscribe Academic Commitment'}
            </h3>
            <p className="text-[11px] text-[#202820]/65 font-sans">
              {DAYS[dayOfWeek]} • {formatMinutesToTime(calculatedStartMinutes)} to{' '}
              {formatMinutesToTime(calculatedEndMinutes)} ({durationMinutes}m)
            </p>
          </div>
        </div>
        <button
          id="close-block-modal-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#EAE2C8] text-[#202820]/60 hover:text-[#173B2D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-serif-scholarly">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-1 text-[#173B2D]">
            Commitment Title or Subject
          </label>
          <input
            id="block-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quantum Physics Lecture or Scriptorium Study"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] focus:border-[#B59A62] text-[#202820] text-sm placeholder:text-[#202820]/40 outline-none transition-colors"
            required
          />
        </div>

        {/* Course Association & Activity Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 text-[#173B2D]">
              Associated Course
            </label>
            <div className="relative">
              <select
                id="block-course-select"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  const selected = courses.find((c) => c.id === e.target.value);
                  if (selected) {
                    setCustomColor(selected.color);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
              >
                <option value="">(Independent Academic Endeavor)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#173B2D]">
              Commitment Classification
            </label>
            <select
              id="block-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as ScheduleBlockType)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Day of Week & Time Configuration */}
        <div className="p-3.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E7541]">
            <Clock className="w-3.5 h-3.5" />
            <span>Temporal Placement & Duration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Day */}
            <div>
              <label className="block text-[11px] font-medium text-[#202820]/75 mb-1">
                Day of Week
              </label>
              <select
                id="block-day-select"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E3DAC1] text-[#202820] outline-none"
              >
                {DAYS.map((d, idx) => (
                  <option key={d} value={idx}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-[11px] font-medium text-[#202820]/75 mb-1">
                Commences At
              </label>
              <div className="flex items-center gap-1">
                <select
                  id="block-start-hour-select"
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#E3DAC1] text-[#202820] outline-none"
                >
                  {Array.from({ length: 15 }, (_, i) => 7 + i).map((h) => {
                    const h12 = h % 12 === 0 ? 12 : h % 12;
                    const period = h >= 12 ? 'PM' : 'AM';
                    return (
                      <option key={h} value={h}>
                        {h12} {period}
                      </option>
                    );
                  })}
                </select>
                <select
                  id="block-start-minute-select"
                  value={startMinute}
                  onChange={(e) => setStartMinute(parseInt(e.target.value, 10))}
                  className="w-20 px-2 py-1.5 rounded-lg bg-white border border-[#E3DAC1] text-[#202820] outline-none"
                >
                  <option value={0}>:00</option>
                  <option value={15}>:15</option>
                  <option value={30}>:30</option>
                  <option value={45}>:45</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[11px] font-medium text-[#202820]/75 mb-1">
                Span / Duration
              </label>
              <select
                id="block-duration-select"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E3DAC1] text-[#202820] outline-none"
              >
                <option value={30}>30 min (Micro)</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours (Standard Lecture)</option>
                <option value={120}>2 hours (Extended Lab)</option>
                <option value={150}>2.5 hours</option>
                <option value={180}>3 hours (Seminar)</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Academic Hall */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 text-[#173B2D] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Sanctum or Lecture Hall</span>
            </label>
            <input
              id="block-room-input"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Hall C-12 or Faraday Laboratory"
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#173B2D] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Transit Alert Buffer</span>
            </label>
            <select
              id="block-reminder-select"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
            >
              <option value={0}>No Departure Alert</option>
              <option value={15}>15 minutes before leave time</option>
              <option value={30}>30 minutes before leave time</option>
              <option value={45}>45 minutes before leave time</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E3DAC1]">
          {initialBlock && onDelete ? (
            <button
              id="delete-block-btn"
              type="button"
              onClick={() => {
                if (confirm(`Expel "${initialBlock.title}" from the academic schedule?`)) {
                  onDelete(initialBlock.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-100 text-rose-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Expel Commitment</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              id="cancel-block-btn"
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-[#202820]/70 hover:bg-[#EAE2C8] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-block-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] font-semibold transition-colors shadow-xs"
            >
              {initialBlock ? 'Seal Modifications' : 'Inscribe into Timetable'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const ScheduleBlockModal: React.FC<ScheduleBlockModalProps> = (props) => {
  if (!props.isOpen) return null;

  const formKey = props.initialBlock
    ? `edit-${props.initialBlock.id}`
    : `new-${props.defaultDay}-${props.defaultStartMinutes}`;

  return (
    <div
      id="schedule-block-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <ScheduleBlockForm key={formKey} {...props} />
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { ScheduleBlock, Course, CommuteProfile, ScheduleBlockType } from '@/types/mentis';
import { formatMinutesToTime } from '@/lib/commuteCalculator';
import { Plus, Clock, MapPin, Trash2, Edit3, Settings, Check } from 'lucide-react';

interface ScheduleViewProps {
  schedule: ScheduleBlock[];
  courses: Course[];
  commute: CommuteProfile;
  onAddBlock: (block: ScheduleBlock) => void;
  onUpdateBlock: (block: ScheduleBlock) => void;
  onDeleteBlock: (id: string) => void;
  onUpdateCommute: (commute: CommuteProfile) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 8; // 8:00 AM
const END_HOUR = 20; // 8:00 PM
const TOTAL_HOURS = END_HOUR - START_HOUR;

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  courses,
  commute,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onUpdateCommute,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isEditingCommute, setIsEditingCommute] = useState(false);
  const [commuteForm, setCommuteForm] = useState<CommuteProfile>(commute);

  // Block Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCourseId, setFormCourseId] = useState<string>(courses[0]?.id || '');
  const [formDay, setFormDay] = useState<number>(0);
  const [formStartHour, setFormStartHour] = useState<number>(8);
  const [formStartMinute, setFormStartMinute] = useState<number>(30);
  const [formDuration, setFormDuration] = useState<number>(90);
  const [formType, setFormType] = useState<ScheduleBlockType>('class');
  const [formRoom, setFormRoom] = useState('');

  const openAddModal = (day: number = selectedDay) => {
    setEditingBlockId(null);
    setFormTitle('');
    setFormCourseId(courses[0]?.id || '');
    setFormDay(day);
    setFormStartHour(9);
    setFormStartMinute(0);
    setFormDuration(90);
    setFormType('class');
    setFormRoom('');
    setIsModalOpen(true);
  };

  const openEditModal = (block: ScheduleBlock) => {
    setEditingBlockId(block.id);
    setFormTitle(block.title);
    setFormCourseId(block.courseId || '');
    setFormDay(block.dayOfWeek);
    setFormStartHour(Math.floor(block.startMinutes / 60));
    setFormStartMinute(block.startMinutes % 60);
    setFormDuration(block.durationMinutes);
    setFormType(block.type);
    setFormRoom(block.roomOrLocation || '');
    setIsModalOpen(true);
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const startMinutes = formStartHour * 60 + formStartMinute;
    const course = courses.find((c) => c.id === formCourseId);
    const color = course ? course.color : '#173B2D';

    if (editingBlockId) {
      onUpdateBlock({
        id: editingBlockId,
        userId: 'scholar_usr_01',
        title: formTitle || (course ? course.name : 'Study Session'),
        courseId: formCourseId,
        dayOfWeek: formDay,
        startMinutes,
        durationMinutes: formDuration,
        color,
        type: formType,
        roomOrLocation: formRoom,
      });
    } else {
      onAddBlock({
        id: `sch_${Date.now()}`,
        userId: 'scholar_usr_01',
        title: formTitle || (course ? course.name : 'Study Session'),
        courseId: formCourseId,
        dayOfWeek: formDay,
        startMinutes,
        durationMinutes: formDuration,
        color,
        type: formType,
        roomOrLocation: formRoom,
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveCommute = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCommute(commuteForm);
    setIsEditingCommute(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
            Academic Timetable
          </h2>
          <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
            Structured 7-day schedule with intelligent transit buffer calculations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditingCommute(!isEditingCommute)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Transit Settings</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Transit & Commute Drawer (Collapsible) */}
      {isEditingCommute && (
        <form
          onSubmit={handleSaveCommute}
          className="parchment-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-[#B59A62] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#E3DAC1] pb-2">
            <h3 className="font-serif-scholarly text-sm font-bold text-[#173B2D]">
              Commute & Leave-By Parameters
            </h3>
            <span className="text-[11px] text-[#202820]/60">
              Affects morning leave-by notifications
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif-scholarly">
            <div>
              <label className="block text-[#173B2D] font-semibold mb-1">
                Target Institution
              </label>
              <input
                type="text"
                value={commuteForm.institution}
                onChange={(e) =>
                  setCommuteForm({ ...commuteForm, institution: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
                required
              />
            </div>
            <div>
              <label className="block text-[#173B2D] font-semibold mb-1">
                Estimated Transit (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={commuteForm.travelMinutes}
                onChange={(e) =>
                  setCommuteForm({
                    ...commuteForm,
                    travelMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
                required
              />
            </div>
            <div>
              <label className="block text-[#173B2D] font-semibold mb-1">
                Preparation Buffer (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={commuteForm.prepBufferMinutes}
                onChange={(e) =>
                  setCommuteForm({
                    ...commuteForm,
                    prepBufferMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingCommute(false)}
              className="px-3 py-1 rounded-lg text-xs font-serif-scholarly text-[#202820]/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Update Commute Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Day Selector Tabs for Mobile / Responsive */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((dayName, idx) => {
          const isSelected = selectedDay === idx;
          const dayBlocks = schedule.filter((b) => b.dayOfWeek === idx);
          return (
            <button
              key={dayName}
              onClick={() => setSelectedDay(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif-scholarly whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#173B2D] text-[#F3EEDB] font-bold shadow-xs'
                  : 'bg-[#FAF7EE] text-[#202820]/70 hover:bg-[#EAE2C8] border border-[#E3DAC1]'
              }`}
            >
              <span>{dayName}</span>
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected
                    ? 'bg-[#B59A62] text-[#173B2D]'
                    : 'bg-[#E3DAC1] text-[#202820]'
                }`}
              >
                {dayBlocks.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daily Detailed Schedule Cards for Selected Day */}
      <div className="parchment-card rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1] mb-4">
          <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
            {DAYS[selectedDay]} Scholarly Agenda
          </h3>
          <button
            onClick={() => openAddModal(selectedDay)}
            className="text-xs font-serif-scholarly text-[#8E7541] hover:text-[#173B2D] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to {DAYS[selectedDay]}</span>
          </button>
        </div>

        {(() => {
          const dayBlocks = schedule
            .filter((b) => b.dayOfWeek === selectedDay)
            .sort((a, b) => a.startMinutes - b.startMinutes);

          if (dayBlocks.length === 0) {
            return (
              <div className="text-center py-10 text-[#202820]/60">
                <Clock className="w-8 h-8 mx-auto text-[#B59A62]/60 mb-2" />
                <p className="font-serif-scholarly text-sm font-semibold">
                  No scheduled academic commitments on this day.
                </p>
                <p className="text-xs font-sans mt-0.5">
                  Enjoy open study or add laboratory sessions & lectures.
                </p>
                <button
                  onClick={() => openAddModal(selectedDay)}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly"
                >
                  Schedule Event
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {dayBlocks.map((block) => {
                const endMinutes = block.startMinutes + block.durationMinutes;
                const course = courses.find((c) => c.id === block.courseId);

                return (
                  <div
                    key={block.id}
                    className="p-3.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62]/60 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2.5 h-12 rounded-full shrink-0"
                        style={{ backgroundColor: block.color || '#173B2D' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-serif-scholarly font-bold px-2 py-0.2 rounded bg-[#173B2D]/10 text-[#173B2D] uppercase tracking-wider">
                            {block.type}
                          </span>
                          <span className="text-xs font-serif-scholarly font-semibold text-[#8E7541]">
                            {formatMinutesToTime(block.startMinutes)} –{' '}
                            {formatMinutesToTime(endMinutes)} ({block.durationMinutes} min)
                          </span>
                        </div>
                        <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] mt-0.5">
                          {block.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#202820]/65">
                          {course && <span>{course.code}</span>}
                          {block.roomOrLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#B59A62]" />
                              {block.roomOrLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(block)}
                        title="Edit commitment"
                        className="p-1.5 rounded-lg hover:bg-[#EAE2C8] text-[#173B2D]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteBlock(block.id)}
                        title="Delete commitment"
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Add / Edit Block Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#F3EEDB] p-6 shadow-2xl border border-[#B59A62]/50 text-[#173B2D]">
            <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D] pb-3 border-b border-[#E3DAC1]">
              {editingBlockId ? 'Edit Scholarly Commitment' : 'Add Scholarly Commitment'}
            </h3>

            <form onSubmit={handleSaveBlock} className="mt-4 space-y-3.5 text-xs font-serif-scholarly">
              <div>
                <label className="block font-semibold mb-1">Title / Event Name</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Electromagnetism Lecture"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Associated Course</label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  >
                    <option value="">(None / Independent)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Activity Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ScheduleBlockType)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  >
                    <option value="class">Class / Lecture</option>
                    <option value="study">Study / Library</option>
                    <option value="assignment">Assignment Work</option>
                    <option value="commute">Commute Transit</option>
                    <option value="exam">Exam / Quiz</option>
                    <option value="break">Repose / Break</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(parseInt(e.target.value))}
                    className="w-full px-2 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  >
                    {DAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Start Hour</label>
                  <select
                    value={formStartHour}
                    onChange={(e) => setFormStartHour(parseInt(e.target.value))}
                    className="w-full px-2 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  >
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i).map((h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value))}
                    className="w-full px-2 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Room / Academic Hall</label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. Hall C-12 or Kelvin Optics Lab"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3DAC1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-[#202820]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] font-medium"
                >
                  {editingBlockId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

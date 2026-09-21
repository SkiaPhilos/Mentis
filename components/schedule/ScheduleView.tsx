'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ScheduleBlock, Course, CommuteProfile } from '@/types/mentis';
import { formatMinutesToTime, calculateLeaveBy } from '@/lib/commuteCalculator';
import { ScheduleBlockModal } from './ScheduleBlockModal';
import {
  Plus,
  Clock,
  MapPin,
  Settings,
  Check,
  Calendar,
  Grid3X3,
  ListFilter,
  Car,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  Sparkles,
} from 'lucide-react';

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
const DAY_ABBRS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  courses,
  commute,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onUpdateCommute,
}) => {
  // View mode: 'grid' (7-Day visual matrix) vs 'agenda' (Day list view)
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  // Time range settings
  const [timeRangeMode, setTimeRangeMode] = useState<'standard' | 'extended'>('standard');
  const startHour = timeRangeMode === 'standard' ? 8 : 7; // 8:00 AM or 7:00 AM
  const endHour = timeRangeMode === 'standard' ? 20 : 22; // 8:00 PM or 10:00 PM
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const totalMinutes = endMinutes - startMinutes;

  // Current Day identification
  const currentDayIndex = useMemo(() => {
    const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon...
    return jsDay === 0 ? 6 : jsDay - 1;
  }, []);

  // Selection & modals
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  });
  const [isEditingCommute, setIsEditingCommute] = useState(false);
  const [commuteForm, setCommuteForm] = useState<CommuteProfile>(commute);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialBlock, setModalInitialBlock] = useState<ScheduleBlock | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState<number>(0);
  const [modalDefaultStart, setModalDefaultStart] = useState<number>(540);

  // Active Drag State
  const [draggingBlock, setDraggingBlock] = useState<{
    block: ScheduleBlock;
    initialDay: number;
    initialStartMinutes: number;
    currentDay: number;
    currentStartMinutes: number;
  } | null>(null);

  // Active Resize State
  const [resizingBlock, setResizingBlock] = useState<{
    block: ScheduleBlock;
    initialDuration: number;
    currentDuration: number;
  } | null>(null);

  // Drag references
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Today's first commitment leave-by calculation
  const todayLeaveBy = useMemo(() => {
    const todayBlocks = schedule
      .filter((b) => b.dayOfWeek === currentDayIndex)
      .sort((a, b) => a.startMinutes - b.startMinutes);

    if (todayBlocks.length === 0) return null;
    const firstBlock = todayBlocks[0];
    return calculateLeaveBy(firstBlock, commute);
  }, [schedule, currentDayIndex, commute]);

  // Handle open modal for creation
  const handleOpenCreateModal = (day: number = selectedDay, startMin: number = 540) => {
    setModalInitialBlock(null);
    setModalDefaultDay(day);
    setModalDefaultStart(startMin);
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEditModal = (block: ScheduleBlock) => {
    setModalInitialBlock(block);
    setModalDefaultDay(block.dayOfWeek);
    setModalDefaultStart(block.startMinutes);
    setIsModalOpen(true);
  };

  // Save from modal
  const handleSaveModal = (blockData: {
    id?: string;
    title: string;
    courseId?: string;
    dayOfWeek: number;
    startMinutes: number;
    durationMinutes: number;
    color: string;
    type: ScheduleBlock['type'];
    roomOrLocation?: string;
    reminderMinutesBefore?: number;
  }) => {
    if (blockData.id) {
      onUpdateBlock({
        id: blockData.id,
        userId: 'scholar_usr_01',
        title: blockData.title,
        courseId: blockData.courseId,
        dayOfWeek: blockData.dayOfWeek,
        startMinutes: blockData.startMinutes,
        durationMinutes: blockData.durationMinutes,
        color: blockData.color,
        type: blockData.type,
        roomOrLocation: blockData.roomOrLocation,
        reminderMinutesBefore: blockData.reminderMinutesBefore,
      });
    } else {
      onAddBlock({
        id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: 'scholar_usr_01',
        title: blockData.title,
        courseId: blockData.courseId,
        dayOfWeek: blockData.dayOfWeek,
        startMinutes: blockData.startMinutes,
        durationMinutes: blockData.durationMinutes,
        color: blockData.color,
        type: blockData.type,
        roomOrLocation: blockData.roomOrLocation,
        reminderMinutesBefore: blockData.reminderMinutesBefore,
      });
    }
  };

  // Click on empty space in grid to quick-create
  const handleGridRowClick = (e: React.MouseEvent<HTMLDivElement>, dayIndex: number) => {
    if (draggingBlock || resizingBlock) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const rawMinutes = startMinutes + ratio * totalMinutes;
    // Snap to nearest 30-minute interval
    const snappedMinutes = Math.floor(rawMinutes / 30) * 30;
    const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes - 60, snappedMinutes));

    handleOpenCreateModal(dayIndex, clampedMinutes);
  };

  // Pointer Down for Dragging a Block
  const handleBlockPointerDown = (e: React.PointerEvent, block: ScheduleBlock) => {
    // Only left click or primary touch
    if (e.button !== 0) return;
    e.stopPropagation();

    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    setDraggingBlock({
      block,
      initialDay: block.dayOfWeek,
      initialStartMinutes: block.startMinutes,
      currentDay: block.dayOfWeek,
      currentStartMinutes: block.startMinutes,
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Down for Resizing a Block
  const handleResizePointerDown = (e: React.PointerEvent, block: ScheduleBlock) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    setResizingBlock({
      block,
      initialDuration: block.durationMinutes,
      currentDuration: block.durationMinutes,
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move for active Dragging or Resizing
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingBlock) {
        const deltaX = e.clientX - pointerStartRef.current.x;
        const deltaY = e.clientY - pointerStartRef.current.y;

        const rowEl = rowRefs.current[draggingBlock.initialDay];
        if (!rowEl) return;
        const rowWidth = rowEl.getBoundingClientRect().width;
        if (rowWidth <= 0) return;

        // Calculate minutes delta (30 min snapping)
        const minutesPerPixel = totalMinutes / rowWidth;
        const rawDeltaMinutes = deltaX * minutesPerPixel;
        const snappedDeltaMinutes = Math.round(rawDeltaMinutes / 30) * 30;

        const newStartMinutes = Math.max(
          startMinutes,
          Math.min(
            endMinutes - draggingBlock.block.durationMinutes,
            draggingBlock.initialStartMinutes + snappedDeltaMinutes
          )
        );

        // Calculate day delta based on row height (~88px)
        const dayRowHeight = 88;
        const dayDelta = Math.round(deltaY / dayRowHeight);
        const newDay = Math.max(0, Math.min(6, draggingBlock.initialDay + dayDelta));

        setDraggingBlock((prev) =>
          prev
            ? {
                ...prev,
                currentDay: newDay,
                currentStartMinutes: newStartMinutes,
              }
            : null
        );
      } else if (resizingBlock) {
        const deltaX = e.clientX - pointerStartRef.current.x;
        const rowEl = rowRefs.current[resizingBlock.block.dayOfWeek];
        if (!rowEl) return;
        const rowWidth = rowEl.getBoundingClientRect().width;
        if (rowWidth <= 0) return;

        const minutesPerPixel = totalMinutes / rowWidth;
        const deltaMinutes = Math.round((deltaX * minutesPerPixel) / 30) * 30;

        const maxDuration = endMinutes - resizingBlock.block.startMinutes;
        const newDuration = Math.max(
          30,
          Math.min(maxDuration, resizingBlock.initialDuration + deltaMinutes)
        );

        setResizingBlock((prev) =>
          prev
            ? {
                ...prev,
                currentDuration: newDuration,
              }
            : null
        );
      }
    },
    [draggingBlock, resizingBlock, startMinutes, endMinutes, totalMinutes]
  );

  // Pointer Up to commit Drag or Resize
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (draggingBlock) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore if not captured
        }

        const hasChanged =
          draggingBlock.currentDay !== draggingBlock.initialDay ||
          draggingBlock.currentStartMinutes !== draggingBlock.initialStartMinutes;

        if (hasChanged) {
          onUpdateBlock({
            ...draggingBlock.block,
            dayOfWeek: draggingBlock.currentDay,
            startMinutes: draggingBlock.currentStartMinutes,
          });
        }

        setDraggingBlock(null);
      }

      if (resizingBlock) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }

        if (resizingBlock.currentDuration !== resizingBlock.initialDuration) {
          onUpdateBlock({
            ...resizingBlock.block,
            durationMinutes: resizingBlock.currentDuration,
          });
        }

        setResizingBlock(null);
      }
    },
    [draggingBlock, resizingBlock, onUpdateBlock]
  );

  // Commute Form submission
  const handleSaveCommute = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCommute(commuteForm);
    setIsEditingCommute(false);
  };

  // Hour columns for header ruler and grid vertical guide lines
  const hourMarkers = useMemo(() => {
    const hours: number[] = [];
    for (let h = startHour; h < endHour; h++) {
      hours.push(h);
    }
    return hours;
  }, [startHour, endHour]);

  return (
    <div
      id="schedule-view-root"
      className="space-y-5"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
              Academic Timetable
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#B59A62]/15 text-[#8E7541] border border-[#B59A62]/30 text-[10px] font-serif-scholarly font-bold uppercase tracking-wider">
              7-Day Grid
            </span>
          </div>
          <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
            Interactive visual schedule matrix with 30-minute snapping, direct drag & resize, and transit buffers.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1]">
            <button
              id="toggle-grid-view-btn"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif-scholarly font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                  : 'text-[#202820]/70 hover:text-[#173B2D]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>7-Day Grid</span>
            </button>
            <button
              id="toggle-agenda-view-btn"
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif-scholarly font-medium transition-all ${
                viewMode === 'agenda'
                  ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                  : 'text-[#202820]/70 hover:text-[#173B2D]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daily Agenda</span>
            </button>
          </div>

          {/* Time Span Range Toggle (Grid only) */}
          {viewMode === 'grid' && (
            <button
              id="toggle-time-range-btn"
              onClick={() =>
                setTimeRangeMode(timeRangeMode === 'standard' ? 'extended' : 'standard')
              }
              title="Toggle Core vs Extended Academic Hours"
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[11px] font-serif-scholarly text-[#173B2D] transition-colors"
            >
              {timeRangeMode === 'standard' ? '8am – 8pm' : '7am – 10pm'}
            </button>
          )}

          {/* Transit Settings Drawer Toggle */}
          <button
            id="toggle-transit-settings-btn"
            onClick={() => setIsEditingCommute(!isEditingCommute)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#B59A62]" />
            <span className="hidden sm:inline">Transit Settings</span>
          </button>

          {/* Add Commitment Action */}
          <button
            id="add-commitment-primary-btn"
            onClick={() => handleOpenCreateModal(selectedDay)}
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
          id="commute-settings-form"
          onSubmit={handleSaveCommute}
          className="parchment-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-[#B59A62] space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#E3DAC1] pb-2">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#8E7541]" />
              <h3 className="font-serif-scholarly text-sm font-bold text-[#173B2D]">
                Transit & Academic Commute Calibration
              </h3>
            </div>
            <span className="text-[11px] text-[#202820]/60 font-sans">
              Calculates automatic morning leave-by departure advisories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif-scholarly">
            <div>
              <label className="block text-[#173B2D] font-semibold mb-1">
                Target Institution or Campus
              </label>
              <input
                id="commute-institution-input"
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
                id="commute-travel-minutes-input"
                type="number"
                min="5"
                max="180"
                value={commuteForm.travelMinutes}
                onChange={(e) =>
                  setCommuteForm({
                    ...commuteForm,
                    travelMinutes: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
                required
              />
            </div>
            <div>
              <label className="block text-[#173B2D] font-semibold mb-1">
                Scholarly Preparation Buffer (Minutes)
              </label>
              <input
                id="commute-prep-buffer-input"
                type="number"
                min="0"
                max="60"
                value={commuteForm.prepBufferMinutes}
                onChange={(e) =>
                  setCommuteForm({
                    ...commuteForm,
                    prepBufferMinutes: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              id="cancel-commute-btn"
              type="button"
              onClick={() => setIsEditingCommute(false)}
              className="px-3 py-1 rounded-lg text-xs font-serif-scholarly text-[#202820]/70"
            >
              Cancel
            </button>
            <button
              id="submit-commute-btn"
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium flex items-center gap-1.5 hover:bg-[#122E23] transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Update Commute Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Transit Advisory Banner (If first commitment today exists) */}
      {todayLeaveBy && (
        <div
          id="today-transit-banner"
          className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7EE] border border-[#B59A62]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173B2D]/10 flex items-center justify-center shrink-0 border border-[#173B2D]/20">
              <Car className="w-4 h-4 text-[#173B2D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-scholarly text-xs font-bold text-[#173B2D]">
                  Transit to {commute.institution || 'Academy'}
                </span>
                <span
                  className={`text-[10px] font-serif-scholarly font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                    todayLeaveBy.urgency === 'depart_now'
                      ? 'bg-rose-100 text-rose-800'
                      : todayLeaveBy.urgency === 'approaching'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#173B2D]/10 text-[#173B2D]'
                  }`}
                >
                  {todayLeaveBy.urgency === 'depart_now'
                    ? 'Depart Immediately'
                    : todayLeaveBy.urgency === 'approaching'
                    ? 'Departure Imminent'
                    : 'On Schedule'}
                </span>
              </div>
              <p className="text-xs text-[#202820]/75 font-sans mt-0.5">
                First commitment today: <strong className="text-[#173B2D]">{todayLeaveBy.eventTitle}</strong> at{' '}
                {todayLeaveBy.eventStartFormatted}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:self-center pl-12 sm:pl-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-serif-scholarly text-[#8E7541] font-bold">
                Leave Sanctum By
              </div>
              <div className="font-serif-scholarly text-sm sm:text-base font-bold text-[#173B2D]">
                {todayLeaveBy.leaveByFormatted}
              </div>
            </div>
            <div className="text-[11px] text-[#202820]/60 font-sans border-l border-[#E3DAC1] pl-2.5">
              {commute.travelMinutes}m transit
              <br />+ {commute.prepBufferMinutes}m prep
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7-DAY TIMETABLE GRID MODE */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="parchment-card rounded-2xl p-4 sm:p-5 overflow-hidden">
          {/* Top Instruction & Legend Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3DAC1] mb-3 text-xs font-serif-scholarly gap-2">
            <div className="flex items-center gap-2 text-[#202820]/70">
              <Sparkles className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>
                <strong>Direct manipulation:</strong> Click empty slot to create • Drag block to reschedule • Drag right edge to resize duration.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#202820]/60 shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#173B2D]" />
                <span>Class</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8E7541]" />
                <span>Study</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B4C7E]" />
                <span>Assignment</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B263E]" />
                <span>Exam</span>
              </span>
            </div>
          </div>

          {/* Grid Container with Horizontal Scroll */}
          <div
            ref={gridContainerRef}
            id="timetable-scroll-viewport"
            className="overflow-x-auto select-none rounded-xl border border-[#E3DAC1] bg-[#FAF7EE] shadow-inner scrollbar-thin"
          >
            <div className="min-w-[840px] md:min-w-[1000px]">
              {/* Header Timeline Ruler */}
              <div className="flex border-b border-[#E3DAC1] bg-[#F4EEDC] sticky top-0 z-20">
                {/* Top-left corner spacer */}
                <div className="w-24 sm:w-28 shrink-0 border-r border-[#E3DAC1] p-2.5 text-center font-serif-scholarly text-[11px] font-bold text-[#8E7541] uppercase tracking-wider bg-[#F4EEDC] sticky left-0 z-30">
                  Day / Hour
                </div>

                {/* Hour Timeline Columns */}
                <div className="flex-1 flex relative">
                  {hourMarkers.map((hour) => {
                    const h12 = hour % 12 === 0 ? 12 : hour % 12;
                    const period = hour >= 12 ? 'PM' : 'AM';
                    return (
                      <div
                        key={hour}
                        className="flex-1 border-r border-[#E3DAC1]/60 px-1 py-2 text-center text-[10px] font-serif-scholarly font-semibold text-[#173B2D]/80"
                      >
                        {h12}:00 {period}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7 Day Rows */}
              <div className="divide-y divide-[#E3DAC1]/70">
                {DAYS.map((dayName, dayIndex) => {
                  const isToday = dayIndex === currentDayIndex;
                  const dayBlocks = schedule.filter((b) => b.dayOfWeek === dayIndex);

                  return (
                    <div
                      key={dayName}
                      className={`flex group/row transition-colors ${
                        isToday ? 'bg-[#B59A62]/6' : 'hover:bg-[#F6EFE2]/50'
                      }`}
                    >
                      {/* Sticky Day Label Column */}
                      <div
                        onClick={() => {
                          setSelectedDay(dayIndex);
                          setViewMode('agenda');
                        }}
                        title="Click to view detailed daily agenda"
                        className={`w-24 sm:w-28 shrink-0 p-3 border-r border-[#E3DAC1] flex flex-col justify-center cursor-pointer transition-colors sticky left-0 z-10 ${
                          isToday
                            ? 'bg-[#EFE8D3] border-r-[#B59A62]'
                            : 'bg-[#FAF7EE] group-hover/row:bg-[#F6EFE2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif-scholarly text-xs font-bold text-[#173B2D]">
                            {DAY_ABBRS[dayIndex]}
                          </span>
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-[#B59A62] animate-pulse" title="Today" />
                          )}
                        </div>
                        <span className="text-[10px] text-[#202820]/60 font-sans mt-0.5 truncate">
                          {dayName}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E3DAC1] text-[#202820] font-serif-scholarly font-medium">
                            {dayBlocks.length} {dayBlocks.length === 1 ? 'event' : 'events'}
                          </span>
                        </div>
                      </div>

                      {/* Day Time Track (Interactive Click + Drag Surface) */}
                      <div
                        ref={(el) => {
                          rowRefs.current[dayIndex] = el;
                        }}
                        onClick={(e) => handleGridRowClick(e, dayIndex)}
                        className="flex-1 relative h-20 sm:h-22 cursor-crosshair overflow-hidden"
                      >
                        {/* Background Vertical Guidelines (Hour & Half-Hour markers) */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {hourMarkers.map((h) => (
                            <div
                              key={h}
                              className="flex-1 flex border-r border-[#E3DAC1]/40"
                            >
                              <div className="flex-1 border-r border-[#E3DAC1]/20 border-dashed" />
                              <div className="flex-1" />
                            </div>
                          ))}
                        </div>

                        {/* Ghost Drop Position Indicator during Active Drag */}
                        {draggingBlock && draggingBlock.currentDay === dayIndex && (
                          <div
                            className="absolute top-1 bottom-1 rounded-xl border-2 border-dashed border-[#B59A62] bg-[#B59A62]/20 pointer-events-none z-10 transition-all duration-75 flex items-center justify-center text-[10px] font-serif-scholarly font-bold text-[#173B2D]"
                            style={{
                              left: `${
                                ((draggingBlock.currentStartMinutes - startMinutes) /
                                  totalMinutes) *
                                100
                              }%`,
                              width: `${
                                (draggingBlock.block.durationMinutes / totalMinutes) * 100
                              }%`,
                            }}
                          >
                            <span>
                              {formatMinutesToTime(draggingBlock.currentStartMinutes)}
                            </span>
                          </div>
                        )}

                        {/* Scheduled Commitment Blocks */}
                        {dayBlocks.map((block) => {
                          const isBeingDragged = draggingBlock?.block.id === block.id;
                          const isBeingResized = resizingBlock?.block.id === block.id;

                          // Compute effective position and duration
                          const effectiveStart =
                            isBeingDragged ? draggingBlock.currentStartMinutes : block.startMinutes;
                          const effectiveDuration =
                            isBeingResized ? resizingBlock.currentDuration : block.durationMinutes;

                          // Skip if block is outside displayed timeline
                          if (effectiveStart + effectiveDuration <= startMinutes || effectiveStart >= endMinutes) {
                            return null;
                          }

                          // Calculate percentage position
                          const leftPct =
                            ((effectiveStart - startMinutes) / totalMinutes) * 100;
                          const widthPct = (effectiveDuration / totalMinutes) * 100;

                          const course = courses.find((c) => c.id === block.courseId);
                          const blockColor = block.color || course?.color || '#173B2D';

                          return (
                            <div
                              key={block.id}
                              id={`schedule-block-${block.id}`}
                              onPointerDown={(e) => handleBlockPointerDown(e, block)}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isBeingDragged && !isBeingResized) {
                                  handleOpenEditModal(block);
                                }
                              }}
                              className={`absolute top-1 bottom-1 rounded-xl p-2 cursor-grab active:cursor-grabbing border shadow-xs transition-shadow flex flex-col justify-between overflow-hidden group ${
                                isBeingDragged ? 'opacity-40 scale-95' : 'hover:shadow-md'
                              }`}
                              style={{
                                left: `${Math.max(0, leftPct)}%`,
                                width: `${Math.max(2.5, widthPct)}%`,
                                backgroundColor: '#FFFDF7',
                                borderColor: blockColor,
                                borderLeftWidth: '5px',
                                borderLeftColor: blockColor,
                                zIndex: isBeingDragged || isBeingResized ? 30 : 5,
                              }}
                              title={`${block.title} (${formatMinutesToTime(
                                effectiveStart
                              )} - ${formatMinutesToTime(effectiveStart + effectiveDuration)})`}
                            >
                              {/* Top Bar: Title & Move Grip */}
                              <div className="flex items-start justify-between gap-1 overflow-hidden">
                                <span className="font-serif-scholarly font-bold text-xs text-[#173B2D] truncate leading-tight">
                                  {block.title}
                                </span>
                                <GripHorizontal className="w-3 h-3 text-[#202820]/35 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>

                              {/* Middle: Time & Course */}
                              <div className="flex items-center gap-1.5 text-[10px] text-[#8E7541] font-serif-scholarly font-medium leading-none truncate mt-0.5">
                                <span>
                                  {formatMinutesToTime(effectiveStart)} –{' '}
                                  {formatMinutesToTime(effectiveStart + effectiveDuration)}
                                </span>
                                {course && (
                                  <span className="hidden md:inline px-1 py-0.2 rounded bg-[#E3DAC1]/50 text-[#173B2D]">
                                    {course.code}
                                  </span>
                                )}
                              </div>

                              {/* Bottom: Location */}
                              {block.roomOrLocation && (
                                <div className="flex items-center gap-1 text-[9px] text-[#202820]/60 truncate mt-auto">
                                  <MapPin className="w-2.5 h-2.5 text-[#B59A62] shrink-0" />
                                  <span className="truncate">{block.roomOrLocation}</span>
                                </div>
                              )}

                              {/* Right Edge Resize Handle */}
                              <div
                                onPointerDown={(e) => handleResizePointerDown(e, block)}
                                onClick={(e) => e.stopPropagation()}
                                title="Drag to adjust duration"
                                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-[#B59A62]/30 active:bg-[#B59A62]/50 flex items-center justify-center transition-colors group-hover:opacity-100"
                              >
                                <div className="w-0.5 h-4 rounded-full bg-[#B59A62]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAILY DETAILED AGENDA VIEW MODE */}
      {/* ========================================================================= */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {DAYS.map((dayName, idx) => {
                const isSelected = selectedDay === idx;
                const isToday = idx === currentDayIndex;
                const dayBlocks = schedule.filter((b) => b.dayOfWeek === idx);

                return (
                  <button
                    key={dayName}
                    onClick={() => setSelectedDay(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-serif-scholarly whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#173B2D] text-[#F3EEDB] font-bold shadow-xs'
                        : 'bg-[#FAF7EE] text-[#202820]/70 hover:bg-[#EAE2C8] border border-[#E3DAC1]'
                    }`}
                  >
                    <span>{dayName}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B59A62]" title="Today" />
                    )}
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
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

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSelectedDay((prev) => (prev > 0 ? prev - 1 : 6))}
                className="p-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] hover:bg-[#EAE2C8]"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDay((prev) => (prev < 6 ? prev + 1 : 0))}
                className="p-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] hover:bg-[#EAE2C8]"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Agenda Card */}
          <div className="parchment-card rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1] mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8E7541]" />
                <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
                  {DAYS[selectedDay]} Scholarly Agenda
                </h3>
              </div>
              <button
                id="add-to-selected-day-btn"
                onClick={() => handleOpenCreateModal(selectedDay)}
                className="text-xs font-serif-scholarly text-[#8E7541] hover:text-[#173B2D] flex items-center gap-1 font-semibold"
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
                  <div className="text-center py-12 text-[#202820]/60">
                    <Clock className="w-10 h-10 mx-auto text-[#B59A62]/60 mb-2.5" />
                    <p className="font-serif-scholarly text-sm font-semibold text-[#173B2D]">
                      No academic commitments inscribed for {DAYS[selectedDay]}.
                    </p>
                    <p className="text-xs font-sans mt-0.5 max-w-sm mx-auto">
                      Enjoy uninterrupted contemplation or chart laboratory hours, lectures, and symposiums.
                    </p>
                    <button
                      onClick={() => handleOpenCreateModal(selectedDay)}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-semibold hover:bg-[#122E23] transition-colors"
                    >
                      Inscribe Event
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {dayBlocks.map((block) => {
                    const endMinutesCalc = block.startMinutes + block.durationMinutes;
                    const course = courses.find((c) => c.id === block.courseId);

                    return (
                      <div
                        key={block.id}
                        onClick={() => handleOpenEditModal(block)}
                        className="p-3.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] transition-all flex items-center justify-between group cursor-pointer"
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
                                {formatMinutesToTime(endMinutesCalc)} ({block.durationMinutes} min)
                              </span>
                            </div>
                            <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] mt-0.5">
                              {block.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[#202820]/65">
                              {course && <span className="font-medium">{course.code} • {course.name}</span>}
                              {block.roomOrLocation && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#B59A62]" />
                                  {block.roomOrLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(block);
                            }}
                            title="Edit commitment"
                            className="px-2.5 py-1 rounded-lg hover:bg-[#EAE2C8] text-xs font-serif-scholarly text-[#173B2D]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Expel "${block.title}" from the schedule?`)) {
                                onDeleteBlock(block.id);
                              }
                            }}
                            title="Expel commitment"
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 rotate-45" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Structured Create & Edit Modal */}
      <ScheduleBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={onDeleteBlock}
        initialBlock={modalInitialBlock}
        defaultDay={modalDefaultDay}
        defaultStartMinutes={modalDefaultStart}
        courses={courses}
      />
    </div>
  );
};

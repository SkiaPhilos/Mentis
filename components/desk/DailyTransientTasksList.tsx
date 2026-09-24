'use client';

import React, { useState } from 'react';
import { TransientTask, Course } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import { CheckSquare, Square, Plus, Trash2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { playClickTactile, playWaxSealStamp } from '@/lib/audio/soundEffects';

interface DailyTransientTasksListProps {
  tasks: TransientTask[];
  courses: Course[];
  onAddTask?: (task: TransientTask) => void;
  onToggleTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  onOpenQuickAdd?: () => void;
}

export const DailyTransientTasksList: React.FC<DailyTransientTasksListProps> = ({
  tasks,
  courses,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onOpenQuickAdd,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id: string) => {
    playWaxSealStamp();
    if (onToggleTask) {
      onToggleTask(id);
    } else {
      MentisRepository.toggleTask(id);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickTactile();
    if (onDeleteTask) {
      onDeleteTask(id);
    } else {
      MentisRepository.deleteTask(id);
    }
  };

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    playClickTactile();
    const newTask: TransientTask = {
      id: `task_${Date.now()}`,
      userId: 'scholar_usr_01',
      title: quickTitle.trim(),
      courseId: selectedCourse || undefined,
      completed: false,
      priority: 'standard',
      createdAt: new Date().toISOString(),
    };

    if (onAddTask) {
      onAddTask(newTask);
    } else {
      MentisRepository.addTask(newTask);
    }

    setQuickTitle('');
    setIsAddingInline(false);
  };

  return (
    <div className="parchment-card rounded-2xl p-5 sm:p-6 border border-[#E3DAC1] flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#173B2D] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D] leading-tight">
                Daily Scholar Quests & Tasks
              </h3>
              <p className="text-xs text-[#202820]/70 font-sans">
                Transient focus tasks for today’s vigil.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
              {completedCount} / {totalCount} Done
            </div>
            <div className="w-24 h-1.5 rounded-full bg-[#EAE2C8] overflow-hidden mt-1">
              <div
                className="h-full bg-[#173B2D] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task Item List */}
        <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-[#202820]/60 text-xs italic font-serif-scholarly">
              No transient tasks registered. Capture a study quest below.
            </div>
          ) : (
            tasks.map((task) => {
              const course = courses.find((c) => c.id === task.courseId);
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggle(task.id)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#FAF7EE]/50 border-[#E3DAC1]/60 opacity-65'
                      : 'bg-[#FAF7EE] border-[#E3DAC1] hover:border-[#B59A62]/70 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      className="mt-0.5 text-[#173B2D] hover:text-[#8E7541] transition-colors shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-[#173B2D]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#202820]/40 group-hover:text-[#173B2D]" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-serif-scholarly leading-snug break-words ${
                          task.completed
                            ? 'line-through text-[#202820]/50'
                            : 'font-semibold text-[#173B2D]'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {course && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-medium font-sans truncate max-w-36"
                            style={{
                              backgroundColor: `${course.color}20`,
                              color: course.color,
                            }}
                          >
                            {course.code || course.name}
                          </span>
                        )}

                        {task.priority === 'vigilant' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-[#8E7541]/20 text-[#8E7541] font-bold">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Vigilant</span>
                          </span>
                        )}

                        {task.dueTime && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-[#202820]/60">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{task.dueTime}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(task.id, e)}
                    title="Dismiss Task"
                    className="opacity-0 group-hover:opacity-100 text-[#202820]/40 hover:text-red-700 transition-opacity p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Inline Add Task Form */}
        {isAddingInline ? (
          <form onSubmit={handleInlineAdd} className="mt-3 p-3 rounded-xl bg-[#FAF7EE] border border-[#B59A62]/60 space-y-2">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="e.g. Derive Laplace Transform for Section 3..."
              autoFocus
              className="w-full text-xs font-serif-scholarly bg-transparent border-b border-[#E3DAC1] pb-1 focus:outline-hidden focus:border-[#173B2D] text-[#173B2D]"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="text-[11px] font-serif-scholarly bg-[#FAF7EE] border border-[#E3DAC1] rounded-lg px-2 py-0.5 text-[#173B2D]"
              >
                <option value="">General Quest</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddingInline(false)}
                  className="px-2 py-0.5 rounded text-[10px] text-[#202820]/60 hover:text-[#202820] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] text-[10px] font-serif-scholarly font-bold hover:bg-[#122E23] cursor-pointer"
                >
                  Add Quest
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-[#E3DAC1] flex items-center justify-between gap-2">
        <button
          onClick={() => setIsAddingInline(true)}
          className="inline-flex items-center gap-1 text-xs font-serif-scholarly font-semibold text-[#173B2D] hover:text-[#8E7541] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Quest</span>
        </button>

        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="text-[11px] font-serif-scholarly text-[#8E7541] hover:text-[#173B2D] transition-colors cursor-pointer"
          >
            Detailed Actions →
          </button>
        )}
      </div>
    </div>
  );
};

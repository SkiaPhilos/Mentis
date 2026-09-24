'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Note, Book, StudySessionLog } from '@/types/mentis';
import { Sparkles, TrendingUp, BookOpen, Scroll, Clock, BarChart2, Award } from 'lucide-react';

interface StudyVelocityChartProps {
  notes: Note[];
  books: Book[];
  studyLogs: StudySessionLog[];
}

type VelocityViewMode = 'activity' | 'time';

interface DayVelocityData {
  dayLabel: string;
  fullDate: string;
  notesCreated: number;
  booksProgressed: number;
  minutesStudied: number;
  sessionsLogged: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  viewMode: VelocityViewMode;
}

const CustomParchmentTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  viewMode,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#FAF7EE] border border-[#B59A62] shadow-md rounded-xl p-3 text-xs font-sans min-w-40">
      <div className="font-serif-scholarly font-bold text-sm text-[#173B2D] border-b border-[#E3DAC1] pb-1.5 mb-2">
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const isTime = viewMode === 'time';
          const formattedVal = isTime ? `${entry.value} mins` : entry.value;
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[#202820]/80">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="capitalize">{entry.name}:</span>
              </span>
              <span className="font-semibold text-[#173B2D] font-mono">{formattedVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const StudyVelocityChart: React.FC<StudyVelocityChartProps> = ({
  notes,
  books,
  studyLogs,
}) => {
  const [viewMode, setViewMode] = useState<VelocityViewMode>('activity');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Compute 7-day trailing velocity data
  const data: DayVelocityData[] = useMemo(() => {
    const days: DayVelocityData[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Notes created or updated on this day
      const notesCount = notes.filter((n) => {
        const createdDay = (n.createdAt || '').split('T')[0];
        const updatedDay = (n.updatedAt || '').split('T')[0];
        return createdDay === dateStr || updatedDay === dateStr;
      }).length;

      // Study logs recorded on this day
      const dayLogs = studyLogs.filter((log) => {
        const logDay = (log.timestamp || '').split('T')[0];
        return logDay === dateStr;
      });

      const minutesStudied = dayLogs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
      const sessionsLogged = dayLogs.length;

      // Books with progress on this day
      const booksCount = books.filter((b) => {
        if (!b.lastReadAt) return false;
        const readDay = b.lastReadAt.split('T')[0];
        return readDay === dateStr;
      }).length;

      days.push({
        dayLabel: dayName,
        fullDate,
        notesCreated: notesCount,
        booksProgressed: Math.max(booksCount, dayLogs.filter((l) => l.vigilType === 'reading').length),
        minutesStudied,
        sessionsLogged,
      });
    }

    return days;
  }, [notes, books, studyLogs]);

  // High-level statistics
  const totalNotesPastWeek = useMemo(
    () => data.reduce((sum, d) => sum + d.notesCreated, 0),
    [data]
  );
  const totalMinutesPastWeek = useMemo(
    () => data.reduce((sum, d) => sum + d.minutesStudied, 0),
    [data]
  );
  const totalSessionsPastWeek = useMemo(
    () => data.reduce((sum, d) => sum + d.sessionsLogged, 0),
    [data]
  );
  const activeDaysCount = useMemo(
    () => data.filter((d) => d.notesCreated > 0 || d.minutesStudied > 0 || d.booksProgressed > 0).length,
    [data]
  );
  const consistencyScore = Math.round((activeDaysCount / 7) * 100);

  return (
    <div className="parchment-card rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-[#E3DAC1]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DAC1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#173B2D] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D] leading-tight">
                Scholarly Study Velocity
              </h3>
              <p className="text-xs text-[#202820]/70 font-sans">
                Weekly pacing across manuscripts inscribed, books read, and study vigils.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#EAE2C8]/70 p-1 rounded-xl border border-[#E3DAC1]">
          <button
            onClick={() => setViewMode('activity')}
            className={`px-3 py-1 rounded-lg text-xs font-serif-scholarly font-semibold transition-all cursor-pointer ${
              viewMode === 'activity'
                ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                : 'text-[#173B2D]/70 hover:text-[#173B2D]'
            }`}
          >
            Inscriptions & Books
          </button>
          <button
            onClick={() => setViewMode('time')}
            className={`px-3 py-1 rounded-lg text-xs font-serif-scholarly font-semibold transition-all cursor-pointer ${
              viewMode === 'time'
                ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                : 'text-[#173B2D]/70 hover:text-[#173B2D]'
            }`}
          >
            Study Minutes
          </button>
          <button
            onClick={() => setChartType(chartType === 'bar' ? 'area' : 'bar')}
            title="Toggle Bar / Area Chart"
            className="p-1 rounded-lg hover:bg-[#FAF7EE] text-[#173B2D] transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-[#FAF7EE]/70 border border-[#E3DAC1]/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#173B2D]/10 text-[#173B2D] flex items-center justify-center shrink-0">
            <Scroll className="w-4 h-4 text-[#173B2D]" />
          </div>
          <div>
            <div className="font-serif-scholarly text-base font-bold text-[#173B2D]">
              {totalNotesPastWeek}
            </div>
            <div className="text-[10px] text-[#202820]/60 uppercase tracking-wider font-medium">
              Notes Inscribed
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF7EE]/70 border border-[#E3DAC1]/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#B59A62]/15 text-[#8E7541] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[#8E7541]" />
          </div>
          <div>
            <div className="font-serif-scholarly text-base font-bold text-[#173B2D]">
              {Math.round((totalMinutesPastWeek / 60) * 10) / 10} hrs
            </div>
            <div className="text-[10px] text-[#202820]/60 uppercase tracking-wider font-medium">
              Time Studied
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF7EE]/70 border border-[#E3DAC1]/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2C5E4B]/15 text-[#2C5E4B] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#2C5E4B]" />
          </div>
          <div>
            <div className="font-serif-scholarly text-base font-bold text-[#173B2D]">
              {totalSessionsPastWeek}
            </div>
            <div className="text-[10px] text-[#202820]/60 uppercase tracking-wider font-medium">
              Vigils Logged
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF7EE]/70 border border-[#E3DAC1]/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#B59A62]/20 text-[#8E7541] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-[#B59A62]" />
          </div>
          <div>
            <div className="font-serif-scholarly text-base font-bold text-[#173B2D] flex items-center gap-1">
              <span>{consistencyScore}%</span>
              <Sparkles className="w-3 h-3 text-[#B59A62]" />
            </div>
            <div className="text-[10px] text-[#202820]/60 uppercase tracking-wider font-medium">
              7-Day Cadence
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-60 sm:h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3DAC1" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#202820"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E3DAC1' }}
              />
              <YAxis
                stroke="#202820"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomParchmentTooltip viewMode={viewMode} />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px', fontFamily: 'serif' }}
              />
              {viewMode === 'activity' ? (
                <>
                  <Bar
                    name="Manuscripts Inscribed"
                    dataKey="notesCreated"
                    fill="#173B2D"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    name="Books Progressed"
                    dataKey="booksProgressed"
                    fill="#B59A62"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </>
              ) : (
                <Bar
                  name="Study Minutes"
                  dataKey="minutesStudied"
                  fill="#2C5E4B"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#173B2D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#173B2D" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B59A62" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#B59A62" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3DAC1" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#202820"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E3DAC1' }}
              />
              <YAxis
                stroke="#202820"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomParchmentTooltip viewMode={viewMode} />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px', fontFamily: 'serif' }}
              />
              {viewMode === 'activity' ? (
                <>
                  <Area
                    type="monotone"
                    name="Manuscripts Inscribed"
                    dataKey="notesCreated"
                    stroke="#173B2D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#forestGrad)"
                  />
                  <Area
                    type="monotone"
                    name="Books Progressed"
                    dataKey="booksProgressed"
                    stroke="#B59A62"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#goldGrad)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  name="Study Minutes"
                  dataKey="minutesStudied"
                  stroke="#2C5E4B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#forestGrad)"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E3DAC1] flex items-center justify-between text-xs text-[#202820]/70 font-sans">
        <span className="italic">
          {consistencyScore >= 70
            ? '✨ Exceptional scholarly cadence maintained this week.'
            : '🌱 Deepen consistency with daily 25-minute reading or problem vigils.'}
        </span>
        <span className="font-serif-scholarly font-medium text-[#173B2D]">
          {activeDaysCount} of 7 days active
        </span>
      </div>
    </div>
  );
};

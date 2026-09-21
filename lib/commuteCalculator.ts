import { ScheduleBlock, CommuteProfile } from '@/types/mentis';

export interface LeaveByCalculation {
  eventTitle: string;
  courseId?: string;
  roomOrLocation?: string;
  eventStartMinutes: number; // e.g. 510 = 8:30 AM
  travelMinutes: number;
  prepBufferMinutes: number;
  totalLeadMinutes: number;
  leaveByMinutes: number; // eventStartMinutes - travelMinutes - prepBufferMinutes
  leaveByFormatted: string; // e.g. "07:33 AM"
  eventStartFormatted: string; // e.g. "08:30 AM"
  minutesUntilDeparture: number; // relative to current time of day
  urgency: 'calm' | 'approaching' | 'depart_now' | 'departed';
}

// Convert minutes of day (0-1439) to 12-hour formatted time (e.g. "08:30 AM")
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutePad = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${minutePad} ${period}`;
}

export function calculateLeaveBy(
  nextClass: ScheduleBlock,
  commute: CommuteProfile,
  currentDayMinutes?: number
): LeaveByCalculation {
  const travelMinutes = commute.travelMinutes || 30;
  const prepBufferMinutes = commute.prepBufferMinutes || 15;
  const totalLeadMinutes = travelMinutes + prepBufferMinutes;

  const eventStartMinutes = nextClass.startMinutes;
  const leaveByMinutes = eventStartMinutes - totalLeadMinutes;

  // Calculate current minutes if not supplied
  const now = new Date();
  const currentMinutes =
    currentDayMinutes !== undefined
      ? currentDayMinutes
      : now.getHours() * 60 + now.getMinutes();

  const minutesUntilDeparture = leaveByMinutes - currentMinutes;

  let urgency: LeaveByCalculation['urgency'] = 'calm';
  if (minutesUntilDeparture < 0) {
    urgency = 'departed';
  } else if (minutesUntilDeparture <= 10) {
    urgency = 'depart_now';
  } else if (minutesUntilDeparture <= 35) {
    urgency = 'approaching';
  }

  return {
    eventTitle: nextClass.title,
    courseId: nextClass.courseId,
    roomOrLocation: nextClass.roomOrLocation,
    eventStartMinutes,
    travelMinutes,
    prepBufferMinutes,
    totalLeadMinutes,
    leaveByMinutes,
    leaveByFormatted: formatMinutesToTime(leaveByMinutes),
    eventStartFormatted: formatMinutesToTime(eventStartMinutes),
    minutesUntilDeparture,
    urgency,
  };
}

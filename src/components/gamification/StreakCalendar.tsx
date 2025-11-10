import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Trophy } from 'lucide-react';

interface ActivityDay {
  date: Date;
  hasActivity: boolean;
  activityCount: number;
  xp: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface StreakCalendarProps {
  activeDates: Date[];
  currentStreak: number;
  longestStreak?: number;
  className?: string;
}

export function StreakCalendar({
  activeDates,
  currentStreak,
  longestStreak = 0,
  className = '',
}: StreakCalendarProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const activeDatesSet = new Set(
    activeDates.map((d) => d.toISOString().split('T')[0])
  );

  const days: ActivityDay[] = [];
  const daysInMonth = lastDayOfMonth.getDate();

  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1);
    days.push({
      date: prevMonthDay,
      hasActivity: false,
      activityCount: 0,
      xp: 0,
      isToday: false,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    days.push({
      date,
      hasActivity: activeDatesSet.has(dateStr),
      activityCount: activeDatesSet.has(dateStr) ? 1 : 0,
      xp: 0,
      isToday,
      isCurrentMonth: true,
    });
  }

  const weekDays = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  const isStreakMilestone = (streak: number) => {
    return [7, 14, 21, 30, 60, 90].includes(streak);
  };

  return (
    <div className={`bg-white dark:bg-[var(--color-surface)] rounded-2xl p-6 shadow-lg border-2 border-[var(--color-border)] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[var(--ff-color-accent-600)]" />
            Streak Calendar
          </h4>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Flame className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
            <span className="text-2xl font-bold text-[var(--color-text)]">
              {currentStreak}
            </span>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {currentStreak === 1 ? 'dag' : 'dagen'} streak
          </p>
          {longestStreak > 0 && longestStreak > currentStreak && (
            <p className="text-xs text-[var(--ff-color-accent-600)] mt-1 flex items-center justify-end gap-1">
              <Trophy className="w-3 h-3" />
              Record: {longestStreak}
            </p>
          )}
        </div>
      </div>

      {isStreakMilestone(currentStreak) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-xl border border-[var(--ff-color-primary-300)]"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
            <span className="text-sm font-bold text-[var(--color-text)]">
              Mijlpaal bereikt: {currentStreak} dagen!
            </span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[var(--color-muted)] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <CalendarDay key={index} day={day} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-600)]" />
              <span className="text-[var(--color-muted)]">Actief</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-[var(--color-border)]" />
              <span className="text-[var(--color-muted)]">Inactief</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[var(--ff-color-primary-600)]">
            <div className="w-3 h-3 rounded-full ring-2 ring-[var(--ff-color-primary-500)] ring-offset-2 bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-600)]" />
            <span className="font-semibold">Vandaag</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarDay({ day }: { day: ActivityDay }) {
  const dayNumber = day.date.getDate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        aspect-square flex items-center justify-center rounded-lg text-sm font-medium
        transition-all
        ${!day.isCurrentMonth ? 'text-[var(--color-muted)] opacity-30' : ''}
        ${day.isToday ? 'ring-2 ring-[var(--ff-color-primary-500)] ring-offset-2' : ''}
        ${day.hasActivity && day.isCurrentMonth
          ? 'bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-600)] text-white shadow-md hover-scale'
          : day.isCurrentMonth
          ? 'bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)]'
          : 'bg-transparent'
        }
      `}
      whileHover={day.isCurrentMonth ? { scale: 1.1 } : {}}
      title={
        day.hasActivity && day.isCurrentMonth
          ? `${dayNumber} ${day.isToday ? '(Vandaag) ' : ''}✓ Actief`
          : day.isToday
          ? `${dayNumber} (Vandaag)`
          : undefined
      }
    >
      {day.hasActivity && day.isCurrentMonth ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : day.isCurrentMonth ? (
        <span>{dayNumber}</span>
      ) : (
        <span className="opacity-50">{dayNumber}</span>
      )}
    </motion.div>
  );
}

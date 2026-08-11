'use client';

import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Booking } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BookingCalendar({
  bookings,
  selectedDate,
  onSelectDate,
  onBook,
}: {
  bookings: Booking[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onBook: () => void;
}) {
  const [month, setMonth] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      const key = format(new Date(b.startTime), 'yyyy-MM-dd');
      (map[key] ||= []).push(b);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return map;
  }, [bookings]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const list: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      list.push(d);
      d = addDays(d, 1);
    }
    return list;
  }, [month]);

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div>
      <div className="mb-3 flex items-center justify-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="w-44 text-center text-lg font-semibold">{format(month, 'MMMM yyyy')}</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onBook} className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" /> Book {format(new Date(`${selectedDate}T12:00:00`), 'MMM d')}
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-muted/50 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {w}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDate[key] ?? [];
          const inMonth = key.slice(0, 7) === format(month, 'yyyy-MM');
          const isSelected = key === selectedDate;
          const isToday = key === today;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={cn(
                'flex min-h-[92px] flex-col items-start gap-1 bg-card p-1.5 text-left transition-colors hover:bg-accent',
                !inMonth && 'bg-muted/30 text-muted-foreground/60',
                isSelected && 'ring-2 ring-primary ring-inset',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday && 'bg-primary text-primary-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="w-full space-y-1">
                {dayBookings.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[11px] leading-tight"
                  >
                    <span className="font-semibold">
                      {format(new Date(b.startTime), 'h:mm')}–{format(new Date(b.endTime), 'h:mm')}
                    </span>{' '}
                    <span className="text-muted-foreground">{b.companyName}</span>
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="px-1 text-[11px] text-muted-foreground">
                    +{dayBookings.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <Button onClick={onBook} className="mt-3 w-full sm:hidden">
        <Plus className="h-4 w-4" /> Book {format(new Date(`${selectedDate}T12:00:00`), 'MMM d')}
      </Button>
    </div>
  );
}

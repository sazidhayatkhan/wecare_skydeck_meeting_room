'use client';

import { useEffect, useState } from 'react';
import { format, isAfter } from 'date-fns';
import { toast } from 'sonner';
import { CalendarClock, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Booking } from '@/lib/types';

export function BookingsList({
  currentUserId,
  refreshKey,
  onChanged,
}: {
  currentUserId: string;
  refreshKey: number;
  onChanged: () => void;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getAllBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const upcoming = bookings
    .filter((b) => isAfter(new Date(b.endTime), new Date()))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      toast.success('Booking cancelled');
      onChanged();
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel booking');
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading bookings…</p>;
  }

  if (upcoming.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No upcoming bookings yet. Book a slot above to see it here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((b) => (
        <Card key={b.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{b.companyName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {format(new Date(b.startTime), 'MMM d, h:mm a')} –{' '}
                  {format(new Date(b.endTime), 'h:mm a')}
                </span>
              </div>
            </div>
            {b.userId === currentUserId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancel(b.id)}
                disabled={cancellingId === b.id}
                aria-label="Cancel booking"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

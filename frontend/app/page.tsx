'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Building2, DoorOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthScreen } from '@/components/auth-screen';
import { BookingCalendar } from '@/components/booking-calendar';
import { BookingDialog } from '@/components/booking-dialog';
import { BookingsList } from '@/components/bookings-list';
import { ThemePicker } from '@/components/theme-picker';
import { applyTheme } from '@/lib/themes';
import { api, clearToken, getToken } from '@/lib/api';
import { Booking, User } from '@/lib/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!getToken()) {
      setAuthLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => {
        setUser(user);
        applyTheme(user.theme);
      })
      .catch(() => clearToken())
      .finally(() => setAuthLoading(false));
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  function handleAuthed(user: User) {
    setUser(user);
    applyTheme(user.theme);
  }

  async function handleThemeChange(theme: string) {
    applyTheme(theme);
    setUser((u) => (u ? { ...u, theme } : u));
    try {
      const { user } = await api.updateTheme(theme);
      setUser(user);
    } catch {
      // theme still applies locally even if the save fails
    }
  }

  useEffect(() => {
    api
      .getAllBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [refreshKey]);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore — token gets cleared regardless
    }
    clearToken();
    setUser(null);
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />;
  }

  return (
    <main className="container max-w-7xl py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DoorOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meeting Room</h1>
            <p className="text-sm text-muted-foreground">
              Shared office — see who&apos;s booked and grab a free slot.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" /> {user.companyName}
          </span>
          <ThemePicker value={user.theme} onChange={handleThemeChange} />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <BookingCalendar
            bookings={bookings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onBook={() => setDialogOpen(true)}
          />
        </section>

        <aside>
          <h2 className="mb-4 text-lg font-semibold">Upcoming bookings</h2>
          <BookingsList currentUserId={user.id} refreshKey={refreshKey} onChanged={refresh} />
        </aside>
      </div>

      <BookingDialog
        date={selectedDate}
        companyName={user.companyName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onBooked={refresh}
      />
    </main>
  );
}

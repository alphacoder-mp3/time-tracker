'use client';

import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchTimeEntries, deleteTimeEntry, updateTimeEntry } from '@/lib/api';
import { format } from 'date-fns';
import { useTimeEntriesCategories } from '@/hooks/use-time-entries-categories';
import { TimeEntry } from '@/types';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { EditTimeEntryDialog } from '@/components/edit-time-entry-dialog';
import { DeleteTimeEntryDialog } from '@/components/delete-time-entry-dialog';
import { hasTimeOverlap } from '@/lib/utils';

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { timeEntries, categories, setTimeEntries } =
    useTimeEntriesCategories();
  const [timeEntryToEdit, setTimeEntryToEdit] = useState<TimeEntry | null>(
    null
  );
  const [timeEntryToDelete, setTimeEntryToDelete] = useState<TimeEntry | null>(
    null
  );

  const getDayEntries = (day: Date) => {
    return timeEntries.filter(
      entry =>
        format(new Date(entry.startTime), 'yyyy-MM-dd') ===
        format(day, 'yyyy-MM-dd')
    );
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId);
      setTimeEntries(entries => entries.filter(e => e.id !== entryId));
      toast.success('Time entry deleted successfully');
      setTimeEntryToDelete(null);
    } catch (error) {
      console.error({ error });
      toast.error('Failed to delete time entry');
    }
  };

  const handleEditEntry = async (
    entryId: string,
    updatedData: {
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      categoryId: string;
    }
  ) => {
    try {
      // Check for time overlap
      if (
        hasTimeOverlap(
          timeEntries,
          updatedData.startTime,
          updatedData.endTime,
          entryId
        )
      ) {
        toast.error(
          'This time slot overlaps with an existing entry. Please choose a different time.'
        );
        return;
      }

      await updateTimeEntry(entryId, updatedData);
      const updatedEntries = await fetchTimeEntries();
      setTimeEntries(updatedEntries);
      setTimeEntryToEdit(null);
      toast.success('Time entry updated successfully');
    } catch (error) {
      console.error({ error });
      toast.error('Failed to update time entry');
    }
  };

  const selectedDayEntries = date ? getDayEntries(date) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow flex justify-center"
        />
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
        </h2>
        <div className="space-y-4 overflow-y-auto sm:h-[calc(100svh-10rem)]">
          {selectedDayEntries.map(entry => {
            const category = categories.find(c => c.id === entry.categoryId);
            return (
              <div key={entry.id} className="p-4 rounded-lg bg-accent/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.startTime), 'h:mm a')} -{' '}
                      {format(new Date(entry.endTime), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <span className="text-sm font-medium">
                      {category?.name}
                    </span>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTimeEntryToEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTimeEntryToDelete(entry)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
                {entry.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                )}
              </div>
            );
          })}
          {selectedDayEntries.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No entries for this date
            </p>
          )}
        </div>
      </Card>

      {timeEntryToEdit && (
        <EditTimeEntryDialog
          timeEntry={timeEntryToEdit}
          isOpen={!!timeEntryToEdit}
          onClose={() => setTimeEntryToEdit(null)}
          onConfirm={updatedData =>
            handleEditEntry(timeEntryToEdit.id, updatedData)
          }
        />
      )}

      {timeEntryToDelete && (
        <DeleteTimeEntryDialog
          timeEntry={timeEntryToDelete}
          isOpen={!!timeEntryToDelete}
          onClose={() => setTimeEntryToDelete(null)}
          onConfirm={() => handleDeleteEntry(timeEntryToDelete.id)}
        />
      )}
    </div>
  );
}

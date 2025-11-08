import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, MapPin, Users, Play, CheckCircle } from 'lucide-react';
import type { TimetableEntry, ClassSession } from '../../types';
import api from '../../services/api';

// 2. UPDATE THE PROPS
interface TodayScheduleProps {
  classes: TimetableEntry[]; // Renamed from ClassSession[]
  activeSession: ClassSession | null;
  onStartSession: (session: TimetableEntry) => Promise<void> | void; // Uses TimetableEntry
}

export function TodaySchedule({ classes, activeSession, onStartSession }: TodayScheduleProps) {
  // track ongoing session status per timetable id
  const [ongoingMap, setOngoingMap] = useState<Record<string, boolean>>({});

  // Fetch ongoing session status for visible classes
  useEffect(() => {
    let mounted = true;
    const fetchStatuses = async () => {
      const map: Record<string, boolean> = {};
      await Promise.all(
        classes.map(async (c) => {
          try {
            const res = await api.get(`/classes/${c._id}/session`);
            // 200 -> there's a session
            map[c._id] = !!res.data;
          } catch (err: any) {
            // 404 -> no ongoing session
            map[c._id] = false;
          }
        })
      );
      if (mounted) setOngoingMap(map);
    };

    if (classes && classes.length > 0) fetchStatuses();
    return () => {
      mounted = false;
    };
  }, [classes]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
        <CardDescription>Your classes for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* 3. CHECK IF CLASSES ARRAY IS EMPTY */}
          {classes.length === 0 && (
            <p className="p-4 text-center text-gray-500">You have no classes scheduled.</p>
          )}

          {/* 4. MAP OVER THE REAL DATA ('classes' prop) */}
          {classes.map((classEntry) => {
            // 5. UPDATE 'isActive' LOGIC
            // We check if the active session's timetable ID matches this class entry's ID
            const isActive = activeSession?.timetableEntry === classEntry._id;
            
            return (
              <div
                key={classEntry._id} // Use backend ID
                className={`p-4 rounded-lg border-2 ${
                  isActive
                    ? 'bg-blue-50 border-blue-300'
                    // We only show 'upcoming' or 'active' on the schedule
                    : 'bg-white border-gray-200' 
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {/* 6. UPDATE DATA FIELDS */}
                    <h4 className="text-lg mb-1">{classEntry.subject} ({classEntry.subjectCode})</h4>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {classEntry.startTime} - {classEntry.endTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Room {classEntry.classroom}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        {classEntry.department} - Sem {classEntry.semester} - Sec {classEntry.section}
                      </div>
                      {/* We remove 'studentsEnrolled' as it's not in this model */}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* 7. UPDATE BADGE LOGIC */}
                    {isActive ? (
                      <Badge className="bg-blue-600">
                        <Play className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 8. UPDATE BUTTON LOGIC */}
                {!isActive && (
                  <Button
                    onClick={() => onStartSession(classEntry)}
                    className="w-full mt-2"
                    // Disable if any session is active globally, or if this class already has an ongoing session
                    disabled={!!activeSession || !!ongoingMap[classEntry._id]}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {ongoingMap[classEntry._id] ? 'Session already ongoing' : 'Start Class Session'}
                  </Button>
                )}

                {isActive && (
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-900 text-center">
                      Session is currently active. Go to "Active Session" tab to manage.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
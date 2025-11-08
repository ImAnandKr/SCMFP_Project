import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, MapPin, User, AlertCircle, CheckCircle } from 'lucide-react';
import type { TimetableEntry } from '../../types';

interface ClassSchedule {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  timeSlot: string;
  status: 'ongoing' | 'upcoming' | 'completed' | 'cancelled';
  attended?: boolean;
}

export function StudentTimetable({ timetableData }: { timetableData?: TimetableEntry[] }) {
  // If timetableData is passed from the parent, map it into our local ClassSchedule shape
  const todaySchedule: ClassSchedule[] = (timetableData && timetableData.length > 0)
    ? timetableData.map((t, i) => ({
        id: t._id || String(i),
        subject: t.subject || t.subjectCode || 'Unknown',
        faculty: (typeof t.faculty === 'string') ? t.faculty : (t.faculty?.name || 'TBD'),
        room: t.classroom || 'TBD',
        timeSlot: (t.startTime && t.endTime) ? `${t.startTime} - ${t.endTime}` : 'TBD',
        status: 'upcoming',
        attended: false
      }))
    : [
    {
      id: '1',
      subject: 'Data Structures',
      faculty: 'Prof. Rajesh Sharma',
      room: '101',
      timeSlot: '9:00 - 10:00 AM',
      status: 'completed',
      attended: true
    },
    {
      id: '2',
      subject: 'Machine Learning',
      faculty: 'Dr. Priya Kumar',
      room: '204',
      timeSlot: '10:00 - 11:00 AM',
      status: 'ongoing',
      attended: true
    },
    {
      id: '3',
      subject: 'Cloud Computing',
      faculty: 'Dr. Sunita Reddy',
      room: '401',
      timeSlot: '11:00 - 12:00 PM',
      status: 'upcoming',
      attended: false
    },
    {
      id: '4',
      subject: 'Web Development',
      faculty: 'Prof. Karthik Reddy',
      room: '102',
      timeSlot: '2:00 - 3:00 PM',
      status: 'upcoming',
      attended: false
    },
    {
      id: '5',
      subject: 'Database Systems',
      faculty: 'Prof. Venkat Rao',
      room: '105',
      timeSlot: '3:00 - 4:00 PM',
      status: 'upcoming',
      attended: false
    }
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6">
      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            {currentDay}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaySchedule.map((classItem) => (
              <div
                key={classItem.id}
                className={`p-4 rounded-lg border-2 ${
                  classItem.status === 'ongoing'
                    ? 'bg-blue-50 border-blue-300'
                    : classItem.status === 'completed'
                    ? 'bg-gray-50 border-gray-200'
                    : classItem.status === 'cancelled'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-lg mb-1">{classItem.subject}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {classItem.faculty}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Room {classItem.room}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {classItem.timeSlot}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {classItem.status === 'ongoing' && (
                      <Badge className="bg-blue-600">
                        ● Ongoing
                      </Badge>
                    )}
                    {classItem.status === 'completed' && (
                      <Badge variant="secondary">
                        Completed
                      </Badge>
                    )}
                    {classItem.status === 'upcoming' && (
                      <Badge variant="outline">
                        Upcoming
                      </Badge>
                    )}
                    {classItem.status === 'cancelled' && (
                      <Badge className="bg-red-600">
                        Cancelled
                      </Badge>
                    )}
                    
                    {classItem.attended && (
                      <div className="flex items-center gap-1 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Attended
                      </div>
                    )}
                    {!classItem.attended && classItem.status === 'completed' && (
                      <div className="flex items-center gap-1 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        Absent
                      </div>
                    )}
                  </div>
                </div>

                {classItem.status === 'ongoing' && (
                  <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-900 text-center">
                    Class is in progress. Mark your attendance now!
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>Your class schedule for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekDays.map((day, idx) => (
              <div key={day} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm">
                    {day}
                    {day === currentDay && (
                      <Badge variant="outline" className="ml-2 text-xs">Today</Badge>
                    )}
                  </h4>
                  <span className="text-xs text-gray-600">5 classes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['DS', 'ML', 'CC', 'WD', 'DBMS'].map((subject, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

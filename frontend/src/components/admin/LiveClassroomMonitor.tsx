import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Search, Users, MapPin, Clock, CheckCircle, Circle } from 'lucide-react';

interface ClassSession {
  id: string;
  room: string;
  building: string;
  subject: string;
  faculty: string;
  department: string;
  timeSlot: string;
  status: 'active' | 'vacant' | 'scheduled';
  studentsPresent: number;
  totalStudents: number;
  startedAt?: string;
}

export function LiveClassroomMonitor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  useEffect(() => {
    // Mock classroom sessions
    const mockSessions: ClassSession[] = [
      {
        id: '1',
        room: '101',
        building: 'CSE Block A',
        subject: 'Data Structures',
        faculty: 'Prof. Rajesh Sharma',
        department: 'CSE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'active',
        studentsPresent: 58,
        totalStudents: 60,
        startedAt: '10:02 AM'
      },
      {
        id: '2',
        room: '204',
        building: 'CSE Block B',
        subject: 'Machine Learning',
        faculty: 'Dr. Priya Kumar',
        department: 'CSE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'active',
        studentsPresent: 45,
        totalStudents: 50,
        startedAt: '10:00 AM'
      },
      {
        id: '3',
        room: '305',
        building: 'ECE Block',
        subject: 'Digital Electronics',
        faculty: 'Prof. Amit Singh',
        department: 'ECE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'active',
        studentsPresent: 52,
        totalStudents: 55,
        startedAt: '10:05 AM'
      },
      {
        id: '4',
        room: '102',
        building: 'CSE Block A',
        subject: 'Web Development',
        faculty: 'Not Started',
        department: 'CSE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'scheduled',
        studentsPresent: 0,
        totalStudents: 48,
      },
      {
        id: '5',
        room: '210',
        building: 'Mech Block',
        subject: '',
        faculty: '',
        department: '',
        timeSlot: 'Available',
        status: 'vacant',
        studentsPresent: 0,
        totalStudents: 0,
      },
      {
        id: '6',
        room: '401',
        building: 'CSE Block C',
        subject: 'Cloud Computing',
        faculty: 'Dr. Sunita Reddy',
        department: 'CSE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'active',
        studentsPresent: 40,
        totalStudents: 45,
        startedAt: '10:01 AM'
      },
      {
        id: '7',
        room: '105',
        building: 'CSE Block A',
        subject: 'Database Systems',
        faculty: 'Prof. Venkat Rao',
        department: 'CSE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'active',
        studentsPresent: 55,
        totalStudents: 58,
        startedAt: '10:03 AM'
      },
      {
        id: '8',
        room: '201',
        building: 'ECE Block',
        subject: 'Signal Processing',
        faculty: 'Dr. Lakshmi Devi',
        department: 'ECE',
        timeSlot: '10:00 - 11:00 AM',
        status: 'active',
        studentsPresent: 38,
        totalStudents: 42,
        startedAt: '10:00 AM'
      },
    ];

    setSessions(mockSessions);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSessions(prev => prev.map(session => {
        if (session.status === 'active' && Math.random() > 0.7) {
          return {
            ...session,
            studentsPresent: Math.min(
              session.studentsPresent + Math.floor(Math.random() * 2),
              session.totalStudents
            )
          };
        }
        return session;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter(session => 
    session.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const vacantCount = sessions.filter(s => s.status === 'vacant').length;
  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{activeCount}</span>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Vacant Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{vacantCount}</span>
              <Circle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Scheduled (Not Started)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{scheduledCount}</span>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>Live Classroom Status</CardTitle>
          <CardDescription>Real-time monitoring of all classrooms</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by room, subject, faculty, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border-2 ${
                  session.status === 'active'
                    ? 'bg-green-50 border-green-200'
                    : session.status === 'scheduled'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">
                        Room {session.room}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">{session.building}</p>
                  </div>
                  <Badge
                    variant={
                      session.status === 'active'
                        ? 'default'
                        : session.status === 'scheduled'
                        ? 'outline'
                        : 'secondary'
                    }
                    className={
                      session.status === 'active'
                        ? 'bg-green-600'
                        : session.status === 'scheduled'
                        ? 'border-orange-600 text-orange-600'
                        : ''
                    }
                  >
                    {session.status === 'active' && '● Live'}
                    {session.status === 'scheduled' && 'Scheduled'}
                    {session.status === 'vacant' && 'Vacant'}
                  </Badge>
                </div>

                {session.status !== 'vacant' && (
                  <>
                    <h4 className="text-sm mb-2">{session.subject}</h4>
                    <p className="text-xs text-gray-600 mb-3">{session.faculty}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Clock className="w-3 h-3" />
                      {session.timeSlot}
                      {session.startedAt && (
                        <span className="text-green-700">• Started {session.startedAt}</span>
                      )}
                    </div>

                    {session.status === 'active' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-600" />
                            <span className="text-xs text-gray-600">Attendance</span>
                          </div>
                          <span className="text-xs">
                            {session.studentsPresent}/{session.totalStudents}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(session.studentsPresent / session.totalStudents) * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.round((session.studentsPresent / session.totalStudents) * 100)}% present
                        </p>
                      </div>
                    )}
                  </>
                )}

                {session.status === 'vacant' && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Available for booking
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

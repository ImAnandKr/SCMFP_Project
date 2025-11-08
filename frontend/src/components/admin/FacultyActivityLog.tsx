import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Search, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface FacultyActivity {
  id: string;
  facultyName: string;
  employeeId: string;
  department: string;
  subject: string;
  room: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: 'on-time' | 'late' | 'ongoing' | 'not-started' | 'completed';
  attendanceMarked: boolean;
  studentsPresent?: number;
  totalStudents?: number;
}

export function FacultyActivityLog() {
  const [searchQuery, setSearchQuery] = useState('');

  const activities: FacultyActivity[] = [
    {
      id: '1',
      facultyName: 'Prof. Rajesh Sharma',
      employeeId: 'FAC001',
      department: 'CSE',
      subject: 'Data Structures',
      room: '101',
      scheduledTime: '10:00 AM',
      actualStartTime: '10:02 AM',
      status: 'ongoing',
      attendanceMarked: true,
      studentsPresent: 58,
      totalStudents: 60
    },
    {
      id: '2',
      facultyName: 'Dr. Priya Kumar',
      employeeId: 'FAC002',
      department: 'CSE',
      subject: 'Machine Learning',
      room: '204',
      scheduledTime: '10:00 AM',
      actualStartTime: '10:00 AM',
      status: 'on-time',
      attendanceMarked: true,
      studentsPresent: 45,
      totalStudents: 50
    },
    {
      id: '3',
      facultyName: 'Prof. Amit Singh',
      employeeId: 'FAC003',
      department: 'ECE',
      subject: 'Digital Electronics',
      room: '305',
      scheduledTime: '10:00 AM',
      actualStartTime: '10:05 AM',
      status: 'late',
      attendanceMarked: true,
      studentsPresent: 52,
      totalStudents: 55
    },
    {
      id: '4',
      facultyName: 'Dr. Sunita Reddy',
      employeeId: 'FAC004',
      department: 'CSE',
      subject: 'Cloud Computing',
      room: '401',
      scheduledTime: '10:00 AM',
      actualStartTime: '10:01 AM',
      status: 'ongoing',
      attendanceMarked: true,
      studentsPresent: 40,
      totalStudents: 45
    },
    {
      id: '5',
      facultyName: 'Prof. Venkat Rao',
      employeeId: 'FAC005',
      department: 'CSE',
      subject: 'Database Systems',
      room: '105',
      scheduledTime: '10:00 AM',
      actualStartTime: '10:03 AM',
      status: 'ongoing',
      attendanceMarked: true,
      studentsPresent: 55,
      totalStudents: 58
    },
    {
      id: '6',
      facultyName: 'Dr. Lakshmi Devi',
      employeeId: 'FAC006',
      department: 'ECE',
      subject: 'Signal Processing',
      room: '201',
      scheduledTime: '10:00 AM',
      actualStartTime: '10:00 AM',
      status: 'on-time',
      attendanceMarked: true,
      studentsPresent: 38,
      totalStudents: 42
    },
    {
      id: '7',
      facultyName: 'Prof. Karthik Reddy',
      employeeId: 'FAC007',
      department: 'CSE',
      subject: 'Web Development',
      room: '102',
      scheduledTime: '10:00 AM',
      status: 'not-started',
      attendanceMarked: false
    },
    {
      id: '8',
      facultyName: 'Dr. Ramesh Kumar',
      employeeId: 'FAC008',
      department: 'Mech',
      subject: 'Thermodynamics',
      room: '301',
      scheduledTime: '09:00 AM',
      actualStartTime: '09:00 AM',
      actualEndTime: '09:55 AM',
      status: 'completed',
      attendanceMarked: true,
      studentsPresent: 42,
      totalStudents: 45
    }
  ];

  const filteredActivities = activities.filter(activity =>
    activity.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: FacultyActivity['status']) => {
    switch (status) {
      case 'on-time':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            On Time
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge className="bg-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            Ongoing
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-red-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Late Start
          </Badge>
        );
      case 'not-started':
        return (
          <Badge variant="outline" className="border-orange-600 text-orange-600">
            <XCircle className="w-3 h-3 mr-1" />
            Not Started
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
    }
  };

  const onTimeCount = activities.filter(a => a.status === 'on-time').length;
  const lateCount = activities.filter(a => a.status === 'late').length;
  const notStartedCount = activities.filter(a => a.status === 'not-started').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">On-Time Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{onTimeCount}</span>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Late Starts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{lateCount}</span>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{notStartedCount}</span>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Activity Log</CardTitle>
          <CardDescription>Real-time tracking of faculty and class sessions</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by faculty name, subject, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm">{activity.facultyName}</h4>
                    <p className="text-xs text-gray-600">
                      {activity.employeeId} • {activity.department}
                    </p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Subject & Room</p>
                    <p className="text-sm">{activity.subject} • Room {activity.room}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Schedule</p>
                    <p className="text-sm">
                      Scheduled: {activity.scheduledTime}
                      {activity.actualStartTime && (
                        <span className="ml-2 text-gray-600">
                          | Started: {activity.actualStartTime}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {activity.attendanceMarked && activity.studentsPresent !== undefined && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Attendance Marked</span>
                      <span>
                        {activity.studentsPresent}/{activity.totalStudents} students (
                        {Math.round((activity.studentsPresent / activity.totalStudents!) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${(activity.studentsPresent / activity.totalStudents!) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

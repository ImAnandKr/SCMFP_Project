import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function AttendanceAnalytics() {
  const departmentData = [
    { department: 'CSE', attendance: 87, avgAttendance: 85, students: 450 },
    { department: 'ECE', attendance: 82, avgAttendance: 80, students: 380 },
    { department: 'Mech', attendance: 78, avgAttendance: 76, students: 320 },
    { department: 'Civil', attendance: 85, avgAttendance: 83, students: 280 },
    { department: 'EEE', attendance: 80, avgAttendance: 79, students: 340 }
  ];

  const weeklyTrend = [
    { day: 'Mon', attendance: 85, target: 80 },
    { day: 'Tue', attendance: 87, target: 80 },
    { day: 'Wed', attendance: 82, target: 80 },
    { day: 'Thu', attendance: 89, target: 80 },
    { day: 'Fri', attendance: 78, target: 80 },
    { day: 'Sat', attendance: 76, target: 80 }
  ];

  const timeSlotData = [
    { slot: '8-9 AM', attendance: 72 },
    { slot: '9-10 AM', attendance: 85 },
    { slot: '10-11 AM', attendance: 88 },
    { slot: '11-12 PM', attendance: 86 },
    { slot: '2-3 PM', attendance: 80 },
    { slot: '3-4 PM', attendance: 75 },
    { slot: '4-5 PM', attendance: 68 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Attendance</CardTitle>
            <CardDescription>Current vs Average attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#3b82f6" name="Today" />
                <Bar dataKey="avgAttendance" fill="#94a3b8" name="Average" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
            <CardDescription>This week's attendance pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Slot Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Time Slot Analysis</CardTitle>
          <CardDescription>Attendance percentage by time slot</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="slot" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performing Classes
            </CardTitle>
            <CardDescription>Highest attendance rates today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { subject: 'Data Structures', room: '101', attendance: 97, faculty: 'Prof. Sharma' },
                { subject: 'Machine Learning', room: '204', attendance: 95, faculty: 'Dr. Kumar' },
                { subject: 'Database Systems', room: '105', attendance: 95, faculty: 'Prof. Rao' },
                { subject: 'Signal Processing', room: '201', attendance: 90, faculty: 'Dr. Devi' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm">{item.subject}</p>
                    <p className="text-xs text-gray-600">
                      Room {item.room} • {item.faculty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700">{item.attendance}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Classes Needing Attention
            </CardTitle>
            <CardDescription>Low attendance alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { subject: 'Thermodynamics', room: '301', attendance: 65, faculty: 'Prof. Kumar' },
                { subject: 'Engineering Graphics', room: '210', attendance: 68, faculty: 'Prof. Reddy' },
                { subject: 'Physics Lab', room: 'Lab 3', attendance: 72, faculty: 'Dr. Singh' },
                { subject: 'Mathematics III', room: '405', attendance: 74, faculty: 'Prof. Patel' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm">{item.subject}</p>
                    <p className="text-xs text-gray-600">
                      Room {item.room} • {item.faculty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-700">{item.attendance}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

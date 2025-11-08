import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SubjectAttendance {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
}

export function AttendanceStats() {
  const subjectAttendance: SubjectAttendance[] = [
    { subject: 'Data Structures', attended: 42, total: 45, percentage: 93, status: 'good' },
    { subject: 'Machine Learning', attended: 38, total: 42, percentage: 90, status: 'good' },
    { subject: 'Cloud Computing', attended: 35, total: 40, percentage: 87, status: 'good' },
    { subject: 'Web Development', attended: 30, total: 38, percentage: 79, status: 'warning' },
    { subject: 'Database Systems', attended: 28, total: 42, percentage: 67, status: 'critical' },
    { subject: 'Software Engineering', attended: 26, total: 40, percentage: 65, status: 'critical' }
  ];

  const monthlyTrend = [
    { month: 'Aug', attendance: 82 },
    { month: 'Sep', attendance: 85 },
    { month: 'Oct', attendance: 88 },
    { month: 'Nov', attendance: 87 }
  ];

  const weeklyTrend = [
    { week: 'Week 1', attendance: 90 },
    { week: 'Week 2', attendance: 88 },
    { week: 'Week 3', attendance: 85 },
    { week: 'Week 4', attendance: 87 }
  ];

  return (
    <div className="space-y-6">
      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
          <CardDescription>Your attendance record for each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectAttendance.map((subject, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{subject.subject}</span>
                    {subject.status === 'critical' && (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {subject.attended}/{subject.total}
                    </span>
                    <Badge
                      className={
                        subject.status === 'good'
                          ? 'bg-green-600'
                          : subject.status === 'warning'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }
                    >
                      {subject.percentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={subject.percentage} className="h-2" />
                {subject.status === 'critical' && (
                  <p className="text-xs text-red-600">
                    ⚠️ Below 75% - You must attend the next {Math.ceil((75 - subject.percentage) / 5)} classes
                  </p>
                )}
                {subject.status === 'warning' && (
                  <p className="text-xs text-yellow-700">
                    ⚠️ Close to minimum - Don't miss more than 1 class
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Overall attendance percentage by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
            <CardDescription>This month's weekly attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Insights</CardTitle>
          <CardDescription>Personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-green-900">
                  <strong>Good Performance:</strong> You're maintaining excellent attendance in Data Structures, Machine Learning, and Cloud Computing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-900">
                  <strong>Needs Attention:</strong> Database Systems and Software Engineering are below 75%. You risk detention if you miss more classes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <strong>Recommendation:</strong> Focus on attending Database Systems (need 5 more classes) and Software Engineering (need 6 more classes) to reach 75%.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

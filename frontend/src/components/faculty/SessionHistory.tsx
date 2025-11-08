import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Users, Clock, FileText, Download } from 'lucide-react';

interface PastSession {
  id: string;
  subject: string;
  room: string;
  date: string;
  timeSlot: string;
  studentsPresent: number;
  totalStudents: number;
  duration: string;
  notes: string;
  materialsUploaded: boolean;
}

export function SessionHistory() {
  const pastSessions: PastSession[] = [
    {
      id: '1',
      subject: 'Data Structures',
      room: '101',
      date: 'Nov 5, 2024',
      timeSlot: '10:00 - 11:00 AM',
      studentsPresent: 58,
      totalStudents: 60,
      duration: '55 mins',
      notes: 'Covered Binary Search Trees, AVL Trees rotation examples. Homework: Implement BST insert/delete operations.',
      materialsUploaded: true
    },
    {
      id: '2',
      subject: 'Algorithms Lab',
      room: 'Lab 2',
      date: 'Nov 5, 2024',
      timeSlot: '2:00 - 4:00 PM',
      studentsPresent: 28,
      totalStudents: 30,
      duration: '1h 58mins',
      notes: 'Practical session on sorting algorithms. Students implemented Quick Sort and Merge Sort.',
      materialsUploaded: true
    },
    {
      id: '3',
      subject: 'Data Structures',
      room: '105',
      date: 'Nov 4, 2024',
      timeSlot: '10:00 - 11:00 AM',
      studentsPresent: 56,
      totalStudents: 58,
      duration: '58 mins',
      notes: 'Introduction to Binary Trees, Tree Traversals (Inorder, Preorder, Postorder).',
      materialsUploaded: true
    },
    {
      id: '4',
      subject: 'Algorithms Lab',
      room: 'Lab 2',
      date: 'Nov 4, 2024',
      timeSlot: '2:00 - 4:00 PM',
      studentsPresent: 29,
      totalStudents: 30,
      duration: '2h 00mins',
      notes: 'Lab work on Graph algorithms - BFS and DFS implementation.',
      materialsUploaded: false
    },
    {
      id: '5',
      subject: 'Data Structures',
      room: '101',
      date: 'Nov 3, 2024',
      timeSlot: '10:00 - 11:00 AM',
      studentsPresent: 59,
      totalStudents: 60,
      duration: '1h 00mins',
      notes: 'Stack and Queue applications, Expression evaluation using stack.',
      materialsUploaded: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>Your past class sessions and records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pastSessions.map((session) => {
            const attendancePercentage = Math.round((session.studentsPresent / session.totalStudents) * 100);
            
            return (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg mb-2">{session.subject}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {session.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {session.timeSlot}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Room {session.room}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration: {session.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      className={
                        attendancePercentage >= 90 
                          ? 'bg-green-600' 
                          : attendancePercentage >= 75 
                          ? 'bg-blue-600' 
                          : 'bg-yellow-600'
                      }
                    >
                      {attendancePercentage}% Attendance
                    </Badge>
                    {session.materialsUploaded && (
                      <Badge variant="outline" className="border-blue-600 text-blue-600">
                        <FileText className="w-3 h-3 mr-1" />
                        Materials
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <span className="text-sm">
                      {session.studentsPresent}/{session.totalStudents} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        attendancePercentage >= 90
                          ? 'bg-green-600'
                          : attendancePercentage >= 75
                          ? 'bg-blue-600'
                          : 'bg-yellow-600'
                      }`}
                      style={{ width: `${attendancePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Session Notes:</p>
                  <p className="text-sm text-gray-900">{session.notes}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

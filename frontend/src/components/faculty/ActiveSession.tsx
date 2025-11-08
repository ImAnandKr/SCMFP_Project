import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Square, Upload, Users, Clock, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getSession, getPresent, getAbsentees, getSubjectAttendance, getStudentNameForRoll } from '../../lib/attendance';

interface ClassSession {
  id: string;
  subject: string;
  room: string;
  timeSlot: string;
  studentsEnrolled: number;
  status: 'upcoming' | 'active' | 'completed';
  branch?: string;
  section?: string;
}

interface ActiveSessionProps {
  session: ClassSession | null;
  onEndSession: () => void;
}

export function ActiveSession({ session, onEndSession }: ActiveSessionProps) {
  const [sessionNotes, setSessionNotes] = useState('');
  const [materialsFile, setMaterialsFile] = useState<File | null>(null);
  const [studentsPresent, setStudentsPresent] = useState(
    session ? Math.max(session.studentsEnrolled - 2, 0) : 0
  );
  const stored = session ? getSession(session.id) : undefined;
  const present = session ? getPresent(session.id) : [];
  const absentees = session ? getAbsentees(session.id) : [];
  const [showList, setShowList] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMaterialsFile(e.target.files[0]);
      toast.success('File selected: ' + e.target.files[0].name);
    }
  };

  const handleUploadMaterials = () => {
    if (materialsFile) {
      toast.success('Teaching materials uploaded successfully');
      setMaterialsFile(null);
    }
  };

  const handleMarkAttendance = () => {
    // Hook up to your API if needed
    toast.success('Attendance marked for all present students');
    // Example (optional): setStudentsPresent(present.length);
  };

  const handleEndSession = () => {
    if (!sessionNotes.trim()) {
      toast.error('Please add session notes before ending');
      return;
    }
    onEndSession();
  };

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Session</CardTitle>
          <CardDescription>Start a class session from your schedule to begin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No active session at the moment</p>
            <p className="text-sm text-gray-500 mt-2">
              Go to "Today&apos;s Schedule" to start a class
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const attendancePercentStored =
    stored ? Math.round((present.length / (stored.rosterRolls.length || 1)) * 100) : null;
  const attendancePercentage =
    attendancePercentStored ?? Math.round((studentsPresent / session.studentsEnrolled) * 100);

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{session.subject}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {session.timeSlot}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Room {session.room}
                  </div>
                  {session.branch && session.section && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      {session.branch} - {session.section}
                    </div>
                  )}
                </div>
              </CardDescription>
            </div>
            <Badge className="bg-green-600">● Live Session</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendance Tracking
          </CardTitle>
          <CardDescription>Real-time student attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Students Present</p>
                <p className="text-3xl mt-1">
                  {present.length} / {stored?.rosterRolls.length ?? session.studentsEnrolled}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-3xl mt-1 text-blue-600">
                  {attendancePercentage}%
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-center text-xs text-white"
                style={{
                  width: `${
                    stored
                      ? Math.round((present.length / (stored.rosterRolls.length || 1)) * 100)
                      : attendancePercentage
                  }%`,
                }}
              >
                {stored
                  ? Math.round((present.length / (stored.rosterRolls.length || 1)) * 100)
                  : attendancePercentage}
                %
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleMarkAttendance}>
                Mark Attendance
              </Button>
              <Button variant="outline" onClick={() => setShowList((v) => !v)}>
                View Student List
              </Button>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong>{' '}
                {stored
                  ? stored.rosterRolls.length - present.length
                  : session.studentsEnrolled - studentsPresent}{' '}
                students are absent
              </p>
            </div>

            {stored && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Present ({present.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {present.map((r: string) => (
                      <span
                        key={r}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200"
                      >
                        {r}
                      </span>
                    ))}
                    {present.length === 0 && (
                      <span className="text-xs text-gray-500">No one yet</span>
                    )}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Absent ({absentees.length})</p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                    {absentees.map((r: string) => (
                      <span
                        key={r}
                        className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200"
                      >
                        {r}
                      </span>
                    ))}
                    {absentees.length === 0 && <span className="text-xs text-gray-500">None</span>}
                  </div>
                </div>
              </div>
            )}

            {stored && showList && (
              <div className="mt-4 p-3 border rounded-lg">
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 px-2 border-b">#</th>
                        <th className="py-2 px-2 border-b">Name</th>
                        <th className="py-2 px-2 border-b">Roll Number</th>
                        <th className="py-2 px-2 border-b">Attendance % (Subject)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stored.rosterRolls.map((roll: string, idx: number) => {
                        const name = getStudentNameForRoll(roll);
                        const stat = getSubjectAttendance(roll, session.subject);
                        return (
                          <tr key={roll} className="hover:bg-gray-50">
                            <td className="py-2 px-2 border-b align-top">{idx + 1}</td>
                            <td className="py-2 px-2 border-b align-top">{name}</td>
                            <td className="py-2 px-2 border-b align-top">{roll}</td>
                            <td className="py-2 px-2 border-b align-top">
                              {stat.percentage}% ({stat.present}/{stat.total})
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teaching Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Teaching Materials
          </CardTitle>
          <CardDescription>Upload session materials for students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="materials">Upload File</Label>
              <Input
                id="materials"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="mt-2"
              />
              {materialsFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {materialsFile.name}</p>
              )}
            </div>
            <Button onClick={handleUploadMaterials} disabled={!materialsFile} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Materials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Session Summary
          </CardTitle>
          <CardDescription>Document today&apos;s class topics and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Session Notes *</Label>
              <Textarea
                id="notes"
                placeholder="Enter topics covered, homework assigned, announcements, etc."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <Button onClick={handleEndSession} variant="destructive" className="w-full">
              <Square className="w-4 h-4 mr-2" />
              End Session & Submit
            </Button>
            <p className="text-xs text-gray-600 text-center">
              Session notes are required before ending the class
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

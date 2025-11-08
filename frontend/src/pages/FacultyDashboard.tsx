import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { TimetableEntry, ClassSession } from '../types';

import { Button } from '../components/ui/button';
import socket from '../lib/socket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LogOut, Clock, Users, CheckCircle, Calendar, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { TodaySchedule } from '../components/faculty/TodaySchedule';
import { ActiveSession as ActiveSessionView } from '../components/faculty/ActiveSession';
import { SessionHistory } from '../components/faculty/SessionHistory';
import { StudentReport } from '../components/faculty/StudentReport';

export function FacultyDashboard() {
  const { currentUser, logoutAction } = useAuth();
  const navigate = useNavigate();

  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch timetable + materials and wire sockets
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await api.get<TimetableEntry[]>('/timetable/my');
        setTimetable(response.data || []);
      } catch (err) {
        setError('Failed to fetch schedule.');
        console.error('[FacultyDashboard] fetchTimetable', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMaterials = async () => {
      try {
        if (!currentUser) return;
        const res = await api.get('/materials/list', {
          params: {
            section: currentUser.section,
            semester: currentUser.semester,
            department: currentUser.department,
            subject: 'All',
          },
        });
        setMaterials(res.data || []);
      } catch (err) {
        console.error('[FacultyDashboard] fetchMaterials', err);
      }
    };

    fetchTimetable();
    fetchMaterials();

    const onClassStarted = (session: any) => {
      try {
        const facultyId = session?.faculty?._id || session?.faculty;
        if (facultyId && currentUser && facultyId.toString() === currentUser._id?.toString()) {
          setActiveSession(session);
          setActiveTab('active');
        }
        fetchTimetable();
      } catch (e) {
        console.error('[socket] onClassStarted error', e);
      }
    };

    const onClassEnded = (payload: any) => {
      try {
        if (activeSession && payload?.sessionId && payload.sessionId === (activeSession as any)._id) {
          setActiveSession(null);
          setActiveTab('schedule');
        }
        fetchTimetable();
      } catch (e) {
        console.error('[socket] onClassEnded error', e);
      }
    };

    try {
      socket.on('classStarted', onClassStarted);
      socket.on('classEnded', onClassEnded);
    } catch (e) {
      console.warn('[socket] not connected', e);
    }

    return () => {
      try {
        socket.off('classStarted', onClassStarted);
        socket.off('classEnded', onClassEnded);
      } catch {}
    };
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Upload material
  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length || !currentUser) return;
    setUploading(true);
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('description', '');
    formData.append('section', currentUser.section ?? '');
    formData.append('semester', String(currentUser.semester ?? ''));
    formData.append('department', currentUser.department ?? '');
    formData.append('subject', 'All');

    try {
      await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Material uploaded');
      fileInputRef.current.value = '';
      // refresh list
      const res = await api.get('/materials/list', {
        params: {
          section: currentUser.section,
          semester: currentUser.semester,
          department: currentUser.department,
          subject: 'All',
        },
      });
      setMaterials(res.data || []);
    } catch (err) {
      console.error('[FacultyDashboard] upload', err);
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  // Start session from a timetable entry
  const handleStartSession = async (classToStart: TimetableEntry) => {
    try {
      const response = await api.post<ClassSession>(`/classes/${(classToStart as any)._id}/start`);
      setActiveSession(response.data);
      toast.success(`Session started for ${response.data.subject}`);
      setActiveTab('active');
    } catch (err: any) {
      console.error('[startSession]', err);
      toast.error(err?.response?.data?.message || 'Failed to start session.');
    }
  };

  // End current session
  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await api.post(`/classes/${(activeSession as any)._id}/end`);
      toast.success(`Session ended for ${activeSession.subject}`);
      setActiveSession(null);
      setActiveTab('schedule');
    } catch (err) {
      console.error('[endSession]', err);
      toast.error('Failed to end session.');
    }
  };

  const handleLogout = () => {
    logoutAction();
    navigate('/login');
  };

  const stats = {
    todayClasses: timetable.length,
    completedToday: 0,
    weeklyClasses: 18,
    avgAttendance: 92,
  };

  // Map backend activeSession -> prop shape expected by ActiveSession component
  const activeForComponent =
    activeSession
      ? {
          id: (activeSession as any)._id || (activeSession as any).id,
          subject: (activeSession as any).subject,
          room:
            (activeSession as any).classroom ||
            (activeSession as any).room ||
            'TBD',
          timeSlot:
            (activeSession as any).startTime
              ? `${new Date((activeSession as any).startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
                  (activeSession as any).endTime
                    ? ` - ${new Date((activeSession as any).endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : ''
                }`
              : 'TBD',
          studentsEnrolled:
            (activeSession as any).studentsEnrolled ??
            (activeSession as any).roster?.length ??
            0,
          status: 'active' as const,
          branch: (activeSession as any).department,
          section: (activeSession as any).section,
        }
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Faculty Portal</h1>
                <p className="text-sm text-gray-600">Classroom Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">{currentUser?.name}</p>
                <p className="text-xs text-gray-600">
                  {currentUser?._id} • {currentUser?.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick student report */}
        <div className="mb-6">
          <StudentReport />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Today's Classes</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{isLoading ? '...' : stats.todayClasses}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.completedToday} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Weekly Load</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.weeklyClasses}</div>
              <p className="text-xs text-gray-600 mt-1">Classes per week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg Attendance</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.avgAttendance}%</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Session</CardTitle>
              <CheckCircle className={`h-4 w-4 ${activeSession ? 'text-green-600' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{activeSession ? '1' : '0'}</div>
              <p className="text-xs text-gray-600 mt-1">
                {activeSession ? 'In progress' : 'None active'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
            <TabsTrigger value="active">Active Session</TabsTrigger>
            <TabsTrigger value="history">Session History</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="details">View Details</TabsTrigger>
            <TabsTrigger value="export">Export Report</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            {isLoading ? (
              <p>Loading schedule...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <TodaySchedule
                classes={timetable}
                activeSession={activeSession}
                onStartSession={handleStartSession}
              />
            )}
          </TabsContent>

          <TabsContent value="active">
            <ActiveSessionView
              session={activeForComponent}
              onEndSession={handleEndSession}
            />
          </TabsContent>

          <TabsContent value="history">
            <SessionHistory />
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Upload Material</CardTitle>
                <CardDescription>
                  Upload files for your section. Students will be able to access them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMaterialUpload} className="flex gap-2 items-center">
                  <input type="file" ref={fileInputRef} required />
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </form>
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Materials</h4>
                  {materials.length === 0 ? (
                    <p className="text-gray-500">No materials uploaded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {materials.map((mat: any) => (
                        <li
                          key={mat._id}
                          className="border p-2 rounded flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{mat.title}</div>
                            <div className="text-xs text-gray-500">
                              {mat.uploadedAt ? new Date(mat.uploadedAt).toLocaleString() : ''}
                            </div>
                          </div>
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>View Details</CardTitle>
                <CardDescription>
                  Details about your section, students, and classes will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Report</CardTitle>
                <CardDescription>Export attendance and session data for your section.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled>Export (Coming Soon)</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

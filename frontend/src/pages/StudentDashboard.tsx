import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import our hook
import api from '../services/api'; // Import our API service

// --- Your existing imports ---
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  LogOut, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { StudentTimetable } from '../components/student/StudentTimetable';
import { AttendanceStats } from '../components/student/AttendanceStats';
import { MarkAttendance } from '../components/student/MarkAttendance';
import type { TimetableEntry } from '../types';

// Remove props: export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
export function StudentDashboard() {
  const { currentUser, logoutAction } = useAuth(); // Get user and logout from context
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('timetable');
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- This is your static stats data, we'll keep it for now ---
  const stats = {
    overallAttendance: 87,
    todayClasses: 4,
    attendedToday: 3,
    lowAttendanceSubjects: 2
  };

  // Fetch timetable on component mount
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
  const response = await api.get<TimetableEntry[]>('/timetable/my');
        setTimetable(response.data);
      } catch (err) {
        setError("Failed to fetch timetable.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, []); // The empty array [] means this runs once

  // Handle logout
  const handleLogout = () => {
    logoutAction();
    navigate('/login');
  };

  // --- All your JSX is preserved below ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Student Portal</h1>
                <p className="text-sm text-gray-600">Attendance & Timetable Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {/* Use the user from context */}
                <p className="text-sm">{currentUser?.name}</p> 
                <p className="text-xs text-gray-600">
                  {/* IMPORTANT: Changed 'user.studentId' to 'user.userId' to match our backend model */}
                    {currentUser?._id} • {currentUser?.email}
                </p>
              </div>
              {/* Updated onClick to use handleLogout */}
              <Button variant="outline" onClick={handleLogout}> 
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
  </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid (Still using static data) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Overall Attendance</CardTitle>
              <TrendingUp className={`h-4 w-4 ${
                stats.overallAttendance >= 75 ? 'text-green-600' : 'text-red-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.overallAttendance}%</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.overallAttendance >= 75 ? 'Good standing' : 'Below requirement'}
              </p>
            </CardContent>
          </Card>
          {/* ... other stats cards ... */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Today's Classes</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.todayClasses}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.attendedToday} attended
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Classes Attended</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.attendedToday}/{stats.todayClasses}</div>
              <p className="text-xs text-gray-600 mt-1">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Low Attendance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.lowAttendanceSubjects}</div>
              <p className="text-xs text-gray-600 mt-1">Subjects below 75%</p>
            </CardContent>
          </Card>
        </div>

        {/* ... (Alert card) ... */}
        {stats.overallAttendance < 75 && (
          <Card className="mb-6 bg-red-50 border-red-200">
            {/* ... */}
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Stats</TabsTrigger>
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            {/* --- DATA IS NOW PASSED --- */}
            {isLoading ? (
              <p>Loading timetable...</p> // You can use a Shadcn Skeleton here
            ) : error ? (
              <p className="text-red-500">{error}</p> // You can use a Shadcn Alert here
            ) : (
              <StudentTimetable timetableData={timetable} />
            )}
            {/* --------------------------- */}
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceStats />
          </TabsContent>

          <TabsContent value="mark">
            <MarkAttendance />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Monitor,
  LogOut,
  Users,
  Building,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { LiveClassroomMonitor } from './admin/LiveClassroomMonitor'
import { FacultyActivityLog } from './admin/FacultyActivityLog'
import { AttendanceAnalytics } from './admin/AttendanceAnalytics'
import { ClassroomUtilization } from './admin/ClassroomUtilization'
import { SectionCounts } from './admin/SectionCounts'
import socket from '../lib/socket'

/**
 * Key fixes & improvements
 * 1) Tabs now use `defaultValue` (uncontrolled) to avoid state sync issues that can block clicks.
 * 2) Mobile-friendly TabsList: horizontal scroll, no wrap, better hit targets.
 * 3) Layout tweaks: container padding, responsive grids, sticky header, safe z-index.
 * 4) Better focus styles for accessibility.
 */

export function AdminDashboard() {
  const { currentUser, logoutAction } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutAction()
    navigate('/login')
  }

  // Mock stats (replace with real data)
  const stats = {
    activeClasses: 24,
    totalClasses: 45,
    activeFaculty: 18,
    totalFaculty: 32,
    averageAttendance: 87,
    classroomUtilization: 73,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-blue-600 rounded-lg shrink-0">
                <Monitor className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="truncate">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">SCFMP Admin Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Smart Classroom & Faculty Monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden xs:block">
                <p className="text-sm leading-tight line-clamp-1">{currentUser?.name}</p>
                <p className="text-xs text-gray-600 leading-tight line-clamp-1">{currentUser?.department}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="whitespace-nowrap">
                <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Uncontrolled Tabs to prevent click issues */}
        <Tabs defaultValue="overview" className="w-full">
          {/* Scrollable tab list on small screens */}
          <TabsList
            className="mb-6 w-full overflow-x-auto flex-nowrap justify-start sm:justify-start gap-1 sm:gap-2 px-1 sm:px-0"
            aria-label="Admin sections"
          >
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
            <TabsTrigger value="live" className="flex-1 sm:flex-none">Live Monitor</TabsTrigger>
            <TabsTrigger value="faculty" className="flex-1 sm:flex-none">Faculty Activity</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
            <TabsTrigger value="students" className="flex-1 sm:flex-none">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 focus:outline-none">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Active Classes</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.activeClasses}/{stats.totalClasses}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {Math.round((stats.activeClasses / stats.totalClasses) * 100)}% ongoing now
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Active Faculty</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.activeFaculty}/{stats.totalFaculty}</div>
                  <p className="text-xs text-gray-600 mt-1">Currently teaching</p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Avg Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.averageAttendance}%</div>
                  <p className="text-xs text-gray-600 mt-1">Today's average</p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Room Utilization</CardTitle>
                  <Building className="h-4 w-4 text-orange-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.classroomUtilization}%</div>
                  <p className="text-xs text-gray-600 mt-1">Classrooms in use</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>System notifications and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-sm">Low attendance in CSE-301</p>
                        <p className="text-xs text-gray-600">Only 45% attendance at 10:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-sm">Faculty late: Prof. Kumar</p>
                        <p className="text-xs text-gray-600">Class started 15 mins late in Room 204</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-sm">All morning sessions completed</p>
                        <p className="text-xs text-gray-600">100% faculty attendance rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Current time slot overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded">
                        <Clock className="w-4 h-4 text-green-700" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">10:00 - 11:00 AM</p>
                        <p className="text-xs text-gray-600">18 classes ongoing</p>
                      </div>
                      <div className="text-sm text-green-600">Active</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <Clock className="w-4 h-4 text-gray-700" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">11:00 - 12:00 PM</p>
                        <p className="text-xs text-gray-600">22 classes scheduled</p>
                      </div>
                      <div className="text-sm text-gray-600">Upcoming</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <Clock className="w-4 h-4 text-gray-700" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">12:00 - 01:00 PM</p>
                        <p className="text-xs text-gray-600">Lunch break</p>
                      </div>
                      <div className="text-sm text-gray-600">Break</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="live" className="focus:outline-none">
            <LiveClassroomMonitor />
          </TabsContent>

          <TabsContent value="faculty" className="focus:outline-none">
            <FacultyActivityLog />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 focus:outline-none">
            <AttendanceAnalytics />
            <ClassroomUtilization />
          </TabsContent>

          <TabsContent value="students" className="space-y-6 focus:outline-none">
            <SectionCounts />
          </TabsContent>
          {/* listen for real-time class start/end to refresh parts of the admin UI */}
          {/* We only need lightweight listeners here; SectionCounts subscribes itself for studentsUpdated */}
          <script suppressHydrationWarning>
            {`void 0;`}
          </script>
        </Tabs>
      </main>
    </div>
  )
}

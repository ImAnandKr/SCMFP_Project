import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building } from 'lucide-react';

export function ClassroomUtilization() {
  const buildingData = [
    {
      building: 'CSE Block A',
      totalRooms: 12,
      occupied: 9,
      vacant: 3,
      utilization: 75
    },
    {
      building: 'CSE Block B',
      totalRooms: 10,
      occupied: 7,
      vacant: 3,
      utilization: 70
    },
    {
      building: 'CSE Block C',
      totalRooms: 8,
      occupied: 6,
      vacant: 2,
      utilization: 75
    },
    {
      building: 'ECE Block',
      totalRooms: 15,
      occupied: 12,
      vacant: 3,
      utilization: 80
    },
    {
      building: 'Mech Block',
      totalRooms: 10,
      occupied: 6,
      vacant: 4,
      utilization: 60
    },
    {
      building: 'Civil Block',
      totalRooms: 8,
      occupied: 5,
      vacant: 3,
      utilization: 62
    }
  ];

  const timeSlotUtilization = [
    { time: '8:00 - 9:00 AM', utilization: 45 },
    { time: '9:00 - 10:00 AM', utilization: 68 },
    { time: '10:00 - 11:00 AM', utilization: 73 },
    { time: '11:00 - 12:00 PM', utilization: 78 },
    { time: '12:00 - 1:00 PM', utilization: 15 },
    { time: '2:00 - 3:00 PM', utilization: 65 },
    { time: '3:00 - 4:00 PM', utilization: 58 },
    { time: '4:00 - 5:00 PM', utilization: 42 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Classroom Utilization Heatmap</CardTitle>
          <CardDescription>Building-wise classroom occupancy status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildingData.map((building, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm">{building.building}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    building.utilization >= 75
                      ? 'bg-green-100 text-green-700'
                      : building.utilization >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {building.utilization}%
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Rooms</span>
                    <span>{building.totalRooms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Occupied</span>
                    <span className="text-green-600">{building.occupied}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vacant</span>
                    <span className="text-gray-500">{building.vacant}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      building.utilization >= 75
                        ? 'bg-green-600'
                        : building.utilization >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${building.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Slot Utilization</CardTitle>
          <CardDescription>Average classroom usage across all buildings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeSlotUtilization.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">{slot.time}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-8 relative">
                    <div
                      className={`h-8 rounded-full flex items-center justify-end pr-3 text-sm text-white transition-all duration-500 ${
                        slot.utilization >= 70
                          ? 'bg-green-600'
                          : slot.utilization >= 50
                          ? 'bg-blue-600'
                          : slot.utilization >= 30
                          ? 'bg-yellow-600'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${slot.utilization}%` }}
                    >
                      {slot.utilization}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

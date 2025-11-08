import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import socket from '../../lib/socket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface SectionCount {
  section: string | null;
  count: number;
}

export function SectionCounts() {
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState<number | ''>('' as any);
  const [counts, setCounts] = useState<SectionCount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (department) params.department = department;
      if (semester) params.semester = semester;
      const res = await api.get('/dashboard/sections', { params });
      setCounts(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to fetch section counts');
    } finally {
      setLoading(false);
    }
  };

  // stable callback used by socket listener
  const fetchCountsCb = useCallback(() => {
    // only refresh if socket event matches current filters (or always)
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, semester]);

  useEffect(() => {
    // initial fetch
    fetchCounts();
    // Subscribe to socket events
    const onStudentsUpdated = (payload: any) => {
      // If payload matches our filters (department/semester), refresh
      if (!payload) return fetchCountsCb();
      if (department && payload.department && department !== payload.department) return;
      if (semester && payload.semester && Number(semester) !== Number(payload.semester)) return;
      fetchCountsCb();
    };

    try {
      socket.on('studentsUpdated', onStudentsUpdated);
    } catch (e) {
      // ignore if socket not connected
      console.warn('socket not available', e);
    }

    return () => {
      try { socket.off('studentsUpdated', onStudentsUpdated); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students per Section</CardTitle>
        <CardDescription>View student counts grouped by section</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <Label>Semester</Label>
            <Input value={semester as any} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : '')} />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchCounts} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
          </div>
        </div>

        <div className="space-y-2">
          {counts.length === 0 ? (
            <p className="text-sm text-gray-600">No students found for this filter.</p>
          ) : (
            counts.map((c) => (
              <div key={c.section ?? 'null'} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="text-sm font-medium">Section: {c.section ?? '—'}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div className="text-xl font-semibold">{c.count}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

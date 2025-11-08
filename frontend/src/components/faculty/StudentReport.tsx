import React, { useState } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface SubjectReport {
  subject: string;
  totalSessions: number;
  presentCount: number;
  attendancePercent: number;
  scores: any[];
}

export function StudentReport() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<{ _id: string; name: string; userId?: string } | null>(null);
  const [report, setReport] = useState<SubjectReport[]>([]);

  const fetchReport = async () => {
    if (!studentId) {
      toast.error('Please enter student ID');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/student/${encodeURIComponent(studentId)}/report`);
      setStudent(res.data.student || null);
      setReport(res.data.report || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to fetch student report');
      setStudent(null);
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Report</CardTitle>
        <CardDescription>Lookup a student by ID and view subject-wise attendance & scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="sm:col-span-3">
            <Label>Student ID (userId or Mongo _id)</Label>
            <Input value={studentId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentId(e.target.value)} placeholder="e.g. 22CSE1001 or 64b..." />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchReport} disabled={loading}>{loading ? 'Loading...' : 'Fetch Report'}</Button>
          </div>
        </div>

        {student && (
          <div className="mb-4">
            <div className="text-sm">Name: <strong>{student.name}</strong></div>
            <div className="text-sm">ID: <strong>{student.userId ?? student._id}</strong></div>
          </div>
        )}

        <div className="space-y-3">
          {report.length === 0 ? (
            <p className="text-sm text-gray-600">No report available. Try a different student or ensure sessions exist.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.map(r => (
                <div key={r.subject} className="p-3 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{r.subject}</div>
                    <div className="text-sm text-gray-600">{r.attendancePercent}%</div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">Present: {r.presentCount} / {r.totalSessions}</div>
                  <div className="text-xs text-gray-500">Scores: {r.scores.length === 0 ? 'No scores available' : 'See detailed scores'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

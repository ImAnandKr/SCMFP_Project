import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { QrCode, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface ActiveClass {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  timeSlot: string;
  attendanceMethod?: 'qr' | 'otp' | null;
  qrCode?: string;
  attendanceCode?: string;  // OTP code for attendance
}

export function MarkAttendance() {
  const [otpCode, setOtpCode] = useState('');
  const [isMarking, setIsMarking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [reader] = useState(() => new BrowserMultiFormatReader());
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const controlsRef = React.useRef<{ stop: () => void } | null>(null);

  // Cleanup QR reader on unmount
  useEffect(() => {
    return () => {
      if (controlsRef.current) controlsRef.current.stop();
    };
  }, []);

  // Function to stop QR scanning
  const stopScanning = () => {
    if (controlsRef.current) controlsRef.current.stop();
    setScanning(false);
  };

  useEffect(() => {
    let mounted = true;

    const fetchClasses = async () => {
      try {
        const res = await api.get('/dashboard/ongoing');
        if (!mounted) return;
        const list: ActiveClass[] = (res.data || []).map((s: any) => ({
          id: s._id,
          subject: s.subject,
          faculty: s.faculty?.name || (s.faculty || ''),
          room: s.classroom || '',
          timeSlot: s.startTime ? new Date(s.startTime).toLocaleString() : '',
          attendanceMethod: s.attendanceMethod || null,
          qrCode: s.qrCodeData,
          attendanceCode: s.attendanceCode,
        }));
        setActiveClasses(list);
      } catch (err) {
        console.error('[MarkAttendance] fetch ongoing', err);
        toast.error('Failed to fetch active classes');
      }
    };

    fetchClasses();
    const interval = setInterval(fetchClasses, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleQRScan = async (classItem: ActiveClass) => {
    if (!reader) {
      toast.error('QR scanner not initialized');
      return;
    }

    setScanning(true);
    try {
      const constraints = { video: { facingMode: 'environment' } };

      if (videoRef.current) {
        const controls = await reader.decodeFromConstraints(
          constraints,
          videoRef.current,
          async (result, err) => {
            if (err) {
              if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                toast.error('Camera access denied. Please allow camera permission.');
                stopScanning();
              }
              return;
            }

            if (result) {
              try {
                const code = result.getText().trim();
                await api.post(`/classes/${classItem.id}/mark-attendance`, {
                  verificationCode: code,
                });
                toast.success('Attendance marked successfully!');
                stopScanning();
              } catch (error: any) {
                console.error('[MarkAttendance] QR scan', error);
                toast.error(error?.response?.data?.message || 'Failed to mark attendance');
                stopScanning();
              }
            }
          }
        );

        controlsRef.current = controls;
      }
    } catch (error) {
      console.error('Error starting QR scan:', error);
      toast.error('Failed to start QR scanner');
      setScanning(false);
    }
  };

  const handleOTPSubmit = async (classItem: ActiveClass) => {
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsMarking(true);
    try {
      await api.post(`/classes/${classItem.id}/mark-attendance`, {
        verificationCode: otpCode,
      });
      toast.success('Attendance marked successfully!');
      setOtpCode('');
    } catch (error: any) {
      console.error('[MarkAttendance] OTP submit', error);
      toast.error(error?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Classes for Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance - Active Classes</CardTitle>
          <CardDescription>Click scan to open camera and scan the class bar code</CardDescription>
        </CardHeader>
        <CardContent>
          {activeClasses.length > 0 ? (
            <div className="space-y-4">
              {activeClasses.map((classItem) => (
                <div key={classItem.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{classItem.subject}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Room {classItem.room}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {classItem.timeSlot}
                        </p>
                        <p>{classItem.faculty}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Live</Badge>
                  </div>

                  <div className="mt-4">
                    {!classItem.attendanceMethod ? (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Waiting for faculty to enable attendance...
                        </p>
                      </div>
                    ) : classItem.attendanceMethod === 'qr' ? (
                      <div>
                        <Button
                          onClick={() => handleQRScan(classItem)}
                          disabled={isMarking || scanning}
                          className="w-full"
                        >
                          {scanning ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4 mr-2" />
                              Scan QR Code
                            </>
                          )}
                        </Button>
                        {scanning && (
                          <div className="mt-3">
                            <video
                              ref={videoRef}
                                className="w-full aspect-square object-cover rounded-lg"
                                playsInline
                                muted
                              />

                            <Button variant="outline" className="w-full mt-2" onClick={stopScanning}>
                              Cancel Scanning
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          maxLength={6}
                          className="text-center text-xl tracking-wider"
                        />
                        <Button
                          onClick={() => handleOTPSubmit(classItem)}
                          disabled={isMarking || otpCode.length !== 6}
                          className="w-full"
                        >
                          {isMarking ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Verifying...
                            </>
                          ) : (
                            'Submit OTP'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">No active classes</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back when your scheduled class begins
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Attendance Marking Works</CardTitle>
          <CardDescription>Follow these steps to mark your attendance for live classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Faculty Starts Session</p>
                <p className="text-sm text-muted-foreground">
                  Your faculty initiates the class session and enables attendance marking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Choose Verification Method</p>
                <p className="text-sm text-muted-foreground">
                  The faculty will choose between QR code or OTP verification
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Mark Your Attendance</p>
                <p className="text-sm text-muted-foreground">
                  Either scan the displayed QR code or enter the 6-digit OTP shown in class
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  Your attendance will be recorded instantly once verified
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Attendance can only be marked during live classes and when you're physically present in the classroom.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

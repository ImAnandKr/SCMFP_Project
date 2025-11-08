import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Monitor, UserCog, GraduationCap } from 'lucide-react';

import type { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

type UserRole = 'student' | 'faculty' | 'admin';

export function Login() {
  // Common auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Role tab
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Password flow loading
  const [isLoading, setIsLoading] = useState(false);

  // OTP flow states
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<number | null>(null);

  // Extra student fields (display-only in this screen)
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');

  const navigate = useNavigate();
  const { loginAction } = useAuth();

  // Redirect helper
  const getRedirectPath = (role?: string) => {
    const r = (role ?? selectedRole ?? '').toString().toLowerCase();
    switch (r) {
      case 'admin':
      case 'administrator':
        return '/admin/AdminDashboard';
      case 'faculty':
      case 'teacher':
      case 'professor':
        return '/faculty/Dashboard';
      case 'student':
      default:
        return '/student/Dashboard';
    }
  };

  // OTP resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }
    if (!countdownRef.current) {
      countdownRef.current = window.setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              window.clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [resendCountdown]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  // --- OTP flow handlers ---
  const handleSendOtp = async () => {
    if (!email || !isValidEmail(email)) {
      toast.error('Please enter a valid email to receive OTP.');
      return;
    }
    setIsSendingOtp(true);
    try {
      await api.post('/users/send-otp', { email }); // adjust if your backend differs
      setOtpSent(true);
      setResendCountdown(60);
      toast.success('OTP sent to your email. Check your inbox/spam.');
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error('Failed to send OTP. Try again later.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !isValidEmail(email)) {
      toast.error('Please enter a valid email first.');
      return;
    }
    if (!otp || otp.trim().length === 0) {
      toast.error('Please enter the OTP.');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const response = await api.post<LoginResponse>('/users/verify-otp', { email, otp }); // adjust endpoint if needed
      const { token, user: userData } = response.data;
      if (!token || !userData) {
        toast.error('Invalid response from server.');
        return;
      }
      loginAction(token, userData);
      toast.success(`Welcome back, ${userData.name ?? 'User'}!`);
      navigate(getRedirectPath(userData.role ?? selectedRole), { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error('OTP verification failed. Try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    await handleSendOtp();
  };

  // --- Password flow handler ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error('Please enter email and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post<LoginResponse>('/users/login', { email, password });
      const { token, user: userData } = response.data;

      if (!token || !userData) {
        toast.error('Invalid login response from server.');
        return;
      }

      loginAction(token, userData);
      toast.success(`Welcome back, ${userData.name || 'User'}!`);

      navigate(getRedirectPath(userData.role ?? selectedRole), { replace: true });
    } catch (err: any) {
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md md:max-w-lg shadow-xl">
        <CardHeader className="space-y-1 text-center px-6 py-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Monitor className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Smart Classroom Portal</CardTitle>
          <CardDescription className="text-sm">
            Real-time faculty monitoring & attendance tracking
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          {/* Role Tabs */}
          <Tabs value={selectedRole} onValueChange={(v: string) => setSelectedRole(v as UserRole)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student" className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="faculty" className="flex items-center gap-1">
                <UserCog className="w-4 h-4" />
                Faculty
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-1">
                <Monitor className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* We still render the same form UI inside TabsContent */}
            <TabsContent value={selectedRole}>
              {/* Toggle between OTP and Password */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="text-sm text-gray-700">Sign in with</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded ${!useOtp ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                    onClick={() => setUseOtp(false)}
                    aria-pressed={!useOtp}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded ${useOtp ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                    onClick={() => setUseOtp(true)}
                    aria-pressed={useOtp}
                  >
                    OTP
                  </button>
                </div>
              </div>

              {/* Form */}
              {useOtp ? (
                // OTP Flow
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (otpSent) handleVerifyOtp(e);
                    else handleSendOtp();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={`${selectedRole}@vignan.edu`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {!otpSent ? (
                    <div className="flex gap-2">
                      <Button type="button" className="flex-1" onClick={handleSendOtp} disabled={isSendingOtp}>
                        {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.trim())}
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() => handleVerifyOtp()}
                          disabled={isVerifyingOtp}
                        >
                          {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                        </Button>

                        <button
                          type="button"
                          className="text-sm underline text-blue-700 disabled:text-gray-400"
                          onClick={handleResendOtp}
                          disabled={resendCountdown > 0}
                        >
                          {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                // Password Flow
                <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email_pw">Email</Label>
                    <Input
                      id="email_pw"
                      type="email"
                      placeholder={`${selectedRole}@vignan.edu`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {selectedRole === 'student' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="roll">Roll Number</Label>
                        <Input
                          id="roll"
                          type="text"
                          placeholder="22CSE1001"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Input
                          id="branch"
                          type="text"
                          placeholder="CSE"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Input
                          id="section"
                          type="text"
                          placeholder="A"
                          value={section}
                          onChange={(e) => setSection(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="text-blue-900 mb-2">Demo Credentials / Tips:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Use a real email/password from your DB</li>
              <li>• For OTP, ensure your backend `/users/send-otp` and `/users/verify-otp` are implemented.</li>
              <li>• Example: admin@vignan.ac.in / password123</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

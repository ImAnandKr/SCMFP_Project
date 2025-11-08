export type Session = {
  id: string;
  subject: string;
  branch: string;
  section: string;
  startTime: number;
  room?: string;
  timeSlot?: string;
  rosterRolls: string[];
};

const SESSIONS_KEY = 'scfmp_sessions';
const PRESENCE_KEY = 'scfmp_presence';

function readSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function readPresence(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(PRESENCE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function writePresence(presence: Record<string, string[]>) {
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
}

export function generateRoster(branch: string, section: string, count = 60): string[] {
  const year = '22';
  const prefix = `${year}${branch}${section}`;
  const rolls: string[] = [];
  for (let i = 1; i <= count; i++) {
    const num = String(1000 + i);
    rolls.push(`${year}${branch}${num}`);
  }
  return rolls;
}

export function createSession(input: Omit<Session, 'startTime' | 'rosterRolls'> & { rosterCount?: number; rosterRolls?: string[] }): Session {
  const sessions = readSessions();
  const roster = input.rosterRolls && input.rosterRolls.length > 0
    ? input.rosterRolls
    : generateRoster(input.branch, input.section, input.rosterCount ?? 60);
  const session: Session = {
    id: input.id,
    subject: input.subject,
    branch: input.branch,
    section: input.section,
    startTime: Date.now(),
    room: input.room,
    timeSlot: input.timeSlot,
    rosterRolls: roster,
  };
  writeSessions([session, ...sessions.filter(s => s.id !== session.id)]);
  const presence = readPresence();
  if (!presence[session.id]) {
    presence[session.id] = [];
    writePresence(presence);
  }
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return readSessions().find(s => s.id === sessionId);
}

export function getLatestSession(): Session | undefined {
  const sessions = readSessions();
  if (sessions.length === 0) return undefined;
  return sessions.slice().sort((a, b) => b.startTime - a.startTime)[0];
}

export function markPresent(sessionId: string, rollNumber: string) {
  const presence = readPresence();
  const current = new Set(presence[sessionId] ?? []);
  current.add(rollNumber);
  presence[sessionId] = Array.from(current);
  writePresence(presence);
}

export function getPresent(sessionId: string): string[] {
  const presence = readPresence();
  return presence[sessionId] ?? [];
}

export function getAbsentees(sessionId: string): string[] {
  const s = getSession(sessionId);
  if (!s) return [];
  const present = new Set(getPresent(sessionId));
  return s.rosterRolls.filter(r => !present.has(r));
}

export function encodeSessionPayload(session: Session): string {
  const payload = {
    sessionId: session.id,
    branch: session.branch,
    section: session.section,
    ts: Date.now(),
  };
  return JSON.stringify(payload);
}

export function decodeSessionPayload(data: string): { sessionId: string; branch: string; section: string; ts: number } | null {
  try {
    const obj = JSON.parse(data);
    if (obj && obj.sessionId && obj.branch && obj.section && obj.ts) return obj;
    return null;
  } catch {
    return null;
  }
}

// Attendance analytics helpers
export function getSubjectAttendance(roll: string, subject: string): { present: number; total: number; percentage: number } {
  const sessions = readSessions().filter(s => s.subject === subject && s.rosterRolls.includes(roll));
  const total = sessions.length;
  if (total === 0) return { present: 0, total: 0, percentage: 0 };
  const presence = readPresence();
  let present = 0;
  for (const s of sessions) {
    const list = presence[s.id] ?? [];
    if (list.includes(roll)) present++;
  }
  const percentage = Math.round((present / total) * 100);
  return { present, total, percentage };
}

const FIRST_NAMES = ['Aarav','Isha','Vihaan','Ananya','Kabir','Sai','Rohan','Meera','Arjun','Diya','Krishna','Navya','Aditya','Aditi','Ishaan','Riya','Saanvi','Vivaan','Anika','Rahul'];
const LAST_NAMES = ['Sharma','Reddy','Patel','Gupta','Rao','Kumar','Singh','Nair','Iyer','Das','Agarwal','Bansal','Chopra','Desai','Ghosh','Jain','Kapoor','Malhotra','Naidu','Verma'];

export function getStudentNameForRoll(roll: string): string {
  // Simple deterministic hash from roll to pick names
  let hash = 0;
  for (let i = 0; i < roll.length; i++) {
    hash = (hash * 31 + roll.charCodeAt(i)) >>> 0;
  }
  const first = FIRST_NAMES[hash % FIRST_NAMES.length];
  const last = LAST_NAMES[(Math.floor(hash / 31)) % LAST_NAMES.length];
  return `${first} ${last}`;
}

// ZERO DEMO DATA: Every record is entered by real users across the 4 portals.
export const EMPTY_DB = {
  version: '2.0.0',
  initialized: false,
  masterSettings: {
    institutionName: '',
    institutionCode: '',
    academicYear: '2026-2027',
    activeSemester: '1st Sem',
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'],
    minAttendancePercent: 75,
    passPercent: 40,
    maxMarks: 100,
  },
  users: [],
  departments: [],
  officeWorkers: [],
  teachers: [],
  students: [],
  libraryBooks: [],
  libraryIssues: [],
  subjects: [],
  facultyMeetings: [],
  semesterCalendar: [],
  globalNotices: [],
  certificates: [],
  hallTickets: [],
  examRoles: [],
  exams: [],
  timetable: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    slots: ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '12:15 - 01:15', '02:00 - 03:00', '03:00 - 04:00'],
    entries: [],
  },
  syllabusLogs: [],
  attendanceLogs: [],
  subjectMarks: [],
  studentSemesterResults: [],
  quizzes: [],
  assignments: [],
  projectGroups: [],
  leaves: [],
  startups: [],
  researchPapers: [],
  financeRecords: [],
  officeTasks: [],
  otpLogs: [],
};

export function semesterToYearLevel(sem) {
  const idx = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].indexOf(sem);
  if (idx < 0) return 1;
  return Math.floor(idx / 2) + 1;
}

export function yearLevelToSemesters(yearLevel) {
  const y = Number(yearLevel) || 1;
  const map = {
    1: ['1st Sem', '2nd Sem'],
    2: ['3rd Sem', '4th Sem'],
    3: ['5th Sem', '6th Sem'],
    4: ['7th Sem', '8th Sem'],
  };
  return map[y] || ['1st Sem', '2nd Sem'];
}

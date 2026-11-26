export const INITIAL_DB = {
  version: '1.0.0',
  masterSettings: {
    institutionName: 'Apex Institute of Engineering & Technology',
    institutionCode: 'AIET-2026',
    affiliation: 'AICTE Approved • Autonomous University Affiliate',
    academicYear: '2026-2027',
    activeSemester: 'Odd Semester (5th / 7th Sem)',
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'],
    minAttendancePercent: 75,
    iaMaxMarks: 50,
    seeMaxMarks: 50,
    passPercent: 40,
    aicteTargetPoints: 100,
    gradingScale: [
      { grade: 'O', min: 90, points: 10, desc: 'Outstanding' },
      { grade: 'A+', min: 80, points: 9, desc: 'Excellent' },
      { grade: 'A', min: 70, points: 8, desc: 'Very Good' },
      { grade: 'B+', min: 60, points: 7, desc: 'Good' },
      { grade: 'B', min: 50, points: 6, desc: 'Above Average' },
      { grade: 'P', min: 40, points: 4, desc: 'Pass' },
      { grade: 'F', min: 0, points: 0, desc: 'Fail / Backlog' },
    ],
    rolesMatrix: [
      { role: 'Master Admin', masterConfig: true, collegeAdmin: true, approveLeave: true, enterMarks: true, viewAnalytics: true, issueCerts: true },
      { role: 'College Admin', masterConfig: false, collegeAdmin: true, approveLeave: true, enterMarks: false, viewAnalytics: true, issueCerts: true },
      { role: 'HOD', masterConfig: false, collegeAdmin: true, approveLeave: true, enterMarks: true, viewAnalytics: true, issueCerts: false },
      { role: 'Faculty / Mentor', masterConfig: false, collegeAdmin: false, approveLeave: false, enterMarks: true, viewAnalytics: true, issueCerts: false },
      { role: 'Student', masterConfig: false, collegeAdmin: false, approveLeave: false, enterMarks: false, viewAnalytics: false, issueCerts: false },
    ],
  },

  users: [
    { id: 'U-M1', role: 'master', name: 'Dr. R. K. Deshmukh', email: 'master@campus.edu', password: 'password123', phone: '+91 98450 10001', dept: 'Administration', code: 'MST001' },
    { id: 'U-C1', role: 'college', name: 'Prof. S. V. Kulkarni', email: 'admin@campus.edu', password: 'password123', phone: '+91 98450 20001', dept: 'Principal Office', code: 'CLG001' },
    { id: 'U-T1', role: 'teacher', name: 'Prof. Ananya Sharma', email: 'teacher@campus.edu', password: 'password123', phone: '+91 98450 30001', dept: 'CSE', code: 'FAC-CSE-104' },
    { id: 'U-S1', role: 'student', name: 'Aarav Patil', email: 'student@campus.edu', password: 'password123', phone: '+91 98450 40001', dept: 'CSE', code: '2MM23CS001' },
  ],

  otpLogs: [
    { id: 'OTP-101', email: 'student@campus.edu', otp: '482910', status: 'Verified', timestamp: '2026-11-24 09:42' },
  ],

  globalNotices: [
    {
      id: 'N-1',
      title: 'Semester Internal Assessment-2 Schedule Released',
      body: 'IA-2 examinations commence from Dec 08, 2026. Students must maintain attendance above the configured Master threshold to unlock Hall Tickets.',
      audience: 'All Portals',
      priority: 'High',
      postedBy: 'Master Control',
      date: '2026-11-24',
    },
    {
      id: 'N-2',
      title: 'AICTE 100-Point Activity Portal Open for Final Verification',
      body: 'All 5th and 7th semester learners should upload internship, hackathon, and rural outreach certificates before Dec 15, 2026.',
      audience: 'Student & Teacher',
      priority: 'Medium',
      postedBy: 'College Office',
      date: '2026-11-22',
    },
  ],

  departments: [
    { id: 'D-CSE', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Meera Joshi', intake: 180, filled: 174, passRate: 94.2, aicteCompliant: true },
    { id: 'D-ECE', code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. Vikram Rao', intake: 120, filled: 112, passRate: 89.5, aicteCompliant: true },
    { id: 'D-AIML', code: 'AIML', name: 'Artificial Intelligence & ML', hod: 'Dr. Priya Nair', intake: 60, filled: 60, passRate: 96.1, aicteCompliant: true },
    { id: 'D-ME', code: 'ME', name: 'Mechanical Engineering', hod: 'Prof. Rajesh Hegde', intake: 60, filled: 48, passRate: 84.0, aicteCompliant: true },
  ],

  academicCalendar: [
    { id: 'CAL-1', date: '2026-12-02', event: 'Lab Internal Practical Viva (B1/B2)', category: 'Lab' },
    { id: 'CAL-2', date: '2026-12-08', event: 'Internal Assessment II Begins', category: 'Exam' },
    { id: 'CAL-3', date: '2026-12-18', event: 'Major Project Synopsis & Prototype Review', category: 'Project' },
    { id: 'CAL-4', date: '2026-12-22', event: 'Campus Placement Drive: NovaTech & FinEdge', category: 'Placement' },
  ],

  admissionQuotas: [
    { id: 'Q-1', branch: 'CSE', intake: 180, govtTotal: 81, govtFilled: 81, mgmtTotal: 72, mgmtFilled: 69, nriTotal: 27, nriFilled: 24 },
    { id: 'Q-2', branch: 'AIML', intake: 60, govtTotal: 27, govtFilled: 27, mgmtTotal: 24, mgmtFilled: 24, nriTotal: 9, nriFilled: 9 },
    { id: 'Q-3', branch: 'ECE', intake: 120, govtTotal: 54, govtFilled: 52, mgmtTotal: 48, mgmtFilled: 44, nriTotal: 18, nriFilled: 16 },
    { id: 'Q-4', branch: 'ME', intake: 60, govtTotal: 27, govtFilled: 24, mgmtTotal: 24, mgmtFilled: 18, nriTotal: 9, nriFilled: 6 },
  ],

  teachers: [
    {
      id: 'FAC-CSE-104',
      name: 'Prof. Ananya Sharma',
      dept: 'CSE',
      email: 'teacher@campus.edu',
      phone: '+91 98450 30001',
      subjects: ['Full Stack Web Dev (21CS51)', 'Computer Networks (21CS52)', 'Web Tech Lab (21CSL55)'],
      roles: ['Coordinator', 'Proctor'],
      upi: 'ananya.sharma@okaxis',
      scopusId: '57219482011',
      orcidId: '0000-0002-4812-9034',
      leaveBalance: 10,
    },
    {
      id: 'FAC-CSE-101',
      name: 'Dr. Meera Joshi',
      dept: 'CSE',
      email: 'meera.joshi@campus.edu',
      phone: '+91 98450 30002',
      subjects: ['Machine Learning (21CS53)', 'Database Systems (21CS54)'],
      roles: ['HOD', 'Proctor'],
      upi: 'meera.joshi@okhdfcbank',
      scopusId: '56019884122',
      orcidId: '0000-0001-8834-1209',
      leaveBalance: 12,
    },
    {
      id: 'FAC-AIML-202',
      name: 'Prof. Karthik Menon',
      dept: 'AIML',
      email: 'karthik.m@campus.edu',
      phone: '+91 98450 30003',
      subjects: ['Deep Learning (21AI51)', 'Python & OpenCV Lab (21AIL55)'],
      roles: ['Coordinator'],
      upi: 'karthik.m@oksbi',
      scopusId: '58100234910',
      orcidId: '0000-0003-2291-5501',
      leaveBalance: 8,
    },
  ],

  facultyLeaves: [
    { id: 'FL-1', teacherId: 'FAC-CSE-104', teacherName: 'Prof. Ananya Sharma', dept: 'CSE', from: '2026-12-04', to: '2026-12-05', type: 'Academic Duty (Conference)', substitute: 'Dr. Meera Joshi', status: 'Pending' },
    { id: 'FL-2', teacherId: 'FAC-AIML-202', teacherName: 'Prof. Karthik Menon', dept: 'AIML', from: '2026-11-28', to: '2026-11-28', type: 'Casual Leave', substitute: 'Prof. Ananya Sharma', status: 'Approved' },
  ],

  students: [
    {
      usn: '2MM23CS001',
      name: 'Aarav Patil',
      email: 'student@campus.edu',
      dept: 'CSE',
      semester: '5th Sem',
      sessionType: 'Regular',
      classBatch: 'CSE-A',
      labBatch: 'B1',
      elective: 'Cloud & DevOps',
      parentName: 'Suresh Patil',
      parentPhone: '+91 94480 11223',
      mentorId: 'FAC-CSE-104',
      feeStatus: 'Paid',
      feeAmount: 92500,
      receiptNo: 'RCPT-2026-8841',
      scholarship: 'SSP Merit Scholarship (Approved)',
      backlogs: 0,
      cgpa: 8.85,
      aictePoints: 72,
      attendance: {
        'Full Stack Web Dev (21CS51)': 86,
        'Computer Networks (21CS52)': 79,
        'Machine Learning (21CS53)': 71,
        'Web Tech Lab (21CSL55)': 92,
      },
      iaMarks: {
        'Full Stack Web Dev (21CS51)': 44,
        'Computer Networks (21CS52)': 39,
        'Machine Learning (21CS53)': 36,
        'Web Tech Lab (21CSL55)': 47,
      },
      resume: {
        headline: 'Full-Stack CSE Undergraduate | React, Node.js, Python & Cloud',
        skills: 'React.js, JavaScript, Node.js, PostgreSQL, Python, OpenCV, Git, Docker',
        projects: 'Smart Campus Sync Portal (4-App React Architecture) | AI Traffic Coordinator',
        achievements: 'Hackathon Finalist 2026 | Top 10% in Dept Academic Standing',
      },
    },
    {
      usn: '2MM23CS002',
      name: 'Diya Deshpande',
      email: 'diya.d@campus.edu',
      dept: 'CSE',
      semester: '5th Sem',
      sessionType: 'Regular',
      classBatch: 'CSE-A',
      labBatch: 'B1',
      elective: 'Cyber Security',
      parentName: 'Prakash Deshpande',
      parentPhone: '+91 94480 22334',
      mentorId: 'FAC-CSE-104',
      feeStatus: 'Paid',
      feeAmount: 92500,
      receiptNo: 'RCPT-2026-8842',
      scholarship: 'None',
      backlogs: 0,
      cgpa: 9.24,
      aictePoints: 88,
      attendance: {
        'Full Stack Web Dev (21CS51)': 94,
        'Computer Networks (21CS52)': 91,
        'Machine Learning (21CS53)': 89,
        'Web Tech Lab (21CSL55)': 96,
      },
      iaMarks: {
        'Full Stack Web Dev (21CS51)': 48,
        'Computer Networks (21CS52)': 46,
        'Machine Learning (21CS53)': 45,
        'Web Tech Lab (21CSL55)': 49,
      },
      resume: {
        headline: 'Security & Systems Developer | CSE',
        skills: 'C++, Linux, React, Wireshark, Python, SQL',
        projects: 'Zero-Trust Auth Gateway',
        achievements: 'Best Paper Award — Student Symposium',
      },
    },
    {
      usn: '2MM23CS003',
      name: 'Rohan Kulkarni',
      email: 'rohan.k@campus.edu',
      dept: 'CSE',
      semester: '5th Sem',
      sessionType: 'Regular + Backlog',
      classBatch: 'CSE-A',
      labBatch: 'B2',
      elective: 'Cloud & DevOps',
      parentName: 'Mahesh Kulkarni',
      parentPhone: '+91 94480 33445',
      mentorId: 'FAC-CSE-104',
      feeStatus: 'Pending',
      feeAmount: 92500,
      receiptNo: 'PENDING',
      scholarship: 'NSP Applied',
      backlogs: 2,
      cgpa: 6.45,
      aictePoints: 40,
      attendance: {
        'Full Stack Web Dev (21CS51)': 64,
        'Computer Networks (21CS52)': 68,
        'Machine Learning (21CS53)': 61,
        'Web Tech Lab (21CSL55)': 72,
      },
      iaMarks: {
        'Full Stack Web Dev (21CS51)': 22,
        'Computer Networks (21CS52)': 25,
        'Machine Learning (21CS53)': 18,
        'Web Tech Lab (21CSL55)': 31,
      },
      resume: {
        headline: 'Junior Web Developer',
        skills: 'HTML, CSS, JavaScript, React',
        projects: 'Campus Canteen Ordering App',
        achievements: 'Inter-college Cricket Captain',
      },
    },
    {
      usn: '2MM23AI004',
      name: 'Sneha Nair',
      email: 'sneha.n@campus.edu',
      dept: 'AIML',
      semester: '5th Sem',
      sessionType: 'Regular',
      classBatch: 'AIML-A',
      labBatch: 'B2',
      elective: 'Generative AI',
      parentName: 'Ramesh Nair',
      parentPhone: '+91 94480 44556',
      mentorId: 'FAC-AIML-202',
      feeStatus: 'Paid',
      feeAmount: 98000,
      receiptNo: 'RCPT-2026-8890',
      scholarship: 'AICTE Pragati',
      backlogs: 0,
      cgpa: 9.05,
      aictePoints: 95,
      attendance: {
        'Full Stack Web Dev (21CS51)': 88,
        'Computer Networks (21CS52)': 85,
        'Machine Learning (21CS53)': 95,
        'Web Tech Lab (21CSL55)': 90,
      },
      iaMarks: {
        'Full Stack Web Dev (21CS51)': 43,
        'Computer Networks (21CS52)': 42,
        'Machine Learning (21CS53)': 49,
        'Web Tech Lab (21CSL55)': 46,
      },
      resume: {
        headline: 'AI/ML Engineer Intern | PyTorch & LLMs',
        skills: 'Python, PyTorch, TensorFlow, FastAPI, React',
        projects: 'Medical Image Classifier',
        achievements: 'Google Developer Student Club Lead',
      },
    },
  ],

  timetable: [
    { id: 'TT-1', day: 'Monday', time: '09:00 - 10:00', subject: 'Full Stack Web Dev (21CS51)', faculty: 'Prof. Ananya Sharma', batch: 'CSE-A', room: 'CS-301', substitute: '' },
    { id: 'TT-2', day: 'Monday', time: '10:15 - 11:15', subject: 'Computer Networks (21CS52)', faculty: 'Prof. Ananya Sharma', batch: 'CSE-A', room: 'CS-301', substitute: '' },
    { id: 'TT-3', day: 'Tuesday', time: '11:30 - 13:30', subject: 'Web Tech Lab (21CSL55)', faculty: 'Prof. Ananya Sharma', batch: 'B1', room: 'Lab-2', substitute: '' },
    { id: 'TT-4', day: 'Wednesday', time: '09:00 - 10:00', subject: 'Machine Learning (21CS53)', faculty: 'Dr. Meera Joshi', batch: 'CSE-A', room: 'CS-302', substitute: '' },
    { id: 'TT-5', day: 'Thursday', time: '14:00 - 16:00', subject: 'Web Tech Lab (21CSL55)', faculty: 'Prof. Ananya Sharma', batch: 'B2', room: 'Lab-2', substitute: '' },
  ],

  lectures: [
    {
      id: 'LEC-1',
      subject: 'Full Stack Web Dev (21CS51)',
      title: 'Module 3: React State Architecture & Real-Time Sync',
      videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      docTitle: 'React_Hooks_and_Sync_Notes.pdf',
      syllabusTotal: 5,
      syllabusCovered: 4,
      postedBy: 'Prof. Ananya Sharma',
      date: '2026-11-20',
    },
    {
      id: 'LEC-2',
      subject: 'Computer Networks (21CS52)',
      title: 'Module 4: TCP Congestion Control & WebSockets',
      videoUrl: 'https://www.youtube.com/watch?v=IPvYjXCsTg8',
      docTitle: 'CN_Module4_Slides.pdf',
      syllabusTotal: 5,
      syllabusCovered: 3,
      postedBy: 'Prof. Ananya Sharma',
      date: '2026-11-22',
    },
  ],

  quizzes: [
    {
      id: 'QZ-1',
      subject: 'Full Stack Web Dev (21CS51)',
      title: 'React & REST API Quick Check',
      createdBy: 'Prof. Ananya Sharma',
      questions: [
        { q: 'Which hook manages side effects like API subscriptions in React?', options: ['useMemo', 'useEffect', 'useRef', 'useId'], answer: 1 },
        { q: 'Which browser API enables instant tab-to-tab messaging on the same origin?', options: ['BroadcastChannel', 'WebGL', 'ClipboardAPI', 'ResizeObserver'], answer: 0 },
        { q: 'What HTTP status code represents a successful resource creation?', options: ['200', '201', '304', '403'], answer: 1 },
      ],
      attempts: [
        { usn: '2MM23CS002', name: 'Diya Deshpande', score: 3, total: 3, date: '2026-11-23' },
      ],
    },
  ],

  assignments: [
    {
      id: 'ASG-1',
      subject: 'Full Stack Web Dev (21CS51)',
      title: 'Build Multi-Portal Responsive Layout with Theme Persistence',
      dueDate: '2026-12-03',
      maxMarks: 20,
      type: 'Assignment',
      submissions: [
        { usn: '2MM23CS001', studentName: 'Aarav Patil', link: 'https://github.com/KOUSTUB15/web-lab-asg1', notes: 'Completed dark/light glassmorphism layout', status: 'Graded', marks: 19 },
        { usn: '2MM23CS002', studentName: 'Diya Deshpande', link: 'https://github.com/diya/asg1', notes: 'Submitted with responsive grid', status: 'Submitted', marks: null },
      ],
    },
    {
      id: 'ASG-2',
      subject: 'Computer Networks (21CS52)',
      title: 'Socket Programming & Packet Capture Analysis Report',
      dueDate: '2026-12-06',
      maxMarks: 15,
      type: 'AICTE Task',
      submissions: [],
    },
  ],

  labs: [
    {
      id: 'LAB-1',
      subject: 'Web Tech Lab (21CSL55)',
      batch: 'B1 & B2',
      title: 'Exp 05: React CRUD Dashboard & Local Persistence',
      manualFile: '21CSL55_Exp05_Manual.pdf',
      programSnippet: 'const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("items") || "[]"));',
      submissions: [
        { usn: '2MM23CS001', studentName: 'Aarav Patil', batch: 'B1', codeUrl: 'https://github.com/KOUSTUB15/lab-exp05', labAttendance: 'Present', vivaMarks: 23, maxViva: 25, status: 'Evaluated' },
        { usn: '2MM23CS003', studentName: 'Rohan Kulkarni', batch: 'B2', codeUrl: 'https://github.com/rohan/lab-exp05', labAttendance: 'Present', vivaMarks: 16, maxViva: 25, status: 'Evaluated' },
      ],
    },
  ],

  studentLeaves: [
    { id: 'SL-1', usn: '2MM23CS001', studentName: 'Aarav Patil', type: 'OD (Hackathon)', from: '2026-11-29', to: '2026-11-30', reason: 'Representing college at Hack Valley 2026', status: 'Pending' },
  ],

  exams: [
    { id: 'EX-1', subject: 'Full Stack Web Dev (21CS51)', date: '2026-12-08', time: '09:30 AM - 11:00 AM', room: 'Block A - Hall 102', seatRange: '2MM23CS001 - 2MM23CS030', qpStatus: 'Moderated & Approved', hallTicketPublished: true, qpFile: '21CS51_IA2_ModelQP.pdf', impQuestions: '1. Explain React Reconciliation & Virtual DOM. 2. Compare REST vs WebSockets. 3. Design JWT Auth Flow.' },
    { id: 'EX-2', subject: 'Computer Networks (21CS52)', date: '2026-12-10', time: '09:30 AM - 11:00 AM', room: 'Block A - Hall 104', seatRange: '2MM23CS001 - 2MM23CS030', qpStatus: 'Under Moderation', hallTicketPublished: true, qpFile: '21CS52_IA2_ModelQP.pdf', impQuestions: '1. Dijkstra Link State Routing. 2. TCP 3-Way Handshake & Sliding Window.' },
  ],

  revaluations: [
    { id: 'REV-1', usn: '2MM23CS003', studentName: 'Rohan Kulkarni', subject: 'Machine Learning (21CS53)', currentMarks: 18, reason: 'Requesting re-check of Q3 derivation marks', status: 'Pending' },
  ],

  projects: [
    {
      id: 'PRJ-1',
      title: 'CampusSync: 4-App Connected Academic Platform',
      teamUsns: ['2MM23CS001', '2MM23CS002'],
      guideId: 'FAC-CSE-104',
      guideName: 'Prof. Ananya Sharma',
      synopsisStatus: 'Approved',
      milestone: 'Phase 2: Prototype Demo Ready',
      repoUrl: 'https://github.com/KOUSTUB15/campus-sync-portal',
      reportFile: 'CampusSync_Phase2_Report.pdf',
      marks: 46,
      attendance: '95%',
    },
  ],

  mentorChats: [
    { id: 'MC-1', usn: '2MM23CS001', mentorId: 'FAC-CSE-104', sender: 'teacher', senderName: 'Prof. Ananya Sharma', text: 'Aarav, your Machine Learning attendance is 71%. Please attend the next 4 lectures to cross the Master threshold.', time: '2026-11-23 15:10' },
    { id: 'MC-2', usn: '2MM23CS001', mentorId: 'FAC-CSE-104', sender: 'student', senderName: 'Aarav Patil', text: 'Noted Maam! I have also submitted my OD form for Hack Valley and uploaded Lab Exp 05.', time: '2026-11-23 15:24' },
  ],

  certificates: [
    { id: 'CERT-1001', usn: '2MM23CS001', studentName: 'Aarav Patil', dept: 'CSE', type: 'Bonafide Certificate', purpose: 'Education Loan & Internship Verification', requestDate: '2026-11-21', status: 'Approved & Digitally Signed', signedBy: 'Prof. S. V. Kulkarni (Principal)', certHash: 'AIET-SIG-99281A' },
    { id: 'CERT-1002', usn: '2MM23CS001', studentName: 'Aarav Patil', dept: 'CSE', type: 'NOC (Internship)', purpose: 'Winter Research Internship at Bengaluru', requestDate: '2026-11-24', status: 'Pending', signedBy: '', certHash: '' },
  ],

  libraryBooks: [
    { id: 'BK-101', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Book', copies: 6, available: 4, eJournalUrl: '' },
    { id: 'BK-102', title: 'IEEE Transactions on Software Engineering (2026)', author: 'IEEE Digital Library', category: 'E-Journal', copies: 99, available: 99, eJournalUrl: 'https://ieeexplore.ieee.org' },
    { id: 'BK-103', title: 'Deep Learning with Python (2nd Ed)', author: 'François Chollet', category: 'Book', copies: 5, available: 3, eJournalUrl: '' },
  ],

  libraryIssues: [
    { id: 'ISS-1', bookId: 'BK-101', bookTitle: 'Designing Data-Intensive Applications', usn: '2MM23CS001', studentName: 'Aarav Patil', issueDate: '2026-11-10', dueDate: '2026-11-25', fine: 0, status: 'Issued', noDues: false },
    { id: 'ISS-2', bookId: 'BK-103', bookTitle: 'Deep Learning with Python (2nd Ed)', usn: '2MM23CS003', studentName: 'Rohan Kulkarni', issueDate: '2026-10-20', dueDate: '2026-11-04', fine: 120, status: 'Overdue', noDues: false },
  ],

  placements: [
    { id: 'PL-1', company: 'NovaTech Systems', role: 'Software Development Engineer', ctc: '12.5 LPA', minCgpa: 7.5, maxBacklogs: 0, driveDate: '2026-12-22', applicants: ['2MM23CS001', '2MM23CS002'], offers: ['2MM23CS002'] },
    { id: 'PL-2', company: 'FinEdge Cloud', role: 'Full Stack Intern + PPO', ctc: '8.0 LPA / 35k Stipend', minCgpa: 7.0, maxBacklogs: 0, driveDate: '2026-12-28', applicants: ['2MM23CS001'], offers: [] },
  ],

  aicteActivities: [
    { id: 'AIC-1', usn: '2MM23CS001', title: 'National Level 24-Hr Hackathon (Hack Valley)', category: 'Technical Innovation', points: 25, certFile: 'HackValley_Cert.pdf', status: 'Verified' },
    { id: 'AIC-2', usn: '2MM23CS001', title: 'Rural Digital Literacy Camp (Belagavi)', category: 'Community Outreach', points: 20, certFile: 'RuralCamp_Cert.pdf', status: 'Verified' },
    { id: 'AIC-3', usn: '2MM23CS001', title: 'AWS Cloud Practitioner Workshop', category: 'Skill Certification', points: 27, certFile: 'AWS_Workshop.pdf', status: 'Verified' },
  ],

  startupPitches: [
    { id: 'STP-1', usn: '2MM23CS001', studentName: 'Aarav Patil', title: 'MotoSync Smart Fleet Companion', domain: 'Mobility / IoT', pitchSummary: 'Unified vehicle health score, digital RTO vault, OCR odometer tracking, and predictive maintenance alerts.', status: 'Shortlisted for Incubation', mentorFeedback: 'Strong UI & market fit. Prepare revenue model for demo day.' },
  ],

  researchPapers: [
    { id: 'RES-1', teacherId: 'FAC-CSE-104', type: 'Journal', title: 'Adaptive Micro-Frontend Synchronization for Smart Campuses', venue: 'IEEE Access (Scopus Q1)', year: '2026', doiOrPatentNo: '10.1109/ACCESS.2026.9012', grantAmount: '₹4.5 Lakhs (VGST)' },
    { id: 'RES-2', teacherId: 'FAC-CSE-104', type: 'Patent', title: 'Solar-Powered Edge Cold Storage Telemetry System', venue: 'Indian Patent Office (Published)', year: '2026', doiOrPatentNo: 'IN-202641019283', grantAmount: '₹1.8 Lakhs' },
  ],

  tickets: [
    { id: 'TK-1', usn: '2MM23CS001', studentName: 'Aarav Patil', category: 'Lab Infrastructure', subject: 'Install Node.js 22 on Lab-2 Workstations', message: 'Several systems in CS Lab-2 still run Node 16; Vite 6 requires Node 20+.', rating: 5, status: 'In Progress', reply: 'IT team scheduled upgrade for Friday morning.' },
  ],
};

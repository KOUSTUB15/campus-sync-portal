import React from 'react';
import { GraduationCap, AlertTriangle, BookOpen, Calendar, FileCheck2 } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader, EmptyState, DownloadFileButton } from '@campus/shared-core';

export default function SemesterHub() {
  const { db, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.usn === currentUser.refId);

  if (!student) {
    return <EmptyState title="Student Profile Not Found" message="Contact College Admin to verify your USN record." />;
  }

  const isYearBack = student.eligibilityStatus === 'Year Back';
  const semSubjects = db.subjects.filter((s) => s.semester === student.semester && (!s.dept || s.dept === student.dept));
  const myHallTickets = db.hallTickets.filter((h) => h.usn === student.usn);
  const myCerts = db.certificates.filter((c) => c.usn === student.usn);

  const getAttendancePct = (subId) => {
    const logs = db.attendanceLogs.filter((l) => l.subjectId === subId && l.records[student.usn]);
    if (!logs.length) return null;
    const pres = logs.filter((l) => l.records[student.usn] === 'Present').length;
    return Math.round((pres / logs.length) * 100);
  };

  return (
    <div className="stack">
      <PageHeader
        title={`${student.name} — ${student.semester} (Year ${student.academicYearLevel})`}
        subtitle={`USN: ${student.usn} • Dept: ${student.dept} • Eligibility: ${student.eligibilityStatus}`}
      />

      {isYearBack && (
        <div className="alert-panel alert-danger">
          <div className="row">
            <AlertTriangle size={22} color="var(--danger)" />
            <div>
              <strong>YEAR BACK STATUS — SAME ACADEMIC YEAR PORTAL ACTIVE</strong>
              <div className="card-sub">
                Your HOD has marked your status as <strong>Year Back</strong>. Your portal remains locked to <strong>Year {student.academicYearLevel} ({student.semester})</strong> until you clear backlogs and HOD grants next-year eligibility.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-4">
        <StatCard label="Current Semester" value={student.semester} hint={`Academic Year ${student.academicYearLevel}`} icon={GraduationCap} />
        <StatCard label="Semester Subjects" value={semSubjects.length} hint={`Dept: ${student.dept}`} icon={BookOpen} />
        <StatCard label="Hall Tickets" value={myHallTickets.length} hint="Uploaded by HOD" icon={FileCheck2} />
        <StatCard label="Certificates" value={myCerts.length} hint="Uploaded by College" icon={Calendar} />
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>My {student.semester} Subjects, Attendance & Faculty Marks</div>
        {semSubjects.length === 0 ? (
          <EmptyState title={`No Subjects Listed for ${student.dept} ${student.semester}`} message="Subjects allotted by your HOD / College Admin for this semester will appear here." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Subject Name</th><th>Type</th><th>Faculty</th><th>Attendance</th><th>Faculty Marks</th></tr></thead>
              <tbody>
                {semSubjects.map((s) => {
                  const pct = getAttendancePct(s.id);
                  const mk = db.subjectMarks.find((m) => m.subjectId === s.id && m.usn === student.usn);
                  return (
                    <tr key={s.id}>
                      <td><code>{s.code}</code></td>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="badge">{s.type}</span></td>
                      <td>{s.facultyName}</td>
                      <td>{pct === null ? 'No classes logged' : <span className={`badge ${pct < db.masterSettings.minAttendancePercent ? 'badge-danger' : 'badge-success'}`}>{pct}%</span>}</td>
                      <td>{mk ? <strong>IA: {mk.iaMarks} | Lab: {mk.labMarks} | Total: {mk.totalMarks}/{mk.maxMarks}</strong> : 'Pending'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card stack">
          <div className="card-title">Timetable & Faculty Replacement ({student.semester})</div>
          {db.timetable.entries.filter((e) => e.semester === student.semester && (!e.dept || e.dept === student.dept)).length === 0 ? (
            <EmptyState title="Timetable Not Published Yet" message="Once HOD updates the timetable grid, classes and any faculty replacements will display here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Day</th><th>Slot</th><th>Subject</th><th>Faculty / Replacement</th></tr></thead>
                <tbody>
                  {db.timetable.entries
                    .filter((e) => e.semester === student.semester && (!e.dept || e.dept === student.dept))
                    .map((e) => (
                      <tr key={e.id}>
                        <td><strong>{e.day}</strong></td>
                        <td>{e.slot}</td>
                        <td>{e.subjectName}<div className="card-sub">{e.room}</div></td>
                        <td>
                          {e.facultyName}
                          {e.replacementFacultyName && (
                            <div className="badge badge-warning" style={{ marginTop: 3 }}>Replaced by: {e.replacementFacultyName}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card stack">
          <div className="card-title">Hall Tickets (HOD) & Certificates (College)</div>
          {myHallTickets.length === 0 && myCerts.length === 0 ? (
            <EmptyState title="No Documents Uploaded Yet" message="Hall Tickets uploaded by HOD and Certificates uploaded by College will appear here for download." />
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              {myHallTickets.map((h) => (
                <div key={h.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 5, background: 'var(--surface-elevated)' }}>
                  <div><strong>Hall Ticket: {h.examTitle}</strong><div className="card-sub">{h.semester} • Uploaded by {h.uploadedBy}</div></div>
                  <DownloadFileButton fileName={h.fileName} dataUrl={h.fileDataUrl} label="Download" />
                </div>
              ))}
              {myCerts.map((c) => (
                <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 5, background: 'var(--surface-elevated)' }}>
                  <div><strong>{c.type}</strong><div className="card-sub">{c.remarks || c.uploadedAt}</div></div>
                  <DownloadFileButton fileName={c.fileName} dataUrl={c.fileDataUrl} label="Download" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

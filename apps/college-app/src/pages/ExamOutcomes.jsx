import React, { useState } from 'react';
import { Award, AlertTriangle, XCircle } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader, EmptyState, BarChart } from '@campus/shared-core';

export default function ExamOutcomes() {
  const { db } = useCampusStore();
  const [filter, setFilter] = useState('passed');

  // Compute each student's exam standing from studentSemesterResults + subjectMarks + eligibilityStatus
  const classified = db.students.map((s) => {
    const semRes = db.studentSemesterResults.filter((r) => r.usn === s.usn);
    const facMarks = db.subjectMarks.filter((m) => m.usn === s.usn);
    const backlogsFromStudent = semRes.filter((r) => r.resultStatus === 'Backlog').map((r) => r.subjectName);
    const backlogsFromFac = facMarks.filter((m) => m.status === 'Fail').map((m) => m.subjectName);
    const backlogSubjects = [...new Set([...backlogsFromStudent, ...backlogsFromFac])];
    const hasResults = semRes.length > 0 || facMarks.length > 0;
    const isYearBack = s.eligibilityStatus === 'Year Back';
    const isPassed = !isYearBack && hasResults && backlogSubjects.length === 0;
    return { ...s, backlogSubjects, hasResults, isYearBack, isPassed };
  });

  const passedList = classified.filter((s) => s.isPassed);
  const backlogList = classified.filter((s) => s.backlogSubjects.length > 0);
  const yearBackList = classified.filter((s) => s.isYearBack);

  const activeList = filter === 'passed' ? passedList : filter === 'backlogs' ? backlogList : yearBackList;

  return (
    <div className="stack">
      <PageHeader title="Exam Passed, Backlogs & Year Back Students" subtitle="Live consolidated list derived from Faculty Marks, Student Entered Results, and HOD Eligibility decisions." />

      <div className="grid-3">
        <StatCard label="Exam Passed Students" value={passedList.length} icon={Award} tone="success" />
        <StatCard label="Students with Backlogs" value={backlogList.length} icon={AlertTriangle} tone="warning" />
        <StatCard label="Year Back Students" value={yearBackList.length} icon={XCircle} tone="danger" />
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Outcomes Visual Breakdown</div>
        <BarChart
          items={[
            { label: 'Exam Passed', value: passedList.length, color: 'var(--success)' },
            { label: 'With Backlogs', value: backlogList.length, color: 'var(--warning)' },
            { label: 'Year Back', value: yearBackList.length, color: 'var(--danger)' },
          ]}
        />
      </div>

      <div className="tabs">
        <button className={`tab-btn ${filter === 'passed' ? 'active' : ''}`} onClick={() => setFilter('passed')}>Exam Passed ({passedList.length})</button>
        <button className={`tab-btn ${filter === 'backlogs' ? 'active' : ''}`} onClick={() => setFilter('backlogs')}>Backlog Students ({backlogList.length})</button>
        <button className={`tab-btn ${filter === 'yearback' ? 'active' : ''}`} onClick={() => setFilter('yearback')}>Year Back Students ({yearBackList.length})</button>
      </div>

      <div className="card">
        {activeList.length === 0 ? (
          <EmptyState title="No Students in This Category" message="Once Faculty enter subject marks, Students submit semester results, or HOD sets Year Back status, records populate automatically." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>USN</th><th>Student Name</th><th>Dept / Sem</th><th>Backlog Subjects</th><th>Eligibility Status</th></tr></thead>
              <tbody>
                {activeList.map((s) => (
                  <tr key={s.usn}>
                    <td><code>{s.usn}</code></td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.dept} • {s.semester} (Yr {s.academicYearLevel})</td>
                    <td>{s.backlogSubjects.length ? s.backlogSubjects.join(', ') : 'None (All Clear)'}</td>
                    <td><span className={`badge ${s.isYearBack ? 'badge-danger' : s.backlogSubjects.length ? 'badge-warning' : 'badge-success'}`}>{s.isYearBack ? 'Year Back' : s.backlogSubjects.length ? 'Backlogs' : 'Passed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

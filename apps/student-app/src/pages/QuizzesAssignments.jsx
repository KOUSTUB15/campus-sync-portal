import React, { useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function QuizzesAssignments() {
  const { db, updateDb, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.usn === currentUser.refId);
  const [subTab, setSubTab] = useState('quizzes');
  const [answers, setAnswers] = useState({});
  const [subDraft, setSubDraft] = useState({});

  if (!student) return null;

  const semQuizzes = db.quizzes.filter((q) => q.semester === student.semester && q.isActive);
  const semAssignments = db.assignments.filter((a) => a.semester === student.semester);

  const submitQuiz = (qz) => {
    let score = 0;
    qz.questions.forEach((q, idx) => {
      if (answers[`${qz.id}_${idx}`] === q.answer) score += 1;
    });
    updateDb((prev) => ({
      ...prev,
      quizzes: prev.quizzes.map((item) =>
        item.id === qz.id
          ? {
              ...item,
              attempts: [
                ...item.attempts.filter((a) => a.usn !== student.usn),
                { usn: student.usn, studentName: student.name, score, total: qz.questions.length, submittedAt: new Date().toLocaleString() },
              ],
            }
          : item
      ),
    }), `Quiz completed! Your Score: ${score} / ${qz.questions.length}`);
  };

  const submitAssignment = (asgId) => {
    const text = subDraft[asgId]?.trim();
    if (!text) return;
    updateDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === asgId
          ? {
              ...a,
              submissions: [
                ...a.submissions.filter((s) => s.usn !== student.usn),
                { usn: student.usn, studentName: student.name, answerText: text, submittedAt: new Date().toLocaleString(), marks: null },
              ],
            }
          : a
      ),
    }), 'Assignment submitted to subject faculty!');
    setSubDraft({ ...subDraft, [asgId]: '' });
  };

  return (
    <div className="stack">
      <PageHeader title="Quizzes & Assignment / Lab Questions" subtitle={`Showing active quizzes & assignments posted by faculty for ${student.semester}.`} />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'quizzes' ? 'active' : ''}`} onClick={() => setSubTab('quizzes')}>Active Quizzes ({semQuizzes.length})</button>
        <button className={`tab-btn ${subTab === 'assignments' ? 'active' : ''}`} onClick={() => setSubTab('assignments')}>Assignment & Lab Questions ({semAssignments.length})</button>
      </div>

      {subTab === 'quizzes' && (
        <div className="stack">
          {semQuizzes.length === 0 ? (
            <EmptyState title="No Active Quizzes" message="Quizzes uploaded by your subject faculty will appear here." />
          ) : (
            semQuizzes.map((qz) => {
              const myAttempt = qz.attempts.find((a) => a.usn === student.usn);
              return (
                <div key={qz.id} className="card stack">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div><strong>{qz.title}</strong><div className="card-sub">{qz.subjectName} • Session: {qz.sessionName} ({qz.sessionDate}) • By {qz.facultyName}</div></div>
                    {myAttempt && <span className="badge badge-success">Marks Obtained: {myAttempt.score}/{myAttempt.total}</span>}
                  </div>
                  {qz.questions.map((q, qi) => (
                    <div key={qi} style={{ padding: 10, borderRadius: 5, background: 'var(--surface-elevated)' }}>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>{qi + 1}. {q.q}</div>
                      <div className="grid-2" style={{ gap: 8 }}>
                        {q.options.map((opt, oi) => (
                          <label key={oi} className="row" style={{ fontSize: 13, cursor: 'pointer' }}>
                            <input type="radio" name={`${qz.id}_${qi}`} checked={answers[`${qz.id}_${qi}`] === oi} onChange={() => setAnswers({ ...answers, [`${qz.id}_${qi}`]: oi })} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div><button className="btn btn-primary" onClick={() => submitQuiz(qz)}><CheckCircle2 size={15} /> Submit Quiz & Get Marks</button></div>
                </div>
              );
            })
          )}
        </div>
      )}

      {subTab === 'assignments' && (
        <div className="stack">
          {semAssignments.length === 0 ? (
            <EmptyState title="No Assignments Posted" message="Assignment and Lab questions from your subject faculty will appear here." />
          ) : (
            semAssignments.map((a) => {
              const mySub = a.submissions.find((s) => s.usn === student.usn);
              return (
                <div key={a.id} className="card stack">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div><strong>{a.title}</strong> <span className="badge">{a.type}</span><div className="card-sub">{a.subjectName} • By {a.facultyName} • Due: {a.dueDate}</div></div>
                    {mySub ? <span className="badge badge-success">Submitted {mySub.marks !== null ? `• Marks: ${mySub.marks}/${a.maxMarks}` : '(Pending Grade)'}</span> : <span className="badge badge-warning">Pending</span>}
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{a.questionText}</p>
                  <div className="row">
                    <input className="input" style={{ flex: 1 }} placeholder="Enter your answer or GitHub/Drive submission link..." value={subDraft[a.id] || ''} onChange={(e) => setSubDraft({ ...subDraft, [a.id]: e.target.value })} />
                    <button className="btn btn-primary" onClick={() => submitAssignment(a.id)}><Upload size={15} /> Submit</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function FacultyQuizzesAssignments() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('quizzes');

  const mySubjects = db.subjects.filter((s) => s.facultyId === currentUser.refId);
  const [selectedSubId, setSelectedSubId] = useState(mySubjects[0]?.id || '');
  const activeSub = mySubjects.find((s) => s.id === selectedSubId) || mySubjects[0];

  // Quiz state
  const emptyQuiz = { title: '', sessionName: '', sessionDate: new Date().toISOString().slice(0, 10), durationMins: 15, isActive: true, questions: [{ q: '', options: ['', '', '', ''], answer: 0 }] };
  const [qForm, setQForm] = useState(emptyQuiz);
  const [editQuizId, setEditQuizId] = useState(null);

  // Assignment state
  const emptyAsg = { title: '', questionText: '', dueDate: '', maxMarks: 20, type: 'Assignment' };
  const [aForm, setAForm] = useState(emptyAsg);
  const [editAsgId, setEditAsgId] = useState(null);

  if (!activeSub) {
    return <EmptyState title="No Allotted Subjects" message="Ask HOD or College Admin to allot your subjects to manage Quizzes and Assignments." />;
  }

  const updateQuestion = (idx, field, val) => {
    setQForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === idx ? { ...q, [field]: val } : q)),
    }));
  };

  const updateOption = (qIdx, oIdx, val) => {
    setQForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? val : o)) } : q)),
    }));
  };

  const saveQuiz = (e) => {
    e.preventDefault();
    const rec = {
      id: editQuizId || `QZ-${Date.now().toString().slice(-4)}`,
      subjectId: activeSub.id,
      subjectName: `${activeSub.code} ${activeSub.name}`,
      semester: activeSub.semester,
      facultyId: currentUser.refId,
      facultyName: currentUser.name,
      ...qForm,
      durationMins: Number(qForm.durationMins) || 15,
      attempts: editQuizId ? (db.quizzes.find((x) => x.id === editQuizId)?.attempts || []) : [],
    };
    updateDb((prev) => ({
      ...prev,
      quizzes: editQuizId ? prev.quizzes.map((x) => (x.id === editQuizId ? rec : x)) : [rec, ...prev.quizzes],
    }), editQuizId ? 'Quiz & Session updated!' : 'Quiz uploaded for students!');
    setQForm(emptyQuiz);
    setEditQuizId(null);
  };

  const saveAssignment = (e) => {
    e.preventDefault();
    const rec = {
      id: editAsgId || `ASG-${Date.now().toString().slice(-4)}`,
      subjectId: activeSub.id,
      subjectName: `${activeSub.code} ${activeSub.name}`,
      semester: activeSub.semester,
      facultyId: currentUser.refId,
      facultyName: currentUser.name,
      ...aForm,
      maxMarks: Number(aForm.maxMarks) || 20,
      submissions: editAsgId ? (db.assignments.find((x) => x.id === editAsgId)?.submissions || []) : [],
    };
    updateDb((prev) => ({
      ...prev,
      assignments: editAsgId ? prev.assignments.map((x) => (x.id === editAsgId ? rec : x)) : [rec, ...prev.assignments],
    }), editAsgId ? 'Assignment question updated!' : 'Assignment question posted to Student Portal!');
    setAForm(emptyAsg);
    setEditAsgId(null);
  };

  const gradeSubmission = (asgId, usn, marks) => {
    updateDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === asgId
          ? { ...a, submissions: a.submissions.map((s) => (s.usn === usn ? { ...s, marks: Number(marks) } : s)) }
          : a
      ),
    }), `Graded assignment for ${usn}`);
  };

  const myQuizzes = db.quizzes.filter((q) => q.subjectId === activeSub.id);
  const myAssignments = db.assignments.filter((a) => a.subjectId === activeSub.id);

  return (
    <div className="stack">
      <PageHeader
        title="Quizzes & Assignment Questions (My Subjects)"
        subtitle="Upload, edit, delete quizzes + quiz sessions and assignment/lab questions strictly for your allotted subjects."
        actions={
          <select className="select" style={{ width: 290 }} value={activeSub.id} onChange={(e) => setSelectedSubId(e.target.value)}>
            {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name} ({s.semester})</option>)}
          </select>
        }
      />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'quizzes' ? 'active' : ''}`} onClick={() => setSubTab('quizzes')}>Quiz Upload & Sessions ({myQuizzes.length})</button>
        <button className={`tab-btn ${subTab === 'assignments' ? 'active' : ''}`} onClick={() => setSubTab('assignments')}>Assignment / Lab Questions ({myAssignments.length})</button>
      </div>

      {subTab === 'quizzes' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveQuiz}>
            <div className="card-title">{editQuizId ? 'Edit Quiz & Session' : 'Upload New Quiz & Session'}</div>
            <div className="grid-4">
              <input className="input" placeholder="Quiz Title" value={qForm.title} onChange={(e) => setQForm({ ...qForm, title: e.target.value })} required />
              <input className="input" placeholder="Quiz Session (e.g. Session 1 - Unit 2)" value={qForm.sessionName} onChange={(e) => setQForm({ ...qForm, sessionName: e.target.value })} required />
              <input type="date" className="input" value={qForm.sessionDate} onChange={(e) => setQForm({ ...qForm, sessionDate: e.target.value })} required />
              <label className="row" style={{ fontSize: 13 }}>
                <input type="checkbox" checked={qForm.isActive} onChange={(e) => setQForm({ ...qForm, isActive: e.target.checked })} />
                Session Active for Students
              </label>
            </div>

            {qForm.questions.map((q, qi) => (
              <div key={qi} style={{ padding: 12, borderRadius: 5, background: 'var(--surface-elevated)' }} className="stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>Question {qi + 1}</strong>
                  {qForm.questions.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => setQForm((p) => ({ ...p, questions: p.questions.filter((_, idx) => idx !== qi) }))}>Remove</button>
                  )}
                </div>
                <input className="input" placeholder="Enter question text..." value={q.q} onChange={(e) => updateQuestion(qi, 'q', e.target.value)} required />
                <div className="grid-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="row" style={{ flexWrap: 'nowrap' }}>
                      <input type="radio" name={`ans_${qi}`} checked={q.answer === oi} onChange={() => updateQuestion(qi, 'answer', oi)} title="Mark as correct option" />
                      <input className="input" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} required />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="row">
              <button type="button" className="btn" onClick={() => setQForm((p) => ({ ...p, questions: [...p.questions, { q: '', options: ['', '', '', ''], answer: 0 }] }))}>+ Add Question</button>
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editQuizId ? 'Update Quiz' : 'Upload Quiz'}</button>
              {editQuizId && <button type="button" className="btn" onClick={() => { setEditQuizId(null); setQForm(emptyQuiz); }}>Cancel</button>}
            </div>
          </form>

          {myQuizzes.map((qz) => (
            <div key={qz.id} className="card stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{qz.title}</strong> <span className={`badge ${qz.isActive ? 'badge-success' : 'badge-warning'}`}>{qz.isActive ? 'Session Active' : 'Closed'}</span>
                  <div className="card-sub">Session: {qz.sessionName} • {qz.sessionDate} • {qz.questions.length} Question(s) • {qz.attempts.length} Student Attempt(s)</div>
                </div>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => { setEditQuizId(qz.id); setQForm(qz); }}><Edit3 size={13} /> Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, quizzes: prev.quizzes.filter((x) => x.id !== qz.id) }), 'Quiz deleted')}><Trash2 size={13} /></button>
                </div>
              </div>
              {qz.attempts.length > 0 && (
                <div className="row">
                  {qz.attempts.map((at) => <span key={at.usn} className="badge badge-info">{at.studentName} ({at.usn}): {at.score}/{at.total}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {subTab === 'assignments' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveAssignment}>
            <div className="card-title">{editAsgId ? 'Edit Assignment / Lab Question' : 'Add Assignment / Lab Question'}</div>
            <div className="grid-4">
              <input className="input" placeholder="Title" value={aForm.title} onChange={(e) => setAForm({ ...aForm, title: e.target.value })} required />
              <select className="select" value={aForm.type} onChange={(e) => setAForm({ ...aForm, type: e.target.value })}>
                <option>Assignment</option><option>Lab Task</option>
              </select>
              <input type="date" className="input" value={aForm.dueDate} onChange={(e) => setAForm({ ...aForm, dueDate: e.target.value })} required />
              <input type="number" className="input" placeholder="Max Marks" value={aForm.maxMarks} onChange={(e) => setAForm({ ...aForm, maxMarks: e.target.value })} />
            </div>
            <textarea className="textarea" placeholder="Write complete assignment or lab questions here..." value={aForm.questionText} onChange={(e) => setAForm({ ...aForm, questionText: e.target.value })} required />
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editAsgId ? 'Update Assignment' : 'Post Assignment'}</button>
              {editAsgId && <button type="button" className="btn" onClick={() => { setEditAsgId(null); setAForm(emptyAsg); }}>Cancel</button>}
            </div>
          </form>

          {myAssignments.map((a) => (
            <div key={a.id} className="card stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div><strong>{a.title}</strong> <span className="badge">{a.type}</span><div className="card-sub">Due: {a.dueDate} • Max: {a.maxMarks}</div></div>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => { setEditAsgId(a.id); setAForm(a); }}><Edit3 size={13} /></button>
                  <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, assignments: prev.assignments.filter((x) => x.id !== a.id) }), 'Assignment deleted')}><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="card-sub">{a.questionText}</p>
              {a.submissions.length > 0 && (
                <div className="stack" style={{ gap: 6 }}>
                  {a.submissions.map((sub) => (
                    <div key={sub.usn} className="row" style={{ justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--surface-elevated)' }}>
                      <div><strong>{sub.studentName} ({sub.usn})</strong> — {sub.answerText || sub.linkUrl}</div>
                      <input type="number" className="input" style={{ width: 82, padding: '4px 8px' }} placeholder="Marks" defaultValue={sub.marks ?? ''} onBlur={(e) => e.target.value !== '' && gradeSubmission(a.id, sub.usn, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

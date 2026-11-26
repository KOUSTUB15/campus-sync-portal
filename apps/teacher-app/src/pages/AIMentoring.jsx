import React, { useState } from 'react';
import { Sparkles, Send, AlertTriangle, FileText } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function AIMentoring() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('ai');
  const [topic, setTopic] = useState('React Hooks & Micro-Frontends');
  const [subject, setSubject] = useState('Full Stack Web Dev (21CS51)');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [generatedOutput, setGeneratedOutput] = useState(null);

  const [selectedUsn, setSelectedUsn] = useState(db.students[0]?.usn || '2MM23CS001');
  const [chatText, setChatText] = useState('');

  const minAtt = db.masterSettings.minAttendancePercent;

  const generateAIQuizAndQP = () => {
    const questions = [
      { q: `In ${topic}, what is the primary architectural benefit of modular state isolation?`, options: ['Zero network latency', 'Independent deployments & cleaner debugging', 'Removes HTML DOM', 'Disables caching'], answer: 1 },
      { q: `Which approach best optimizes re-renders in ${topic} (${difficulty})?`, options: ['Memoizing expensive selectors & stable keys', 'Mutating global window variables', 'Reloading the page on click', 'Inline blocking loops'], answer: 0 },
      { q: `How should cross-app data consistency be validated in ${topic}?`, options: ['Timestamped version reconciliation', 'Ignoring storage events', 'Hardcoding static arrays', 'Manual page refresh only'], answer: 0 },
    ];
    const pptSlides = [
      `Slide 1: Title — ${topic} (${subject})`,
      `Slide 2: Core Motivation & Industry Architecture`,
      `Slide 3: Deep Dive Diagram & Component Lifecycle`,
      `Slide 4: Live Code Walkthrough & Edge Cases`,
      `Slide 5: Summary, Exam Rubric & Practice Questions`,
    ];
    const qp = [
      `Q1 (10M): Explain the architecture and lifecycle of ${topic} with a neat block diagram.`,
      `Q2 (10M): Compare traditional monolithic patterns vs modern ${topic} implementation.`,
      `Q3 (05M): Write a clean implementation snippet demonstrating error handling in ${topic}.`,
    ];
    setGeneratedOutput({ topic, subject, questions, pptSlides, qp });
  };

  const publishGeneratedQuiz = () => {
    if (!generatedOutput) return;
    updateDb((prev) => ({
      ...prev,
      quizzes: [{
        id: `QZ-${Date.now().toString().slice(-4)}`,
        subject: generatedOutput.subject,
        title: `AI Quiz: ${generatedOutput.topic}`,
        createdBy: currentUser?.name || 'Prof. Ananya Sharma',
        questions: generatedOutput.questions,
        attempts: [],
      }, ...prev.quizzes],
    }), 'AI-Generated Quiz published directly to Student App!');
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    updateDb((prev) => ({
      ...prev,
      mentorChats: [...prev.mentorChats, {
        id: `MC-${Date.now().toString().slice(-4)}`,
        usn: selectedUsn,
        mentorId: currentUser?.code || 'FAC-CSE-104',
        sender: 'teacher',
        senderName: currentUser?.name || 'Prof. Ananya Sharma',
        text: chatText.trim(),
        time: new Date().toLocaleString(),
      }],
    }), 'Message sent to Mentee (live in Student App)');
    setChatText('');
  };

  const reviewStartup = (id, status) => {
    updateDb((prev) => ({
      ...prev,
      startupPitches: prev.startupPitches.map((p) => (p.id === id ? { ...p, status } : p)),
    }), `Startup pitch marked "${status}"`);
  };

  const chats = db.mentorChats.filter((c) => c.usn === selectedUsn);

  return (
    <div className="stack">
      <PageHeader title="AI for Teachers & Student Mentoring" subtitle="AI Quiz & QP Generator, Auto-Grading & PPT Maker, At-Risk Student Insights, and Live Proctor Mentee Logs." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'ai' ? 'active' : ''}`} onClick={() => setSubTab('ai')}>AI Quiz, QP, PPT & At-Risk Insights</button>
        <button className={`tab-btn ${subTab === 'mentor' ? 'active' : ''}`} onClick={() => setSubTab('mentor')}>Mentorship / Proctor Logs & Chat</button>
      </div>

      {subTab === 'ai' && (
        <div className="stack">
          <div className="card stack">
            <div className="row"><Sparkles size={18} color="var(--accent)" /><span className="card-title">AI Quiz, Question Paper & PPT Slide Generator</span></div>
            <div className="grid-3">
              <div className="field"><label>Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div className="field"><label>Topic / Module</label><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
              <div className="field">
                <label>Bloom's Difficulty</label>
                <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>Foundational</option><option>Intermediate</option><option>Advanced / HOTS</option>
                </select>
              </div>
            </div>
            <div className="row">
              <button className="btn btn-primary" onClick={generateAIQuizAndQP}><Sparkles size={15} /> Generate Quiz + QP + PPT Outline</button>
              {generatedOutput && (
                <button className="btn btn-success" onClick={publishGeneratedQuiz}>Publish Quiz to Student App</button>
              )}
            </div>

            {generatedOutput && (
              <div className="grid-3" style={{ marginTop: 10 }}>
                <div className="card" style={{ background: 'var(--surface-elevated)' }}>
                  <div className="card-title" style={{ marginBottom: 8 }}>Auto-Graded MCQ Quiz</div>
                  {generatedOutput.questions.map((q, i) => (
                    <div key={i} className="card-sub" style={{ marginBottom: 8 }}><strong>{i + 1}. {q.q}</strong><br />Ans: {q.options[q.answer]}</div>
                  ))}
                </div>
                <div className="card" style={{ background: 'var(--surface-elevated)' }}>
                  <div className="card-title" style={{ marginBottom: 8 }}>Descriptive Question Paper</div>
                  {generatedOutput.qp.map((line, i) => <div key={i} className="card-sub" style={{ marginBottom: 8 }}>{line}</div>)}
                </div>
                <div className="card" style={{ background: 'var(--surface-elevated)' }}>
                  <div className="card-title" style={{ marginBottom: 8 }}>PPT Slide Deck Outline</div>
                  {generatedOutput.pptSlides.map((s, i) => <div key={i} className="card-sub" style={{ marginBottom: 6 }}><FileText size={12} style={{ display: 'inline' }} /> {s}</div>)}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="row" style={{ marginBottom: 12 }}><AlertTriangle size={18} color="var(--danger)" /><span className="card-title">AI At-Risk Student Insights (Computed Live from Master Threshold: {minAtt}%)</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Avg Att</th><th>Avg IA</th><th>Backlogs</th><th>AI Risk Diagnosis & Action</th></tr></thead>
                <tbody>
                  {db.students.map((s) => {
                    const attVals = Object.values(s.attendance);
                    const iaVals = Object.values(s.iaMarks);
                    const avgAtt = Math.round(attVals.reduce((a, b) => a + b, 0) / attVals.length);
                    const avgIa = Math.round(iaVals.reduce((a, b) => a + b, 0) / iaVals.length);
                    const risk = avgAtt < minAtt || avgIa < 25 || s.backlogs > 0 ? 'High Risk' : avgAtt < minAtt + 5 ? 'Watchlist' : 'Healthy';
                    return (
                      <tr key={s.usn}>
                        <td><strong>{s.name}</strong><div className="card-sub">{s.usn}</div></td>
                        <td>{avgAtt}%</td>
                        <td>{avgIa}/{db.masterSettings.iaMaxMarks}</td>
                        <td>{s.backlogs}</td>
                        <td>
                          <span className={`badge ${risk === 'High Risk' ? 'badge-danger' : risk === 'Watchlist' ? 'badge-warning' : 'badge-success'}`}>{risk}</span>
                          <div className="card-sub" style={{ marginTop: 3 }}>
                            {risk === 'High Risk' ? 'Schedule parent call & remedial lab coaching immediately.' : risk === 'Watchlist' ? 'Monitor upcoming IA-2 score.' : 'Eligible for honors & placement prep.'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'mentor' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div className="card-title">Assigned Mentees & Live Proctor Chat</div>
              <select className="select" style={{ width: 200 }} value={selectedUsn} onChange={(e) => setSelectedUsn(e.target.value)}>
                {db.students.map((s) => <option key={s.usn} value={s.usn}>{s.name} ({s.usn})</option>)}
              </select>
            </div>
            <div className="chat-box">
              {chats.length === 0 && <div className="card-sub">No mentorship logs yet for this student.</div>}
              {chats.map((m) => (
                <div key={m.id} className={`chat-msg ${m.sender === 'teacher' ? 'me' : 'them'}`}>
                  <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>{m.senderName} • {m.time}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>
            <form className="row" onSubmit={sendChat}>
              <input className="input" style={{ flex: 1 }} placeholder="Send mentorship advice or attendance reminder..." value={chatText} onChange={(e) => setChatText(e.target.value)} />
              <button className="btn btn-primary" type="submit"><Send size={15} /> Send</button>
            </form>
          </div>

          <div className="card stack">
            <div className="card-title">Student Startup Pitches — Mentor Review</div>
            {db.startupPitches.map((p) => (
              <div key={p.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{p.title}</strong>
                  <span className="badge badge-info">{p.status}</span>
                </div>
                <div className="card-sub" style={{ margin: '6px 0' }}>By {p.studentName} ({p.domain}) — {p.pitchSummary}</div>
                <div className="row">
                  <button className="btn btn-sm btn-success" onClick={() => reviewStartup(p.id, 'Approved for Incubation')}>Approve</button>
                  <button className="btn btn-sm" onClick={() => reviewStartup(p.id, 'Needs Revision')}>Request Revision</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

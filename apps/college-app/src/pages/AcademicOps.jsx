import React, { useState } from 'react';
import { FileCheck2, BookOpen, Stamp, Plus, CheckCircle2 } from 'lucide-react';
import { useCampusStore, PageHeader, printDocumentHtml } from '@campus/shared-core';

export default function AcademicOps() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('exams');
  const [examForm, setExamForm] = useState({ subject: '', date: '', time: '09:30 AM - 11:00 AM', room: 'Block A - Hall 105', seatRange: '2MM23CS001 - 2MM23CS030' });
  const [bookForm, setBookForm] = useState({ title: '', author: '', category: 'Book', copies: 5 });

  const addExam = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      exams: [...prev.exams, {
        id: `EX-${Date.now().toString().slice(-4)}`,
        ...examForm,
        qpStatus: 'Under Moderation',
        hallTicketPublished: true,
        qpFile: `${examForm.subject.slice(0, 6)}_QP.pdf`,
        impQuestions: 'Pending faculty update',
      }],
    }), 'Exam schedule & seating published to Student & Teacher portals!');
    setExamForm({ subject: '', date: '', time: '09:30 AM - 11:00 AM', room: 'Block A - Hall 105', seatRange: '2MM23CS001 - 2MM23CS030' });
  };

  const toggleQpModeration = (id) => {
    updateDb((prev) => ({
      ...prev,
      exams: prev.exams.map((ex) =>
        ex.id === id ? { ...ex, qpStatus: ex.qpStatus === 'Moderated & Approved' ? 'Under Moderation' : 'Moderated & Approved' } : ex
      ),
    }), 'Updated QP moderation status');
  };

  const signCertificate = (id) => {
    const hash = `AIET-SIG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    updateDb((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c) =>
        c.id === id ? { ...c, status: 'Approved & Digitally Signed', signedBy: 'Prof. S. V. Kulkarni (Principal)', certHash: hash } : c
      ),
    }), 'Certificate digitally signed! Student can now download PDF.');
  };

  const printSignedCert = (c) => {
    printDocumentHtml(c.type, `
      <div class="doc-box">
        <h1>${db.masterSettings.institutionName}</h1>
        <div class="sub">${db.masterSettings.affiliation} • Academic Year ${db.masterSettings.academicYear}</div>
        <h2 style="text-align:center;text-transform:uppercase">${c.type}</h2>
        <p style="margin:24px 0;font-size:15px">
          This is to certify that <strong>${c.studentName}</strong> bearing USN <strong>${c.usn}</strong> is a bonafide student of the Department of <strong>${c.dept}</strong> during the academic year <strong>${db.masterSettings.academicYear}</strong>.
        </p>
        <p><strong>Purpose:</strong> ${c.purpose}</p>
        <p><strong>Certificate ID:</strong> ${c.id} &nbsp;|&nbsp; <strong>Digital Hash:</strong> ${c.certHash || 'PENDING'}</p>
        <div class="sig">
          <div>Date: ${c.requestDate}</div>
          <div style="text-align:right">
            <div class="stamp">DIGITALLY SIGNED</div><br/>
            <strong>${c.signedBy || 'Principal Office'}</strong>
          </div>
        </div>
      </div>
    `);
  };

  const addBook = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      libraryBooks: [...prev.libraryBooks, { id: `BK-${Date.now().toString().slice(-3)}`, ...bookForm, copies: Number(bookForm.copies), available: Number(bookForm.copies), eJournalUrl: '' }],
    }), 'Added title to Library Catalog');
    setBookForm({ title: '', author: '', category: 'Book', copies: 5 });
  };

  const clearReturnAndFine = (id) => {
    updateDb((prev) => ({
      ...prev,
      libraryIssues: prev.libraryIssues.map((i) => (i.id === id ? { ...i, fine: 0, status: 'Returned', noDues: true } : i)),
    }), 'Book returned & No-Dues cleared!');
  };

  return (
    <div className="stack">
      <PageHeader title="Academic Operations" subtitle="Exam Timetable & Seating, Hall Tickets & QP Moderation, Student Certificates with Digital Signature, and Library Management." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'exams' ? 'active' : ''}`} onClick={() => setSubTab('exams')}>Exams, Seating & QP Moderation</button>
        <button className={`tab-btn ${subTab === 'certs' ? 'active' : ''}`} onClick={() => setSubTab('certs')}>Certificates & Digital Sign</button>
        <button className={`tab-btn ${subTab === 'library' ? 'active' : ''}`} onClick={() => setSubTab('library')}>Library, E-Journals & No-Dues</button>
      </div>

      {subTab === 'exams' && (
        <div className="stack">
          <form className="card grid-3" onSubmit={addExam}>
            <input className="input" placeholder="Subject & Code" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} required />
            <input type="date" className="input" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} required />
            <input className="input" placeholder="Room / Hall" value={examForm.room} onChange={(e) => setExamForm({ ...examForm, room: e.target.value })} required />
            <input className="input" placeholder="Time Slot" value={examForm.time} onChange={(e) => setExamForm({ ...examForm, time: e.target.value })} />
            <input className="input" placeholder="USN Seating Range" value={examForm.seatRange} onChange={(e) => setExamForm({ ...examForm, seatRange: e.target.value })} />
            <button className="btn btn-primary" type="submit"><Plus size={15} /> Schedule & Release Hall Ticket</button>
          </form>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Exam Timetable, Seating Plan & QP Moderation</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Date & Time</th><th>Seating Room</th><th>USN Range</th><th>QP Moderation</th><th>Hall Ticket</th></tr></thead>
                <tbody>
                  {db.exams.map((ex) => (
                    <tr key={ex.id}>
                      <td><strong>{ex.subject}</strong></td>
                      <td>{ex.date}<div className="card-sub">{ex.time}</div></td>
                      <td>{ex.room}</td>
                      <td><code>{ex.seatRange}</code></td>
                      <td>
                        <button className={`btn btn-sm ${ex.qpStatus === 'Moderated & Approved' ? 'btn-success' : ''}`} onClick={() => toggleQpModeration(ex.id)}>
                          {ex.qpStatus}
                        </button>
                      </td>
                      <td><span className="badge badge-success">{ex.hallTicketPublished ? 'Published' : 'Draft'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'certs' && (
        <div className="card">
          <div className="row" style={{ marginBottom: 14 }}><Stamp size={18} color="var(--accent)" /><span className="card-title">Student Certificate Requests (Bonafide, Study, TC, Conduct, NOC)</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Student</th><th>Certificate Type</th><th>Purpose</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {db.certificates.map((c) => (
                  <tr key={c.id}>
                    <td><code>{c.id}</code></td>
                    <td><strong>{c.studentName}</strong><div className="card-sub">{c.usn} • {c.dept}</div></td>
                    <td>{c.type}</td>
                    <td>{c.purpose}</td>
                    <td><span className={`badge ${c.status.includes('Approved') ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                    <td className="row">
                      {!c.status.includes('Approved') && (
                        <button className="btn btn-sm btn-primary" onClick={() => signCertificate(c.id)}>
                          <FileCheck2 size={14} /> Approve & Sign
                        </button>
                      )}
                      <button className="btn btn-sm" onClick={() => printSignedCert(c)}>Preview PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'library' && (
        <div className="stack">
          <form className="card grid-4" onSubmit={addBook}>
            <input className="input" placeholder="Book / E-Journal Title" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />
            <input className="input" placeholder="Author / Publisher" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required />
            <select className="select" value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}>
              <option>Book</option><option>E-Journal</option><option>Reference</option>
            </select>
            <button className="btn btn-primary" type="submit"><BookOpen size={15} /> Add Catalog Item</button>
          </form>

          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Book Catalog & E-Journals</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Type</th><th>Available</th></tr></thead>
                  <tbody>
                    {db.libraryBooks.map((b) => (
                      <tr key={b.id}>
                        <td><strong>{b.title}</strong><div className="card-sub">{b.author}</div></td>
                        <td><span className="badge">{b.category}</span></td>
                        <td>{b.available}/{b.copies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Issue / Return, Fines & No-Dues Clearance</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Book</th><th>Fine</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {db.libraryIssues.map((i) => (
                      <tr key={i.id}>
                        <td><strong>{i.studentName}</strong><div className="card-sub">{i.usn}</div></td>
                        <td>{i.bookTitle}</td>
                        <td>₹{i.fine}</td>
                        <td><span className={`badge ${i.noDues ? 'badge-success' : i.fine > 0 ? 'badge-danger' : 'badge-warning'}`}>{i.noDues ? 'No-Dues Cleared' : i.status}</span></td>
                        <td>
                          {!i.noDues && (
                            <button className="btn btn-sm btn-success" onClick={() => clearReturnAndFine(i.id)}>
                              <CheckCircle2 size={14} /> Return & Clear
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

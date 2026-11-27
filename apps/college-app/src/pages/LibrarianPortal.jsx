import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader, EmptyState } from '@campus/shared-core';

export default function LibrarianPortal() {
  const { db, updateDb } = useCampusStore();
  const [issueForm, setIssueForm] = useState({ bookId: '', usn: '', dueDate: '' });

  const issueBook = (e) => {
    e.preventDefault();
    const book = db.libraryBooks.find((b) => b.id === issueForm.bookId);
    const student = db.students.find((s) => s.usn === issueForm.usn);
    if (!book || !student) return;
    if (book.availableCopies <= 0) { alert('No copies available'); return; }
    updateDb((prev) => ({
      ...prev,
      libraryBooks: prev.libraryBooks.map((b) => (b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b)),
      libraryIssues: [{
        id: `ISS-${Date.now().toString().slice(-4)}`,
        bookId: book.id,
        bookTitle: book.title,
        usn: student.usn,
        studentName: student.name,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: issueForm.dueDate,
        fine: 0,
        status: 'Issued',
      }, ...prev.libraryIssues],
    }), `Issued "${book.title}" to ${student.name}`);
    setIssueForm({ bookId: '', usn: '', dueDate: '' });
  };

  const returnBook = (issue) => {
    updateDb((prev) => ({
      ...prev,
      libraryBooks: prev.libraryBooks.map((b) => (b.id === issue.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b)),
      libraryIssues: prev.libraryIssues.map((i) => (i.id === issue.id ? { ...i, status: 'Returned' } : i)),
    }), 'Book returned & stock updated!');
  };

  return (
    <div className="stack">
      <PageHeader title="Librarian Portal — Catalog & Book Issues" subtitle="Available books synced from Master Settings. Issue and return books strictly for library operations." />

      <div className="grid-3">
        <StatCard label="Book Titles" value={db.libraryBooks.length} icon={BookOpen} />
        <StatCard label="Copies Available" value={db.libraryBooks.reduce((a, b) => a + Number(b.availableCopies || 0), 0)} icon={BookOpen} tone="success" />
        <StatCard label="Currently Issued" value={db.libraryIssues.filter((i) => i.status === 'Issued').length} icon={BookOpen} tone="warning" />
      </div>

      <form className="card grid-4" onSubmit={issueBook}>
        <select className="select" value={issueForm.bookId} onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })} required>
          <option value="">Select Book...</option>
          {db.libraryBooks.filter((b) => b.availableCopies > 0).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} avail)</option>)}
        </select>
        <select className="select" value={issueForm.usn} onChange={(e) => setIssueForm({ ...issueForm, usn: e.target.value })} required>
          <option value="">Select Student...</option>
          {db.students.map((s) => <option key={s.usn} value={s.usn}>{s.name} ({s.usn})</option>)}
        </select>
        <input type="date" className="input" value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} required />
        <button className="btn btn-primary" type="submit"><Plus size={15} /> Issue Book</button>
      </form>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Available Books (From Master)</div>
          {db.libraryBooks.length === 0 ? (
            <EmptyState title="No Books in Library" message="Master Portal can add available books in Library Master Catalog." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Author</th><th>Shelf</th><th>Avail/Total</th></tr></thead>
                <tbody>
                  {db.libraryBooks.map((b) => (
                    <tr key={b.id}><td><strong>{b.title}</strong></td><td>{b.author}</td><td>{b.shelf || '—'}</td><td>{b.availableCopies}/{b.totalCopies}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Issued Books Log</div>
          {db.libraryIssues.length === 0 ? (
            <EmptyState title="No Books Issued" message="Issue a book to a student above." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Book</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {db.libraryIssues.map((i) => (
                    <tr key={i.id}>
                      <td><strong>{i.studentName}</strong><div className="card-sub">{i.usn}</div></td>
                      <td>{i.bookTitle}</td>
                      <td>{i.dueDate}</td>
                      <td><span className={`badge ${i.status === 'Returned' ? 'badge-success' : 'badge-warning'}`}>{i.status}</span></td>
                      <td>{i.status === 'Issued' && <button className="btn btn-sm btn-success" onClick={() => returnBook(i)}><CheckCircle2 size={13} /> Return</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, BookOpen, Search } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function LibraryMaster() {
  const { db, updateDb } = useCampusStore();
  const emptyBook = { title: '', author: '', isbn: '', category: 'Textbook', totalCopies: 1, availableCopies: 1, shelf: '' };
  const [form, setForm] = useState(emptyBook);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  const saveBook = (e) => {
    e.preventDefault();
    const record = {
      id: editId || `BK-${Date.now().toString().slice(-4)}`,
      ...form,
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
    };
    updateDb((prev) => ({
      ...prev,
      libraryBooks: editId ? prev.libraryBooks.map((b) => (b.id === editId ? record : b)) : [record, ...prev.libraryBooks],
    }), editId ? 'Book updated!' : 'Book added to Master Library Catalog!');
    setForm(emptyBook);
    setEditId(null);
  };

  const delBook = (id) => {
    updateDb((prev) => ({ ...prev, libraryBooks: prev.libraryBooks.filter((b) => b.id !== id) }), 'Book deleted from catalog');
  };

  const q = search.trim().toLowerCase();

  return (
    <div className="stack">
      <PageHeader
        title="Master Library Catalog (Available Books)"
        subtitle="Add, edit, or delete available books in the institution library. Syncs live with College & Librarian portals."
        actions={
          <div className="row">
            <Search size={15} color="var(--text-muted)" />
            <input className="input" style={{ width: 220 }} placeholder="Search title, author, ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        }
      />

      <form className="card stack" onSubmit={saveBook}>
        <div className="row"><BookOpen size={18} color="var(--accent)" /><span className="card-title">{editId ? 'Edit Library Book' : 'Add Available Book'}</span></div>
        <div className="grid-3">
          <div className="field"><label>Book Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="field"><label>Author</label><input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required /></div>
          <div className="field"><label>ISBN / Book Code</label><input className="input" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
          <div className="field">
            <label>Category</label>
            <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Textbook</option><option>Reference</option><option>E-Journal</option><option>Competitive Exam</option>
            </select>
          </div>
          <div className="field"><label>Total Copies</label><input type="number" min="1" className="input" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} required /></div>
          <div className="field"><label>Available Copies</label><input type="number" min="0" className="input" value={form.availableCopies} onChange={(e) => setForm({ ...form, availableCopies: e.target.value })} required /></div>
          <div className="field"><label>Shelf / Rack No.</label><input className="input" placeholder="e.g. Rack A-4" value={form.shelf} onChange={(e) => setForm({ ...form, shelf: e.target.value })} /></div>
        </div>
        <div className="row">
          <button className="btn btn-primary" type="submit"><Plus size={15} /> {editId ? 'Update Book' : 'Add Book'}</button>
          {editId && <button type="button" className="btn" onClick={() => { setEditId(null); setForm(emptyBook); }}>Cancel</button>}
        </div>
      </form>

      <div className="card">
        {db.libraryBooks.length === 0 ? (
          <EmptyState title="No Library Books Added Yet" message="Use the form above to record available books in your library." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title & Author</th><th>ISBN</th><th>Category</th><th>Shelf</th><th>Available / Total</th><th>Actions</th></tr></thead>
              <tbody>
                {db.libraryBooks.filter((b) => `${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(q)).map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.title}</strong><div className="card-sub">{b.author}</div></td>
                    <td><code>{b.isbn || '—'}</code></td>
                    <td><span className="badge">{b.category}</span></td>
                    <td>{b.shelf || '—'}</td>
                    <td><span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>{b.availableCopies} / {b.totalCopies}</span></td>
                    <td className="row">
                      <button className="btn btn-sm" onClick={() => { setEditId(b.id); setForm(b); }}><Edit3 size={13} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => delBook(b.id)}><Trash2 size={13} /></button>
                    </td>
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

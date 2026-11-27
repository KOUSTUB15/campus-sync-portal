import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Download } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader, EmptyState, exportToCSV } from '@campus/shared-core';

export default function AccountantPortal() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [form, setForm] = useState({ type: 'Fee Receipt', refName: '', usnOrId: '', amount: '', date: new Date().toISOString().slice(0, 10), mode: 'UPI', receiptNo: '', notes: '' });

  const addRecord = (e) => {
    e.preventDefault();
    const amt = Number(form.amount);
    const rec = {
      id: `FIN-${Date.now().toString().slice(-4)}`,
      ...form,
      amount: amt,
      receiptNo: form.receiptNo || `RCPT-${Date.now().toString().slice(-5)}`,
      createdBy: currentUser.name,
    };
    updateDb((prev) => ({
      ...prev,
      financeRecords: [rec, ...prev.financeRecords],
      students: form.type === 'Fee Receipt' && form.usnOrId
        ? prev.students.map((s) => (s.usn.toUpperCase() === form.usnOrId.trim().toUpperCase() ? { ...s, feePaid: (Number(s.feePaid) || 0) + amt } : s))
        : prev.students,
    }), `${form.type} recorded!`);
    setForm({ ...form, refName: '', usnOrId: '', amount: '', receiptNo: '', notes: '' });
  };

  const totalCollected = db.financeRecords.filter((f) => f.type === 'Fee Receipt').reduce((a, f) => a + Number(f.amount || 0), 0);
  const totalOutflow = db.financeRecords.filter((f) => f.type !== 'Fee Receipt').reduce((a, f) => a + Number(f.amount || 0), 0);
  const pendingFeeStudents = db.students.filter((s) => (Number(s.feeTotal) || 0) > (Number(s.feePaid) || 0));

  return (
    <div className="stack">
      <PageHeader
        title="Accountant Portal — Fees & Finance Desk"
        subtitle="Dedicated Accountant workspace: fee collection, receipts, scholarships, salaries & expenses only."
        actions={
          db.financeRecords.length > 0 && (
            <button className="btn btn-primary" onClick={() => exportToCSV('finance-ledger.csv', db.financeRecords)}>
              <Download size={15} /> Export Ledger CSV
            </button>
          )
        }
      />

      <div className="grid-3">
        <StatCard label="Total Fees Collected" value={`₹${totalCollected.toLocaleString()}`} icon={Wallet} tone="success" />
        <StatCard label="Salaries / Expenses / Scholarships" value={`₹${totalOutflow.toLocaleString()}`} icon={Wallet} tone="warning" />
        <StatCard label="Students with Pending Fees" value={pendingFeeStudents.length} icon={Wallet} tone={pendingFeeStudents.length ? 'danger' : 'success'} />
      </div>

      <form className="card stack" onSubmit={addRecord}>
        <div className="card-title">Record Fee Receipt / Salary / Scholarship / Expense</div>
        <div className="grid-3">
          <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Fee Receipt</option><option>Salary</option><option>Scholarship</option><option>Expense</option>
          </select>
          <input className="input" placeholder="Student / Staff / Vendor Name" value={form.refName} onChange={(e) => setForm({ ...form, refName: e.target.value })} required />
          <input className="input" placeholder="Student USN or Staff ID (auto-updates fee paid)" value={form.usnOrId} onChange={(e) => setForm({ ...form, usnOrId: e.target.value })} />
          <input type="number" className="input" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select className="select" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option>UPI</option><option>Bank Transfer / NEFT</option><option>Cash</option><option>Cheque / DD</option>
          </select>
          <input className="input" placeholder="Receipt / Voucher No (auto if blank)" value={form.receiptNo} onChange={(e) => setForm({ ...form, receiptNo: e.target.value })} />
          <input className="input" style={{ gridColumn: 'span 2' }} placeholder="Remarks / Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div><button className="btn btn-primary" type="submit"><Plus size={15} /> Save Entry</button></div>
      </form>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Student Fee Status</div>
          {db.students.length === 0 ? (
            <EmptyState title="No Students Admitted" message="Admitted students will appear here for fee tracking." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>USN</th><th>Name</th><th>Total Fee</th><th>Paid</th><th>Balance</th></tr></thead>
                <tbody>
                  {db.students.map((s) => {
                    const bal = (Number(s.feeTotal) || 0) - (Number(s.feePaid) || 0);
                    return (
                      <tr key={s.usn}>
                        <td><code>{s.usn}</code></td>
                        <td><strong>{s.name}</strong></td>
                        <td>₹{(Number(s.feeTotal) || 0).toLocaleString()}</td>
                        <td>₹{(Number(s.feePaid) || 0).toLocaleString()}</td>
                        <td><span className={`badge ${bal <= 0 ? 'badge-success' : 'badge-danger'}`}>₹{Math.max(0, bal).toLocaleString()}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Transactions Ledger ({db.financeRecords.length})</div>
          {db.financeRecords.length === 0 ? (
            <EmptyState title="No Transactions Recorded" message="Add a fee receipt or voucher above." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Receipt</th><th>Type</th><th>Name</th><th>Amount</th><th>Action</th></tr></thead>
                <tbody>
                  {db.financeRecords.map((f) => (
                    <tr key={f.id}>
                      <td><code>{f.receiptNo}</code><div className="card-sub">{f.date}</div></td>
                      <td><span className="badge">{f.type}</span></td>
                      <td><strong>{f.refName}</strong><div className="card-sub">{f.mode}</div></td>
                      <td><strong>₹{Number(f.amount).toLocaleString()}</strong></td>
                      <td><button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, financeRecords: prev.financeRecords.filter((x) => x.id !== f.id) }), 'Transaction deleted')}><Trash2 size={13} /></button></td>
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

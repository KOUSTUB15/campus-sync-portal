import React from 'react';
import { ClipboardCheck, CheckCircle2, Clock } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader, EmptyState } from '@campus/shared-core';

export default function PeonPortal() {
  const { db, updateDb, currentUser } = useCampusStore();
  const myTasks = db.officeTasks.filter(
    (t) => t.assignedToId === currentUser.refId || t.assignedToRole === 'Peon' || !t.assignedToId
  );

  const setStatus = (id, status) => {
    updateDb((prev) => ({
      ...prev,
      officeTasks: prev.officeTasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }), `Task marked as ${status}`);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Support Staff / Peon Duty Portal"
        subtitle="Dedicated workspace showing only your assigned campus duties, circular deliveries, and room preparation tasks."
      />

      <div className="grid-3">
        <StatCard label="Pending Tasks" value={myTasks.filter((t) => t.status === 'Pending').length} icon={Clock} tone="warning" />
        <StatCard label="In Progress" value={myTasks.filter((t) => t.status === 'In Progress').length} icon={ClipboardCheck} />
        <StatCard label="Completed Duties" value={myTasks.filter((t) => t.status === 'Completed').length} icon={CheckCircle2} tone="success" />
      </div>

      <div className="card stack">
        <div className="card-title">My Assigned Duties</div>
        {myTasks.length === 0 ? (
          <EmptyState title="No Tasks Assigned Yet" message="Tasks assigned to you by College Admin will appear here automatically." />
        ) : (
          myTasks.map((t) => (
            <div key={t.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{t.title}</strong>
                  <div className="card-sub">Location: {t.location || 'Campus Office'} • Due: {t.dueDate || 'Today'} • Assigned by {t.createdBy}</div>
                </div>
                <span className={`badge ${t.status === 'Completed' ? 'badge-success' : t.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>{t.status}</span>
              </div>
              {t.notes && <p className="card-sub" style={{ marginTop: 6 }}>{t.notes}</p>}
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn btn-sm" onClick={() => setStatus(t.id, 'In Progress')}>Start Duty</button>
                <button className="btn btn-sm btn-success" onClick={() => setStatus(t.id, 'Completed')}>Mark Completed</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

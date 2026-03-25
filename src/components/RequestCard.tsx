import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Request } from '../types';
import { useToast } from './Toast';
import { Clock, CheckCircle, XCircle, Tag, Phone, Upload, Receipt, Trash2 } from 'lucide-react';

interface Props {
  request: Request;
  isAdmin?: boolean;
  isEmployee?: boolean;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return `Today at ${d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RequestCard({ request, isAdmin, isEmployee }: Props) {
  const [note, setNote] = useState('');
  const [showModal, setShowModal] = useState<'approve' | 'reject' | 'receipt' | 'delete' | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(request.receiptUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // sync when Firestore updates the prop (but don't overwrite a just-uploaded url)
  useEffect(() => {
    if (request.receiptUrl) setReceiptUrl(request.receiptUrl);
  }, [request.receiptUrl]);

  const uploadReceipt = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `receipts/${request.id}/receipt.${ext}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await updateDoc(doc(db, 'requests', request.id), { receiptUrl: url, updatedAt: Date.now() });
      setReceiptUrl(url);
      toast('Receipt uploaded!', 'success');
    } catch (err: any) {
      toast(`Upload failed: ${err?.message || 'Try again.'}`, 'error');
    }
    setUploading(false);
  };

  const act = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'requests', request.id), {
        status,
        adminNote: note.trim() || null,
        updatedAt: Date.now(),
      });
      toast(status === 'approved' ? 'Request approved!' : 'Request rejected.', status === 'approved' ? 'success' : 'error');
      setShowModal(null);
      setNote('');
    } catch {
      toast('Something went wrong', 'error');
    }
    setLoading(false);
  };

  const deleteRequest = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'requests', request.id));
      toast('Request deleted.', 'info');
      setShowModal(null);
    } catch {
      toast('Failed to delete.', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="request-card" style={isAdmin && receiptUrl ? { borderLeft: '3px solid var(--success)' } : undefined}>
        <div className="request-card-header">
          <div>
            <div className="request-amount">KES {request.amount.toLocaleString()}</div>
            <div className="request-meta">
              <span className="category-chip"><Tag size={11} />{request.category}</span>
              <span><Clock size={11} />{formatDate(request.createdAt)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${request.status}`}>
              {request.status === 'pending' && <Clock size={11} />}
              {request.status === 'approved' && <CheckCircle size={11} />}
              {request.status === 'rejected' && <XCircle size={11} />}
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            {isAdmin && (
              <button className="btn btn-sm" style={{ padding: '4px 8px', color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none' }} onClick={() => setShowModal('delete')}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <p className="request-desc">{request.description}</p>

        {isAdmin && (
          <div className="request-employee">
            <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
              {request.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span>{request.employeeName}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={11} />{request.employeePhone}
            </span>
          </div>
        )}

        {request.adminNote && (
          <div className="admin-note">💬 {request.adminNote}</div>
        )}

        {isAdmin && (
          <button
            className="btn btn-outline btn-sm"
            style={{ marginTop: 10 }}
            onClick={() => setShowModal('receipt')}
          >
            <Receipt size={14} /> {receiptUrl ? 'View Receipt' : 'No Receipt Yet'}
          </button>
        )}

        {isEmployee && request.status === 'approved' && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && uploadReceipt(e.target.files[0])} />
            <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={14} /> {uploading ? 'Uploading...' : receiptUrl ? 'Re-upload' : 'Upload Receipt'}
            </button>
            {receiptUrl && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowModal('receipt')}>
                <Receipt size={14} /> View Receipt
              </button>
            )}
          </div>
        )}

        {isAdmin && request.status === 'pending' && (
          <div className="action-btns">
            <button className="btn btn-success btn-sm" onClick={() => setShowModal('approve')}>
              <CheckCircle size={14} /> Approve
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowModal('reject')}>
              <XCircle size={14} /> Reject
            </button>
          </div>
        )}
      </div>

      {showModal === 'receipt' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, textAlign: 'center' }}>
            <h3>🧾 Receipt</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              {request.employeeName} — KES {request.amount.toLocaleString()}
            </p>
            {receiptUrl ? (
              <>
                <img src={receiptUrl} alt="Receipt" style={{ width: '100%', borderRadius: 10, maxHeight: 500, objectFit: 'contain', background: 'var(--bg)' }} />
                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Open Full Size</a>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowModal(null)}>Close</button>
                </div>
              </>
            ) : (
              <div style={{ padding: '32px 0', color: 'var(--text-secondary)' }}>
                <Receipt size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>No receipt uploaded yet.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setShowModal(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showModal === 'delete' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🗑️ Delete Request?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              This will permanently delete the KES {request.amount.toLocaleString()} request from {request.employeeName}. This cannot be undone.
            </p>
            <div className="action-btns">
              <button className="btn btn-danger" onClick={deleteRequest} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject modal */}
      {(showModal === 'approve' || showModal === 'reject') && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{showModal === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              KES {request.amount.toLocaleString()} — {request.employeeName}
            </p>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea className="form-textarea" placeholder="Add a note for the employee..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="action-btns">
              <button className={`btn ${showModal === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => act(showModal === 'approve' ? 'approved' : 'rejected')} disabled={loading}>
                {loading ? 'Processing...' : showModal === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

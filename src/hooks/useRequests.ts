import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Request } from '../types';

export function useRequests(employeeId?: string) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, 'requests');
    const q = employeeId
      ? query(col, where('employeeId', '==', employeeId))
      : query(col);

    return onSnapshot(q, (snap) => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Request))
        .sort((a, b) => b.createdAt - a.createdAt);
      setRequests(sorted);
      setLoading(false);
    });
  }, [employeeId]);

  return { requests, loading };
}

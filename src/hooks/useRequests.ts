import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Request } from '../types';

export function useRequests(employeeId?: string) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, 'requests');
    const q = employeeId
      ? query(col, where('employeeId', '==', employeeId), orderBy('createdAt', 'desc'))
      : query(col, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Request)));
      setLoading(false);
    });

    return unsub;
  }, [employeeId]);

  return { requests, loading };
}

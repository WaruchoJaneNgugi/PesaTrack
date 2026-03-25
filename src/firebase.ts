import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC0iH3xJYUMpG3Ap9FcUD48TcSzKMB8zak",
  authDomain: "pesatrack-2f99a.firebaseapp.com",
  projectId: "pesatrack-2f99a",
  storageBucket: "pesatrack-2f99a.firebasestorage.app",
  messagingSenderId: "1027170574854",
  appId: "1:1027170574854:web:ee082123bd917873b1d987",
  measurementId: "G-YT06LRXNCL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function seedAdmin() {
  const adminRef = doc(db, 'users', 'admin-charles');
  await setDoc(adminRef, {
      id: 'admin-charles',
      name: 'Charles Luche',
      phone: '0743863363',
      pin: '1234',
      role: 'admin',
      createdAt: Date.now(),
    });
  }


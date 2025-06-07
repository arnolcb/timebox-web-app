// src/services/timeboxService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

export interface TimeboxData {
  id: string;
  title: string;
  date: string;
  priorities: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  notes: Array<{
    id: string;
    content: string;
  }>;
  schedule: Array<{
    id: string;
    startTime: string;
    endTime: string;
    activity: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class TimeboxService {
  static getUserTimeboxesRef(userId: string) {
    return collection(db, 'users', userId, 'timeboxes');
  }

  static getTimeboxRef(userId: string, timeboxId: string) {
    return doc(db, 'users', userId, 'timeboxes', timeboxId);
  }

  // Crear nueva hoja de timebox
  static async createTimebox(userId: string, date: string, title?: string): Promise<TimeboxData> {
    const timeboxId = `sheet-${date}`;
    const timeboxRef = this.getTimeboxRef(userId, timeboxId);
    
    const newTimebox: Omit<TimeboxData, 'id'> = {
      title: title || this.formatDateTitle(date),
      date,
      priorities: [],
      notes: [],
      schedule: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(timeboxRef, newTimebox);
    return { ...newTimebox, id: timeboxId };
  }

  // Obtener timebox por ID
  static async getTimebox(userId: string, timeboxId: string): Promise<TimeboxData | null> {
    const timeboxRef = this.getTimeboxRef(userId, timeboxId);
    const docSnap = await getDoc(timeboxRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TimeboxData;
    }
    return null;
  }

  // Actualizar timebox completo
  static async updateTimebox(userId: string, timeboxId: string, data: Partial<TimeboxData>): Promise<void> {
    const timeboxRef = this.getTimeboxRef(userId, timeboxId);
    await updateDoc(timeboxRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  // Eliminar timebox
  static async deleteTimebox(userId: string, timeboxId: string): Promise<void> {
    const timeboxRef = this.getTimeboxRef(userId, timeboxId);
    await deleteDoc(timeboxRef);
  }

  // Obtener todas las hojas del usuario (para el sidebar)
  static subscribeToUserTimeboxes(userId: string, callback: (timeboxes: TimeboxData[]) => void) {
    const timeboxesRef = this.getUserTimeboxesRef(userId);
    const q = query(timeboxesRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const timeboxes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeboxData[];
      callback(timeboxes);
    });
  }

  // Verificar si existe timebox para una fecha
  static async timeboxExistsForDate(userId: string, date: string): Promise<boolean> {
    const timeboxesRef = this.getUserTimeboxesRef(userId);
    const q = query(timeboxesRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // Formatear título de fecha
  static formatDateTitle(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Untitled Timebox";
    }
  }
}
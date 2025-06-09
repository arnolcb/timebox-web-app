// src/services/optimizedTimeboxService.ts
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
  getDocs,
  getDocsFromCache,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../firebase';
import { TimeboxData } from './timeboxService';

// Local cache
const cache = new Map<string, { data: any; timestamp: number; }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export class OptimizedTimeboxService {
  // Cache helpers
  private static getCacheKey(userId: string, type: string, id?: string): string {
    return `${userId}-${type}${id ? `-${id}` : ''}`;
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
    cache.delete(key);
    return null;
  }

  private static setCache(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  // Optimized create with immediate local update
  static async createTimebox(userId: string, date: string, title?: string): Promise<TimeboxData> {
    const timeboxId = `sheet-${date}`;
    const timeboxRef = doc(db, 'users', userId, 'timeboxes', timeboxId);
    
    const newTimebox: Omit<TimeboxData, 'id'> = {
      title: title || this.formatDateTitle(date),
      date,
      priorities: [],
      notes: [],
      schedule: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const fullTimebox = { ...newTimebox, id: timeboxId };

    // Optimistic update - update local cache immediately
    const userCacheKey = this.getCacheKey(userId, 'timeboxes');
    const cachedTimeboxes = this.getFromCache<TimeboxData[]>(userCacheKey) || [];
    const updatedTimeboxes = [fullTimebox, ...cachedTimeboxes];
    this.setCache(userCacheKey, updatedTimeboxes);

    // Save to Firebase in background
    try {
      await setDoc(timeboxRef, newTimebox);
    } catch (error) {
      // If save fails, remove from cache
      cache.delete(userCacheKey);
      throw error;
    }

    return fullTimebox;
  }

  // Fast timebox retrieval with cache
  static async getTimebox(userId: string, timeboxId: string): Promise<TimeboxData | null> {
    const cacheKey = this.getCacheKey(userId, 'timebox', timeboxId);
    
    // Try cache first
    const cached = this.getFromCache<TimeboxData>(cacheKey);
    if (cached) {
      console.log('📦 Loading timebox from cache');
      return cached;
    }

    try {
      const timeboxRef = doc(db, 'users', userId, 'timeboxes', timeboxId);
      const docSnap = await getDoc(timeboxRef);
      
      if (docSnap.exists()) {
        const timebox = { id: docSnap.id, ...docSnap.data() } as TimeboxData;
        this.setCache(cacheKey, timebox);
        console.log('🔥 Loading timebox from Firebase');
        return timebox;
      }
    } catch (error) {
      console.error('Failed to get timebox:', error);
    }
    
    return null;
  }

  // Optimized update with debouncing
  private static updateQueue = new Map<string, NodeJS.Timeout>();

  static async updateTimebox(userId: string, timeboxId: string, data: Partial<TimeboxData>): Promise<void> {
    const cacheKey = this.getCacheKey(userId, 'timebox', timeboxId);
    const queueKey = `${userId}-${timeboxId}`;
    
    // Update cache immediately for instant UI feedback
    const cached = this.getFromCache<TimeboxData>(cacheKey);
    if (cached) {
      const updated = { ...cached, ...data, updatedAt: Timestamp.now() };
      this.setCache(cacheKey, updated);
    }

    // Clear existing debounced update
    const existingTimeout = this.updateQueue.get(queueKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce Firebase updates (wait 1 second for more changes)
    const timeout = setTimeout(async () => {
      try {
        const timeboxRef = doc(db, 'users', userId, 'timeboxes', timeboxId);
        await updateDoc(timeboxRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
        console.log('💾 Saved to Firebase:', timeboxId);
      } catch (error) {
        console.error('Failed to update timebox:', error);
        // Invalidate cache on error
        cache.delete(cacheKey);
      } finally {
        this.updateQueue.delete(queueKey);
      }
    }, 1000);

    this.updateQueue.set(queueKey, timeout);
  }

  // Smart list loading with pagination
  static subscribeToUserTimeboxes(
    userId: string, 
    callback: (timeboxes: TimeboxData[]) => void,
    limit: number = 20
  ) {
    const cacheKey = this.getCacheKey(userId, 'timeboxes');
    
    // Return cached data immediately if available
    const cached = this.getFromCache<TimeboxData[]>(cacheKey);
    if (cached && cached.length > 0) {
      console.log('📦 Loading timeboxes from cache');
      callback(cached);
    }

    const timeboxesRef = collection(db, 'users', userId, 'timeboxes');
    const q = query(timeboxesRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const timeboxes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeboxData[];
      
      // Update cache
      this.setCache(cacheKey, timeboxes);
      console.log('🔥 Loading timeboxes from Firebase');
      callback(timeboxes);
    });
  }

  // Batch operations for better performance
  static async deleteMultipleTimeboxes(userId: string, timeboxIds: string[]): Promise<void> {
    const promises = timeboxIds.map(id => {
      const ref = doc(db, 'users', userId, 'timeboxes', id);
      return deleteDoc(ref);
    });

    await Promise.all(promises);

    // Clear related cache
    timeboxIds.forEach(id => {
      const cacheKey = this.getCacheKey(userId, 'timebox', id);
      cache.delete(cacheKey);
    });
    
    const userCacheKey = this.getCacheKey(userId, 'timeboxes');
    cache.delete(userCacheKey);
  }

  // Network status management
  static async goOffline(): Promise<void> {
    await disableNetwork(db);
    console.log('📴 Firebase offline mode enabled');
  }

  static async goOnline(): Promise<void> {
    await enableNetwork(db);
    console.log('📶 Firebase online mode enabled');
  }

  // Preload user data
  static async preloadUserData(userId: string): Promise<void> {
    try {
      console.log('🚀 Preloading user data...');
      
      // Load timeboxes
      const timeboxesRef = collection(db, 'users', userId, 'timeboxes');
      const recentQuery = query(timeboxesRef, orderBy('date', 'desc'));
      const timeboxesSnap = await getDocs(recentQuery);
      
      const timeboxes = timeboxesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeboxData[];
      
      // Cache timeboxes
      const timeboxesCacheKey = this.getCacheKey(userId, 'timeboxes');
      this.setCache(timeboxesCacheKey, timeboxes);
      
      // Load user settings
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const settingsCacheKey = this.getCacheKey(userId, 'settings');
        this.setCache(settingsCacheKey, userDoc.data());
      }
      
      console.log('✅ User data preloaded');
    } catch (error) {
      console.error('Failed to preload user data:', error);
    }
  }

  static formatDateTitle(dateString: string): string {
    try {
      // Fix timezone issue by parsing date in local timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Untitled Timebox";
    }
  }

  // Clear all cache (useful for logout)
  static clearCache(): void {
    cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache statistics
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  }
}
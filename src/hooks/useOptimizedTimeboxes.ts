// src/hooks/useOptimizedTimeboxes.ts
import { useState, useEffect, useCallback } from 'react';
import { TimeboxData } from '../services/timeboxService';
import { OptimizedTimeboxService } from '../services/optimizedTimeboxService';
import { useAuth } from '../contexts/AuthContext';

export const useOptimizedTimeboxes = () => {
  const { user } = useAuth();
  const [timeboxes, setTimeboxes] = useState<TimeboxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setTimeboxes([]);
      setLoading(false);
      return;
    }

    // Preload user data when user first loads
    OptimizedTimeboxService.preloadUserData(user.id);

    setLoading(true);
    const unsubscribe = OptimizedTimeboxService.subscribeToUserTimeboxes(
      user.id,
      (updatedTimeboxes) => {
        setTimeboxes(updatedTimeboxes);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const createTimebox = useCallback(async (date: string, title?: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const newTimebox = await OptimizedTimeboxService.createTimebox(user.id, date, title);
      return newTimebox;
    } catch (err) {
      setError('Failed to create timebox');
      throw err;
    }
  }, [user?.id]);

  const deleteTimebox = useCallback(async (timeboxId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      // Optimistic update - remove from local state immediately
      setTimeboxes(prev => prev.filter(tb => tb.id !== timeboxId));
      
      // Delete from Firebase in background
      await OptimizedTimeboxService.deleteMultipleTimeboxes(user.id, [timeboxId]);
    } catch (err) {
      setError('Failed to delete timebox');
      // Revert optimistic update on error
      throw err;
    }
  }, [user?.id]);

  const updateTimebox = useCallback(async (timeboxId: string, data: Partial<TimeboxData>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      await OptimizedTimeboxService.updateTimebox(user.id, timeboxId, data);
    } catch (err) {
      setError('Failed to update timebox');
      throw err;
    }
  }, [user?.id]);

  const checkDateExists = useCallback(async (date: string): Promise<boolean> => {
    return timeboxes.some(tb => tb.date === date);
  }, [timeboxes]);

  return {
    timeboxes,
    loading,
    error,
    createTimebox,
    deleteTimebox,
    updateTimebox,
    checkDateExists
  };
};

// Hook optimizado para timebox individual
export const useOptimizedTimebox = (timeboxId: string | undefined) => {
  const { user } = useAuth();
  const [timebox, setTimebox] = useState<TimeboxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !timeboxId) {
      setTimebox(null);
      setLoading(false);
      return;
    }

    const loadTimebox = async () => {
      try {
        setLoading(true);
        const data = await OptimizedTimeboxService.getTimebox(user.id, timeboxId);
        setTimebox(data);
        setError(null);
      } catch (err) {
        setError('Failed to load timebox');
        setTimebox(null);
      } finally {
        setLoading(false);
      }
    };

    loadTimebox();
  }, [user?.id, timeboxId]);

  const updateTimebox = useCallback(async (data: Partial<TimeboxData>) => {
    if (!user?.id || !timeboxId) return;
    
    try {
      // Optimistic update - update local state immediately
      setTimebox(prev => prev ? { ...prev, ...data } : null);
      
      // Update Firebase with debouncing
      await OptimizedTimeboxService.updateTimebox(user.id, timeboxId, data);
    } catch (err) {
      setError('Failed to update timebox');
      throw err;
    }
  }, [user?.id, timeboxId]);

  return {
    timebox,
    loading,
    error,
    updateTimebox
  };
};
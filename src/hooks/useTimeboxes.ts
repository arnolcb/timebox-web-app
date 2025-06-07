// src/hooks/useTimeboxes.ts
import { useState, useEffect } from 'react';
import { TimeboxData, TimeboxService } from '../services/timeboxService';
import { useAuth } from '../contexts/AuthContext';

export const useTimeboxes = () => {
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

    setLoading(true);
    const unsubscribe = TimeboxService.subscribeToUserTimeboxes(
      user.id,
      (updatedTimeboxes) => {
        setTimeboxes(updatedTimeboxes);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const createTimebox = async (date: string, title?: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const newTimebox = await TimeboxService.createTimebox(user.id, date, title);
      return newTimebox;
    } catch (err) {
      setError('Failed to create timebox');
      throw err;
    }
  };

  const deleteTimebox = async (timeboxId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      await TimeboxService.deleteTimebox(user.id, timeboxId);
    } catch (err) {
      setError('Failed to delete timebox');
      throw err;
    }
  };

  const checkDateExists = async (date: string): Promise<boolean> => {
    if (!user?.id) return false;
    return await TimeboxService.timeboxExistsForDate(user.id, date);
  };

  return {
    timeboxes,
    loading,
    error,
    createTimebox,
    deleteTimebox,
    checkDateExists
  };
};

// Hook para timebox individual
export const useTimebox = (timeboxId: string | undefined) => {
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
        const data = await TimeboxService.getTimebox(user.id, timeboxId);
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

  const updateTimebox = async (data: Partial<TimeboxData>) => {
    if (!user?.id || !timeboxId) return;
    
    try {
      await TimeboxService.updateTimebox(user.id, timeboxId, data);
      // Update local state
      setTimebox(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      setError('Failed to update timebox');
      throw err;
    }
  };

  return {
    timebox,
    loading,
    error,
    updateTimebox
  };
};
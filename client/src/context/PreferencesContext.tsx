import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Preferences {
  theme: 'light' | 'dark';
  lastActiveTab: string;
  recentlyViewedBooks: string[];
  readingTime: number;
}

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: (preferences: Partial<Preferences>) => void;
  updateReadingTime: (additionalTime: number) => void;
  addRecentlyViewedBook: (bookId: number) => void;
}

const defaultPreferences: Preferences = {
  theme: 'light',
  lastActiveTab: 'home',
  recentlyViewedBooks: [],
  readingTime: 0,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [localPreferences, setLocalPreferences] = usePersistedState<Preferences>(
    'preferences',
    defaultPreferences
  );

  const { data: serverPreferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await api.get('/preferences');
      return response.data;
    },
    enabled: !!localPreferences,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<Preferences>) => {
      const response = await api.put('/preferences', newPreferences);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  const updateReadingTimeMutation = useMutation({
    mutationFn: async (additionalTime: number) => {
      await api.post('/preferences/reading-time', { additionalTime });
    },
  });

  const addRecentlyViewedMutation = useMutation({
    mutationFn: async (bookId: number) => {
      await api.post(`/preferences/recently-viewed/${bookId}`);
    },
  });

  const setPreferences = (newPreferences: Partial<Preferences>) => {
    setLocalPreferences((prev: Preferences) => ({ ...prev, ...newPreferences }) as Preferences);
    updatePreferencesMutation.mutate(newPreferences);
  };

  const updateReadingTime = (additionalTime: number) => {
    setLocalPreferences((prev: Preferences) => ({
      ...prev,
      readingTime: prev.readingTime + additionalTime,
    } as Preferences));
    updateReadingTimeMutation.mutate(additionalTime);
  };

  const addRecentlyViewedBook = (bookId: number) => {
    setLocalPreferences((prev: Preferences) => ({
      ...prev,
      recentlyViewedBooks: [
        String(bookId),
        ...prev.recentlyViewedBooks.filter((id: string) => id !== String(bookId)),
      ].slice(0, 10),
    } as Preferences));
    addRecentlyViewedMutation.mutate(bookId);
  };

  const preferences = serverPreferences || localPreferences;

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        updateReadingTime,
        addRecentlyViewedBook,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
} 
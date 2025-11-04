import { create } from 'zustand';
import { getDay } from '../services/diary.api';
import { getTargets } from '../services/profile.api';
import { toYMD } from '../utils/date';

const initialDate = new Date();
/*
 Zustand store for managing diary data.
 Handles current date, user nutrition targets, and daily meal entries.
 */
const useDiaryStore = create((set, get) => ({ 
    date: initialDate,
    targets: null,
    data: null,       
    loading: false,
    error: null,
    // Update the active date
    setDate: (date) => set({ date }),
    // Fetch both targets and diary entries for the current date
    fetchAll: async () => {
        const { date } = get();
        set({ loading: true, error: null });
        try {
            const [targets, day] = await Promise.all([
                getTargets(),
                getDay(toYMD(date)),
            ]);
            set({ targets, data: day, loading: false });
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to load diary';
            set({ loading: false, error: msg });
        }
    },
}));

export default useDiaryStore;

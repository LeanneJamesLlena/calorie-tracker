import { useState } from 'react';
import { getHistory } from '../../services/history.api';
import { ymdRange, listWeekDays } from '../../utils/week';

// Ensures the week always contains 7 days (Mon–Sun)
// Fills in any missing days with zeros for all nutrients
function normalizeWeek(fromDate, raw) {

    const byDate = new Map(raw.map(d => [d.date, d]));

    return listWeekDays(fromDate).map(date => ({
        date,
        kcal: byDate.get(date)?.kcal ?? 0,
        protein: byDate.get(date)?.protein ?? 0,
        carbs: byDate.get(date)?.carbs ?? 0,
        fat: byDate.get(date)?.fat ?? 0,
        fiber: byDate.get(date)?.fiber ?? 0,
    }));
}
// Custom React hook: manages fetching and storing weekly nutrition history
export default function useHistoryData() {
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    async function fetchWeek(from, to) {
        try {
            setLoading(true); setError('');
            const { from: F, to: T } = ymdRange({ from, to });
            const items = await getHistory(F, T);
            setDays(normalizeWeek(from, items));
        } catch (e) {

            setError(e?.response?.data?.error || e?.message || 'Failed to load history');
        } finally { 
            setLoading(false); 
        }
    }

    return { days, loading, error, fetchWeek };
}

// services/history.service.js
import mongoose from 'mongoose';
import { DiaryEntry } from '../models/DiaryEntry.model.js';
import { toYMD } from '../utils/dates.js';

// Returns [{ date, kcal, protein, carbs, fat, fiber }] for a user in [from, to] inclusive.
export async function getHistoryRange({ userId, from, to }) {

    if (!userId) {
        const err = new Error('Missing userId');
        err.status = 400;
        throw err;
    }

    // Normalize to YYYY-MM-DD (user tz handled in toYMD)
    const fromY = toYMD(from);
    const toY = toYMD(to);

    if (!fromY || !toY) {
        const err = new Error('Missing or invalid from/to');
        err.status = 400;
        throw err;
    }
    if (fromY > toY) {
        const err = new Error('Invalid range: from > to');
        err.status = 400;
        throw err;
    }

    // IMPORTANT: cast userId for aggregation
    const uid = new mongoose.Types.ObjectId(String(userId));

    // Aggregate per day (inclusive range). Dates are ISO-like strings so lexicographic compare works.
    const rows = await DiaryEntry.aggregate([
        { $match: { userId: uid, date: { $gte: fromY, $lte: toY } } },
        {
        $group: {
            _id: '$date',
            kcal:    { $sum: '$nutrients.kcal' },
            protein: { $sum: '$nutrients.protein' },
            carbs:   { $sum: '$nutrients.carbs' },
            fat:     { $sum: '$nutrients.fat' },
            fiber:   { $sum: '$nutrients.fiber' },
        },
        },
        {
        $project: {
            _id: 0,
            date: '$_id',
            // Round to your display rules to avoid float artifacts
            kcal:    { $round: ['$kcal', 0] },
            protein: { $round: ['$protein', 1] },
            carbs:   { $round: ['$carbs', 1] },
            fat:     { $round: ['$fat', 1] },
            fiber:   { $round: ['$fiber', 1] },
        },
        },
        { $sort: { date: 1 } },
    ]);

    return rows; // Only days that have entries (sparse by design)
}

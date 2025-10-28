import mongoose from 'mongoose';

const nutrientsSchema = new mongoose.Schema(
    {
        kcal: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        sugars: { type: Number, required: true },
        fiber: { type: Number, required: true },
        fat: { type: Number, required: true },
        satFat: { type: Number, required: true },
        sodium: { type: Number, required: true },
    },
    { 
        _id: false 
    }
);

const diaryEntrySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },

        // YYYY-MM-DD in user's tz (we normalize before saving)
        date: { type: String, required: true, index: true },

        mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true,
        index: true,
        },

        fdcId: { type: Number, required: true },
        label: { type: String, required: true }, // e.g. "Chicken breast, raw"

        grams: { type: Number, required: true, min: 0 },

        // snapshot of per-100g at the time of adding (history-safe)
        per100gSnapshot: { type: nutrientsSchema, required: true },

        // scaled nutrients for this entry (for quick reads)
        nutrients: { type: nutrientsSchema, required: true },
    },
    { 
        timestamps: true 
    }
);

export const DiaryEntry = mongoose.model('DiaryEntry', diaryEntrySchema);

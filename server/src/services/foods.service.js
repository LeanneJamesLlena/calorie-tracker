import { FoodCache } from '../models/FoodCache.model.js';
import { fdcSearchFoods, fdcGetFood } from '../integrations/fdc.client.js';

const ALLOWED_DATATYPES = ['Foundation', 'SR Legacy'];

// FDC nutrient numbers (new + legacy)
const N = {
    KCAL:    ['1008', '208'],
    PROTEIN: ['1003', '203'],
    CARBS:   ['1005', '205'],
    FAT:     ['1004', '204'],
    SAT_FAT: ['1258', '606'],
    FIBER:   ['1079', '291'],
    SUGARS:  ['2000', '269'],
    SODIUM:  ['1093', '307'],
};
function sanitizePer100g(p) {
    // clamp negatives to 0
    const safe = Object.fromEntries(
        Object.entries(p).map(([k, v]) => [k, Math.max(0, Number(v) || 0)])
    );

    // round: kcal int; grams 2 decimals; sodium leave as-is or round
    safe.kcal    = Math.round(safe.kcal);
    safe.protein = Number(safe.protein.toFixed(2));
    safe.carbs   = Number(safe.carbs.toFixed(2));
    safe.sugars  = Number(safe.sugars.toFixed(2));
    safe.fiber   = Number(safe.fiber.toFixed(2));
    safe.fat     = Number(safe.fat.toFixed(2));
    safe.satFat  = Number(safe.satFat.toFixed(2));
    // sodium: keep as float or round — your choice:
    safe.sodium  = Number(safe.sodium.toFixed(2));

    return safe;
}


function isZeroBlock(per100g = {}) {
    return Object.values(per100g).every(v => !Number(v));
}

function calcKcalFromMacros({ protein = 0, carbs = 0, fat = 0 }) {
    return Math.round(4 * protein + 4 * carbs + 9 * fat);
}

// Read a nutrient regardless of FDC shape (Foundation/SR Legacy)
function readNutrient(foodNutrients = [], nums) {
    const targets = Array.isArray(nums) ? nums.map(String) : [String(nums)];
    const item = foodNutrients.find((fn) => {
        const num =
        fn?.nutrient?.number ??
        fn?.nutrientNumber ??
        fn?.nutrient?.id ??
        fn?.nutrientId;
        return num && targets.includes(String(num));
    });
    if (!item) return 0;

    let amount = item.amount ?? item.value ?? 0;

    // If energy reported in kJ, convert to kcal
    const unit = item?.nutrient?.unitName ?? item?.unitName;
    const isEnergy = targets.includes('1008') || targets.includes('208');
    if (isEnergy && unit && unit.toLowerCase() === 'kj') {
        amount = amount / 4.184;
    }
    return Number(amount) || 0;
}

// Simple “raw/cooked” tag from description
// Attempt to detect a “variant” label from description (raw/cooked), word-aware.
function detectVariant(desc = '') {
    const d = String(desc).toLowerCase();

    // helper to test whole words (handles spaces, punctuation, hyphens)
    const hasWord = (word) => new RegExp(`(^|[^a-z])${word}([^a-z]|$)`).test(d);

    // Treat explicit "uncooked" as raw first (so it doesn't trip "cooked")
    if (hasWord('uncooked')) return 'raw';

    // Raw-ish synonyms
    const RAW_WORDS = [
        'raw', 'fresh', 'unheated', 'not cooked', 'sashimi-grade'
    ];

    // Cooked words (common methods)
    const COOKED_WORDS = [
        'cooked', 'roasted', 'grilled', 'broiled', 'baked', 'boiled',
        'stewed', 'braised', 'poached', 'steamed', 'sauteed', 'sautéed',
        'fried', 'pan-fried', 'deep-fried', 'air-fried',
        'microwaved', 'smoked', 'barbecued', 'bbq', 'rotisserie', 'toasted',
        'pressure cooked', 'slow-cooked'
    ];

    // If any cooked-word appears as a whole word → cooked
    if (COOKED_WORDS.some(w => hasWord(w))) return 'cooked';

    // Else, if any raw-word appears → raw
    if (RAW_WORDS.some(w => hasWord(w))) return 'raw';

    // No clear signal
    return null;
}

// Build normalized per-100g + portions from an FDC detail
function normalizeFood(detail) {
    // For SR Legacy / Foundation, nutrients are per 100 g
    let per100g = {
        kcal:    readNutrient(detail.foodNutrients, N.KCAL),
        protein: readNutrient(detail.foodNutrients, N.PROTEIN),
        carbs:   readNutrient(detail.foodNutrients, N.CARBS),
        sugars:  readNutrient(detail.foodNutrients, N.SUGARS),
        fiber:   readNutrient(detail.foodNutrients, N.FIBER),
        fat:     readNutrient(detail.foodNutrients, N.FAT),
        satFat:  readNutrient(detail.foodNutrients, N.SAT_FAT),
        sodium:  readNutrient(detail.foodNutrients, N.SODIUM),
    };

    // Fallback: if Energy is missing but macros exist, compute it
    if (!Number(per100g.kcal) && (per100g.protein || per100g.carbs || per100g.fat)) {
        per100g.kcal = calcKcalFromMacros(per100g);
    }
    
    per100g = sanitizePer100g(per100g);

    // Portions (always include 100 g)
    const portions = [{ name: '100 g', gram: 100 }];

    (detail.foodPortions || []).forEach((p) => {
        const gram = Number(p?.gramWeight);
        if (!Number.isFinite(gram) || gram <= 0) return;

        const name =
        p?.portionDescription ||
        p?.modifier ||
        p?.measureUnit?.name ||
        'portion';

        if (!portions.some((x) => x.name === name && x.gram === gram)) {
        portions.push({ name, gram });
        }
    });

    const name = (detail.description || '').trim() || 'Food';
    const variant = detectVariant(name);

    return {
        fdcId: detail.fdcId,
        name,
        variant,
        per100g,
        portions,
        dataType: detail.dataType, //  remember dataset
    };
}

// Search generics and return a clean, ranked list
export async function searchFoodsService(q) {
    if (!q || String(q).trim().length < 2) return [];
    const json = await fdcSearchFoods(q.trim());

    const items = (json.foods || [])
        .filter((f) => ALLOWED_DATATYPES.includes(f.dataType))
        .map((f) => ({
        fdcId: f.fdcId,
        name: f.description || '',
        variant: detectVariant(f.description || ''),
        dataType: f.dataType,
        }));

    // Prefer Foundation on top
    items.sort((a, b) => {
        if (a.dataType === b.dataType) return a.name.localeCompare(b.name);
        return a.dataType === 'Foundation' ? -1 : 1;
    });

    return items.slice(0, 25);
}

// Get a normalized food; use cache with ~30-day TTL
export async function getFoodByIdService(fdcId) {
    const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
    // 1) Try cache first
    const cached = await FoodCache.findOne({ fdcId }).lean();
    const freshEnough =
        cached && cached.lastFetchedAt &&
        (Date.now() - cached.lastFetchedAt.getTime() < CACHE_TTL_MS);

    // If cached and valid (generic + non-zero macros), serve it
    if (freshEnough && cached?.dataType && ALLOWED_DATATYPES.includes(cached.dataType) && !isZeroBlock(cached.per100g)) {
        return {
        fdcId: cached.fdcId,
        name: cached.name,
        variant: cached.variant,
        per100g: cached.per100g,
        portions: cached.portions,
        cached: true,
        };
    }

    // If cached but invalid (non-generic or zero block), drop it before refetch
    if (cached && (!ALLOWED_DATATYPES.includes(cached.dataType || '') || isZeroBlock(cached.per100g))) {
        await FoodCache.deleteOne({ fdcId });
    }

    // 2) Fetch live detail from FDC
    const detail = await fdcGetFood(fdcId);

    // Guard: allow generic datasets only
    if (!ALLOWED_DATATYPES.includes(detail.dataType)) {
        const err = new Error(`Only generic foods are supported (got ${detail.dataType})`);
        err.status = 422;
        throw err;
    }

    // 3) Normalize → must produce non-zero per100g for generics
    const normalized = normalizeFood(detail);
    if (isZeroBlock(normalized.per100g)) {
        const err = new Error('Nutrient data unavailable for this record');
        err.status = 422;
        throw err;
    }

    // 4) Upsert into cache and return
    await FoodCache.findOneAndUpdate(
        { fdcId },
        { ...normalized, lastFetchedAt: new Date() },
        { upsert: true, new: true }
    );

    return { ...normalized, cached: false };
}

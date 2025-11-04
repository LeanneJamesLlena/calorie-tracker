import { useEffect } from 'react';
import Header from '../../components/Header/Header';
import DatePicker from '../../components/DatePicker/DatePicker';
import MacroBar from '../../components/MacroBar/MacroBar';
import MealCard from '../../components/MealCard/MealCard';
import useDiaryStore from '../../store/diaryStore';
import { toYMD } from '../../utils/date';
import s from './Diary.module.css';

export default function Diary() {

  const { date, setDate, targets, data, loading, error, fetchAll } = useDiaryStore();
  // Refetch diary data whenever the selected date changes
  useEffect(() => { fetchAll(); }, [date]); 
  // Fallbacks to prevent undefined values before data loads
  const t = targets || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const day = data?.dayTotals || { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const meals = data?.meals || { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
  // Derived values for ring display
  const remaining = Math.max(0, (t.calories || 0) - (day.kcal || 0));
  const eaten = day.kcal || 0;

  return (
    <>
      <Header />

      <main className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <DatePicker value={date} onChange={setDate} />

        {loading && <div className="card" style={{ padding: 16 }}>Loading…</div>}
        {error && !loading && <div className="alert" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Totals Card */}
        <section className={`card ${s.totals}`}>
          <div className={s.ringWrap}>
            <div
              className={s.ring}
              style={{
                background: `conic-gradient(var(--color-accent) ${Math.min(100, (t.calories>0? (eaten/t.calories)*100:0))}%,
                              #e2e8f0 0)`,
              }}
            >
              <div className={s.ringInner}>
                <div className={s.big}>{remaining}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Remaining</div>
              </div>
            </div>
            <div className={s.sideNums}>
              <div><strong>{eaten}</strong><span className="text-muted"> Eaten</span></div>
              <div><strong>{t.calories || 0}</strong><span className="text-muted"> Target</span></div>
            </div>
          </div>

          <div className={s.macros}>
            <MacroBar label="Protein" value={Math.round(day.protein||0)} target={t.protein||0} />
            <MacroBar label="Carbs"   value={Math.round(day.carbs||0)}   target={t.carbs||0} />
            <MacroBar label="Fat"     value={Math.round(day.fat||0)}     target={t.fat||0} />
            <MacroBar label="Fiber"   value={Math.round(day.fiber||0)}   target={t.fiber||0} />
          </div>
        </section>

        {/* Meals */}
        <div className={s.meals}>
          <MealCard title="Breakfast" items={meals.Breakfast} onAddClick={() => {/* open add sheet later */}} />
          <MealCard title="Lunch"     items={meals.Lunch}     onAddClick={() => {}} />
          <MealCard title="Dinner"    items={meals.Dinner}    onAddClick={() => {}} />
          <MealCard title="Snacks"    items={meals.Snack}     onAddClick={() => {}} />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className={s.bottomNav}>
        <a href="/diary" className={s.navItem} aria-current="page">Diary</a>
        <a href="/history" className={s.navItem}>History</a>
        <a href="/settings" className={s.navItem}>Settings</a>
      </nav>
    </>
  );
}

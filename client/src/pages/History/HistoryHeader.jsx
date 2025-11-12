import s from './History.module.css';

export default function HistoryHeader({ rangeLabel, onPreset, selected = 'this' }) {
  return (
    <div className={s.headerRow}>
      <h2 className={s.h2}>Weekly progress</h2>
      <div className={s.rightRow}>
        <span className={s.rangeText} aria-live="polite">{rangeLabel}</span>
        <div className={s.pills}>
          <label htmlFor="range-select" className="sr-only">Select range</label>
          <select
            id="range-select"
            className={s.select}
            value={selected}                
            onChange={(e) => onPreset(e.target.value)}
            aria-label="Select date range"
          >
            <option value="this">This week</option>
            <option value="last">Last week</option>
            <option value="last2">Last 2 weeks*</option>
          </select>
        </div>
      </div>
    </div>
  );
}

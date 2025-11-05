import { addDays, toYMD, prettyDate } from '../../utils/date';
import s from './DatePicker.module.css';

export default function DatePicker({ value, onChange }) {
    // Move the selected date forward or backward by n days
    const go = (n) => onChange(addDays(value, n));
    // Handle manual date input or picked from calendar
    const onInput = (e) => {
        const d = new Date(e.target.value);
        if (!Number.isNaN(d.getTime())) onChange(d);
    };

  return (

    <div className={s.wrap}>

        <button className="btn btn-outline" onClick={() => go(-1)}>⟵ Yesterday</button>
        <div className={s.center}>
            <div className={s.title}>Today</div>
            <div className="text-muted" style={{ fontSize: 14 }}>{prettyDate(value)}</div>
            <input
            className={s.inputDate}
            type="date"
            value={toYMD(value)}
            onChange={onInput}
            />
        </div>
        <button className="btn btn-outline" onClick={() => go(1)}>Tomorrow ⟶</button>

    </div>

  );
}

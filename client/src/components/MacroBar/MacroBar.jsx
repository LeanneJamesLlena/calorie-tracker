import s from './MacroBar.module.css';

export default function MacroBar({ label, value = 0, target = 0, unit = 'g' }) {
    // Calculate progress percentage (capped at 100%)
    const pct = Math.min(100, target > 0 ? Math.round((value / target) * 100) : 0);
    return (
        
        <div className={s.row}>

        <div className={s.top}>
            <span className={s.label}>{label}</span>
            <span className="text-muted">{value}{unit} / {target}{unit}</span>
        </div>
        <div className={s.track}>
            <div className={s.fill} style={{ width: `${pct}%` }} />
        </div>

        </div>

    );
}

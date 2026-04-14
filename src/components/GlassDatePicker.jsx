import React, { useState, useRef, useEffect } from 'react';

export default function GlassDatePicker({ value, onChange, max, accentColor = 'var(--accent)' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date(value + 'T00:00:00'));
  const [viewDate, setViewDate] = useState(new Date(value + 'T00:00:00'));

  useEffect(() => {
    setCurrentDate(new Date(value + 'T00:00:00'));
    setViewDate(new Date(value + 'T00:00:00'));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const handleSelect = (day) => {
    const newSelected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (max && newSelected > new Date(max + 'T00:00:00')) return; 
    
    const yyyy = newSelected.getFullYear();
    const mm = String(newSelected.getMonth() + 1).padStart(2, '0');
    const dd = String(newSelected.getDate()).padStart(2, '0');
    
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const setToday = () => {
    const n = new Date();
    const yyyy = n.getFullYear();
    const mm = String(n.getMonth() + 1).padStart(2, '0');
    const dd = String(n.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 is Sunday
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 'auto', padding: '10px 16px', fontSize: '0.9rem',
          background: 'var(--bg-body)', border: '1px solid var(--border)',
          borderRadius: 16, color: 'var(--text-primary)', boxSizing: 'border-box', 
          outline: 'none', transition: 'all 0.2s', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-body)'}
      >
        <span style={{ fontWeight: 600 }}>{`${String(currentDate.getDate()).padStart(2, '0')} / ${String(currentDate.getMonth() + 1).padStart(2, '0')} / ${currentDate.getFullYear()}`}</span>
        <span style={{ fontSize: '1.1rem', opacity: 0.8 }}>🗓️</span>
      </button>

      {isOpen && (
        <div 
          className="animate-fadeUp"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'var(--glass-bg)', backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            border: '1px solid var(--glass-border)', borderRadius: 24,
            padding: '24px', zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), var(--glass-shadow)',
            width: '320px'
          }}
        >
          {/* Top Accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button 
              onClick={() => changeMonth(-1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', width: 36, height: 36, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >‹</button>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.5px' }}>
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button 
              onClick={() => changeMonth(1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', width: 36, height: 36, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >›</button>
          </div>

          {/* Days of week */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px', textAlign: 'center' }}>
            {weekDays.map(day => (
              <span key={day} style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{day}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const thisDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === thisDateStr;
              const isFutureDaysRestricted = max && new Date(thisDateStr + 'T00:00:00') > new Date(max + 'T00:00:00');
              const isToday = thisDateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={idx}
                  disabled={isFutureDaysRestricted}
                  onClick={() => handleSelect(day)}
                  style={{
                    padding: '10px 0', border: 'none',
                    background: isSelected ? accentColor : 'transparent',
                    color: isFutureDaysRestricted ? 'rgba(255,255,255,0.1)' : isSelected ? '#080C1C' : '#fff',
                    borderRadius: '12px', fontSize: '0.95rem', fontWeight: isSelected ? 800 : 600,
                    cursor: isFutureDaysRestricted ? 'default' : 'pointer',
                    boxShadow: isSelected ? `0 4px 15px ${accentColor}66` : 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected && !isFutureDaysRestricted) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected && !isFutureDaysRestricted) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {day}
                  {isToday && !isSelected && (
                    <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: accentColor }} />
                  )}
                </button>
              );
            })}
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
             <button 
                onClick={setToday}
                style={{ 
                   background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', 
                   border: '1px solid rgba(255,255,255,0.1)', padding: '8px 24px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700,
                   cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
             >
                Ir a hoy
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

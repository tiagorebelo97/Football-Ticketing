import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  total_capacity: number;
  current_attendance: number;
  ticket_price: number;
  status: string;
}

const Calendar: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadMatches = useCallback(async () => {
    if (!user?.clubId) return;

    try {
      const response = await axios.get(`/api/matches?clubId=${user.clubId}`);
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user?.clubId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getMatchesForDate = (date: Date) => {
    return matches.filter(match => {
      const matchDate = new Date(match.match_date);
      return (
        matchDate.getDate() === date.getDate() &&
        matchDate.getMonth() === date.getMonth() &&
        matchDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" style={{
        background: 'rgba(255, 255, 255, 0.01)',
        minHeight: '120px'
      }} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayMatches = getMatchesForDate(date);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''}`}
          style={{
            minHeight: '120px',
            padding: '12px',
            background: isToday ? 'rgba(79, 172, 254, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            cursor: dayMatches.length > 0 ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'background 0.2s'
          }}
        >
          <div style={{
            fontWeight: isToday ? 'bold' : '500',
            color: isToday ? 'var(--accent-secondary)' : '#ffffff',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {day}
            {isToday && <span style={{ fontSize: '10px', background: 'var(--accent-secondary)', color: '#000', padding: '1px 4px', borderRadius: '4px' }}>TODAY</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {dayMatches.map(match => (
              <div
                key={match.id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/matches');
                }}
                style={{
                  backgroundColor: match.status === 'scheduled' ? 'rgba(16, 185, 129, 0.15)' :
                    match.status === 'ongoing' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(158, 158, 158, 0.1)',
                  color: match.status === 'scheduled' ? '#10b981' :
                    match.status === 'ongoing' ? '#f59e0b' : '#9e9e9e',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${match.status === 'scheduled' ? 'rgba(16, 185, 129, 0.2)' :
                    match.status === 'ongoing' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(158, 158, 158, 0.2)'}`
                }}
                title={`${match.home_team} vs ${match.away_team} - ${new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              >
                {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {match.home_team}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>Loading calendar...</div>;
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 0 40px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '2.5rem' }}>Match Calendar</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Organize and manage your season schedule
          </p>
        </div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/create-match')}>
          + New Match
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        {/* Calendar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="premium-btn premium-btn-secondary" onClick={goToPreviousMonth}>
            ← Previous
          </button>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button className="premium-btn" onClick={goToToday} style={{
              padding: '6px 12px',
              fontSize: '13px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)'
            }}>
              Today
            </button>
          </div>
          <button className="premium-btn premium-btn-secondary" onClick={goToNextMonth}>
            Next →
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            Scheduled
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%' }} />
            Ongoing
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '50%' }} />
            Completed/Cancelled
          </div>
        </div>

        {/* Day names */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: 'var(--border-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px 12px 0 0',
          overflow: 'hidden'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '13px',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.03)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: 'var(--border-glass)',
          border: '1px solid var(--border-glass)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden'
        }}>
          {renderCalendar()}
        </div>
      </div>

      {/* Upcoming matches summary */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px', color: '#ffffff', fontSize: '1.5rem' }}>Next Scheduled Events</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {matches
            .filter(m => new Date(m.match_date) >= new Date() && m.status === 'scheduled')
            .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
            .slice(0, 4)
            .map(match => (
              <div
                key={match.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  border: '1px solid var(--border-glass)'
                }}
                onClick={() => navigate('/matches')}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    color: '#10b981',
                    fontSize: '20px'
                  }}>
                    ⚽
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ffffff' }}>
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span>📅 {new Date(match.match_date).toLocaleDateString()}</span>
                      <span>⏰ {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-secondary)', marginTop: '4px' }}>
                      📍 {match.venue}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Ticket Price
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    €{Number(match.ticket_price).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                    {match.current_attendance} booked
                  </div>
                </div>
              </div>
            ))}
          {matches.filter(m => new Date(m.match_date) >= new Date() && m.status === 'scheduled').length === 0 && (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No upcoming matches scheduled currently.
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default Calendar;

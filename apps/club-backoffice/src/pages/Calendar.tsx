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
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
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
            minHeight: '100px',
            border: '1px solid #e0e0e0',
            padding: '8px',
            backgroundColor: isToday ? '#e3f2fd' : '#fff',
            cursor: dayMatches.length > 0 ? 'pointer' : 'default',
          }}
        >
          <div style={{ 
            fontWeight: isToday ? 'bold' : 'normal',
            color: isToday ? '#1976d2' : '#333',
            marginBottom: '5px',
            fontSize: '14px',
          }}>
            {day}
          </div>
          {dayMatches.map(match => (
            <div
              key={match.id}
              onClick={() => navigate('/matches')}
              style={{
                backgroundColor: match.status === 'scheduled' ? '#4caf50' : 
                                match.status === 'ongoing' ? '#ff9800' : '#9e9e9e',
                color: 'white',
                padding: '4px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                marginBottom: '3px',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={`${match.home_team} vs ${match.away_team} - ${new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            >
              {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {match.home_team} vs {match.away_team}
            </div>
          ))}
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
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-secondary)' }}>Match Calendar</h2>
          <p style={{ margin: '5px 0 0', color: 'var(--color-text-light)' }}>Organize your season schedule</p>
        </div>
        <button className="btn btn-success" onClick={() => navigate('/create-match')}>
          + New Match
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="btn" onClick={goToPreviousMonth} style={{ padding: '8px 16px' }}>
            ← Previous
          </button>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '20px' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button className="btn btn-primary" onClick={goToToday} style={{ padding: '6px 12px', fontSize: '12px' }}>
              Today
            </button>
          </div>
          <button className="btn" onClick={goToNextMonth} style={{ padding: '8px 16px' }}>
            Next →
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '2px' }} />
            <span>Scheduled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff9800', borderRadius: '2px' }} />
            <span>Ongoing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#9e9e9e', borderRadius: '2px' }} />
            <span>Completed/Cancelled</span>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0',
          marginBottom: '10px',
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ 
              padding: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#666',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0',
        }}>
          {renderCalendar()}
        </div>
      </div>

      {/* Upcoming matches summary */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--color-secondary)' }}>Upcoming Matches</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {matches
            .filter(m => new Date(m.match_date) >= new Date() && m.status === 'scheduled')
            .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
            .slice(0, 5)
            .map(match => (
              <div 
                key={match.id} 
                className="card"
                style={{ 
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/matches')}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {match.home_team} vs {match.away_team}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    📅 {new Date(match.match_date).toLocaleDateString()} at {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' '} | 📍 {match.venue}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {match.current_attendance} / {match.total_capacity} fans
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    €{Number(match.ticket_price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          {matches.filter(m => new Date(m.match_date) >= new Date() && m.status === 'scheduled').length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
              No upcoming matches scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

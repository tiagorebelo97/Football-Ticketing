import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchCalendar from './pages/MatchCalendar';
import TicketCheckout from './pages/TicketCheckout';
import MyTickets from './pages/MyTickets';
import TicketDetail from './pages/TicketDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>⚽ Football Ticketing</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MatchCalendar />} />
            <Route path="/checkout/:matchId" element={<TicketCheckout />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/ticket/:ticketId" element={<TicketDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

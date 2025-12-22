import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (staff: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [nfcCardId, setNfcCardId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_POS_API_URL || 'http://pos-api.localhost/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/nfc-login`, {
        nfcCardId: nfcCardId
      });
      
      if (response.data.success) {
        onLogin(response.data.staff);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to POS API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>POS Web App - Staff Login</h2>
        
        <div className="info-box">
          <p><strong>Note:</strong> In the Android app, staff would tap their NFC card. For the web version, please enter your NFC Card ID manually.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nfcCardId">NFC Card ID</label>
            <input
              type="text"
              id="nfcCardId"
              value={nfcCardId}
              onChange={(e) => setNfcCardId(e.target.value)}
              placeholder="Enter your NFC Card ID"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="button-primary"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
          <small>For testing purposes, you can use any valid staff NFC card ID from the database.</small>
        </div>
      </div>
    </div>
  );
};

export default Login;

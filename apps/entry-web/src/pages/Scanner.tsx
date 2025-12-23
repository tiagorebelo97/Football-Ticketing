import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  matchId: string;
  matchName: string;
  gate: string;
  onBack: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ matchId, matchName, gate, onBack }) => {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState<'qr' | 'nfc'>('qr');
  const [nfcInput, setNfcInput] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_ENTRY_API_URL || 'http://entry-api.localhost/api';

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanMode === 'qr') {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleValidation(decodedText, 'qr');
          scanner?.clear();
        },
        (error) => {
          // Scanning errors are expected
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.warn);
      }
    };
  }, [scanMode]);

  const handleValidation = async (code: string, type: 'qr' | 'nfc') => {
    setLoading(true);
    setValidationResult(null);

    try {
      const response = await axios.post(`${API_URL}/validation/validate`, {
        ticketIdentifier: code,
        matchId,
        gateNumber: gate,
        entryType: type
      });

      setValidationResult({
        success: response.data.valid,
        message: response.data.valid ? 'Access Granted' : response.data.error,
        ticket: response.data.ticket
      });

      // Clear result after 3 seconds for fast throughput
      setTimeout(() => {
        setValidationResult(null);
        if (type === 'nfc') setNfcInput('');
      }, 3000);
    } catch (err: any) {
      setValidationResult({
        success: false,
        message: err.response?.data?.error || 'Validation failed'
      });

      setTimeout(() => {
        setValidationResult(null);
        if (type === 'nfc') setNfcInput('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleNfcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nfcInput.trim()) {
      handleValidation(nfcInput, 'nfc');
    }
  };

  return (
    <div>
      <div className="header">
        <h1>{matchName}</h1>
        <div className="nav-buttons">
          <button className="btn btn-outline" onClick={() => navigate('/capacity')}>
            Stats
          </button>
          <button className="btn btn-outline" onClick={onBack}>
            Exit Gate
          </button>
        </div>
      </div>

      <div className="container">
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem' }}>{gate}</h2>
        </div>

        <div className="scanner-modes" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`btn ${scanMode === 'qr' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setScanMode('qr')}
          >
            📷 QR
          </button>
          <button
            className={`btn ${scanMode === 'nfc' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setScanMode('nfc')}
          >
            📱 NFC
          </button>
        </div>

        <div className="glass-card">
          {scanMode === 'qr' ? (
            <div id="qr-reader" style={{ width: '100%' }}></div>
          ) : (
            <form onSubmit={handleNfcSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={nfcInput}
                  onChange={(e) => setNfcInput(e.target.value)}
                  placeholder="Scan or enter NFC UID"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'white',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading || !nfcInput.trim()}
              >
                {loading ? 'Validating...' : 'Validate'}
              </button>
            </form>
          )}
        </div>

        {validationResult && (
          <div className={`status-indicator ${validationResult.success ? 'success' : 'error'}`}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              {validationResult.success ? '✅ OK' : '❌ NO'}
            </h1>
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{validationResult.message}</p>
            {validationResult.ticket && (
              <p style={{ marginTop: '8px', fontSize: '0.9rem', opacity: 0.8 }}>
                Ticket ID: {validationResult.ticket.id.substring(0, 8)}...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;

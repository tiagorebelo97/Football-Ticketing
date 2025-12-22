import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  gate: string;
  onBack: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ gate, onBack }) => {
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
          // Scanning errors are expected and frequent during normal operation
          // Only log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            console.debug('QR scan error:', error);
          }
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => {
          // Log cleanup errors in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('Scanner cleanup error:', error);
          }
        });
      }
    };
  }, [scanMode]);

  const handleValidation = async (code: string, type: 'qr' | 'nfc') => {
    setLoading(true);
    setValidationResult(null);

    try {
      const response = await axios.post(`${API_URL}/validation/validate`, {
        code,
        entryType: type,
        gate
      });

      setValidationResult({
        success: response.data.success,
        message: response.data.message,
        ticketInfo: response.data.ticketInfo
      });

      // Clear result after 5 seconds
      setTimeout(() => {
        setValidationResult(null);
        if (type === 'nfc') {
          setNfcInput('');
        }
      }, 5000);
    } catch (err: any) {
      setValidationResult({
        success: false,
        message: err.response?.data?.message || 'Validation failed'
      });

      setTimeout(() => {
        setValidationResult(null);
        if (type === 'nfc') {
          setNfcInput('');
        }
      }, 5000);
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

  const handleBackClick = () => {
    onBack();
    navigate('/gate-selection');
  };

  return (
    <div>
      <div className="header">
        <h1>Entry Scanner - {gate}</h1>
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => navigate('/capacity')}>
            Capacity
          </button>
          <button className="nav-button" onClick={handleBackClick}>
            Back to Gates
          </button>
        </div>
      </div>

      <div className="container scanner-container">
        <div className="scanner-modes">
          <button
            className={`mode-button ${scanMode === 'qr' ? 'active' : ''}`}
            onClick={() => setScanMode('qr')}
          >
            📷 QR Code Scanner
          </button>
          <button
            className={`mode-button ${scanMode === 'nfc' ? 'active' : ''}`}
            onClick={() => setScanMode('nfc')}
          >
            📱 NFC Manual Entry
          </button>
        </div>

        <div className="scanner-area">
          {scanMode === 'qr' ? (
            <div>
              <h3 style={{ textAlign: 'center', marginTop: 0 }}>Scan QR Code</h3>
              <div id="qr-reader"></div>
            </div>
          ) : (
            <div>
              <h3 style={{ textAlign: 'center', marginTop: 0 }}>Enter NFC Card ID</h3>
              <div className="info-box">
                <p><strong>Note:</strong> In the Android app, fans would tap their NFC card. For the web version, please enter the NFC Card ID manually.</p>
              </div>
              <form onSubmit={handleNfcSubmit}>
                <div className="form-group">
                  <label htmlFor="nfcInput">NFC Card ID</label>
                  <input
                    type="text"
                    id="nfcInput"
                    value={nfcInput}
                    onChange={(e) => setNfcInput(e.target.value)}
                    placeholder="Enter NFC Card ID"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="button-primary"
                  disabled={loading || !nfcInput.trim()}
                >
                  {loading ? 'Validating...' : 'Validate Entry'}
                </button>
              </form>
            </div>
          )}
        </div>

        {validationResult && (
          <div className={`validation-result ${validationResult.success ? 'success' : 'error'}`}>
            <h2>{validationResult.success ? '✅ ENTRY APPROVED' : '❌ ENTRY DENIED'}</h2>
            <p>{validationResult.message}</p>
            {validationResult.ticketInfo && (
              <div style={{ marginTop: '15px', fontSize: '14px' }}>
                <p><strong>Match:</strong> {validationResult.ticketInfo.match}</p>
                <p><strong>Fan:</strong> {validationResult.ticketInfo.fan}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;

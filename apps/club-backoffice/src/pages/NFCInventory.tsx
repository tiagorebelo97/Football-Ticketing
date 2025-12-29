import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Inventory {
  status: string;
  count: string;
}

interface StockConfig {
  total_cards: number;
  available_cards: number;
  deposit_amount: number;
}

const NFCInventory: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [config, setConfig] = useState<StockConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (user?.clubId) {
      loadInventory();
    }
  }, [user?.clubId]);

  const loadInventory = async () => {
    try {
      if (!user?.clubId) return;
      const clubId = user.clubId;
      const response = await axios.get(`/api/nfc/inventory/${clubId}`);
      setInventory(response.data.inventory);
      setConfig(response.data.config);
      setLoading(false);
    } catch (err) {
      setError('Failed to load NFC inventory');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>NFC Card Inventory</h2>

      {config && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="card">
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{config.total_cards}</div>
            <div style={{ color: 'var(--color-text-light)' }}>Total Cards</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {config.available_cards}
            </div>
            <div style={{ color: 'var(--color-text-light)' }}>Available</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f39c12' }}>
              ${config.deposit_amount.toFixed(2)}
            </div>
            <div style={{ color: 'var(--color-text-light)' }}>Deposit Amount</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Card Status Breakdown</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const total = config?.total_cards || 1;
              const percentage = ((parseInt(item.count, 10) / total) * 100).toFixed(1);
              return (
                <tr key={item.status}>
                  <td style={{ textTransform: 'capitalize' }}>{item.status}</td>
                  <td>{item.count}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NFCInventory;

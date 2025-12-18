import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const clubId = 'demo-club-id'; // Would come from auth
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
      <h2>NFC Card Inventory</h2>

      {config && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{config.total_cards}</div>
            <div className="stat-label">Total Cards</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
            <div className="stat-value" style={{ color: '#27ae60' }}>
              {config.available_cards}
            </div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#f39c12' }}>
            <div className="stat-value" style={{ color: '#f39c12' }}>
              ${config.deposit_amount.toFixed(2)}
            </div>
            <div className="stat-label">Deposit Amount</div>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: '40px' }}>Card Status Breakdown</h3>
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
  );
};

export default NFCInventory;

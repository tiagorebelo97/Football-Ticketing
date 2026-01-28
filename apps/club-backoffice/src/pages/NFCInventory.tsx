import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(t('nfc.loadError'));
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{t('common.loading')}...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '8px' }}>
        <h1 className="font-premium text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          {t('nfc.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {t('nfc.subtitle')}
        </p>
      </div>

      {config && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              {config.total_cards}
            </div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
              {t('nfc.totalStock')}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#22c55e', marginBottom: '8px' }}>
              {config.available_cards}
            </div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
              {t('nfc.availableStock')}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="text-gradient" style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>
              €{config.deposit_amount.toFixed(2)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
              {t('nfc.depositAmount')}
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-premium" style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>{t('nfc.statusBreakdown')}</h3>
        <div className="responsive-table-wrapper">
          <table className="member-table" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th>{t('nfc.status.label')}</th>
                <th style={{ textAlign: 'right' }}>{t('nfc.count')}</th>
                <th style={{ textAlign: 'right' }}>{t('nfc.percentage')}</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const total = config?.total_cards || 1;
                const percentage = ((parseInt(item.count, 10) / total) * 100).toFixed(1);
                return (
                  <tr key={item.status}>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-main)' }}>{item.status}</td>
                    <td style={{ textAlign: 'right' }}>{item.count}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'var(--accent-primary)'
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, minWidth: '45px' }}>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NFCInventory;

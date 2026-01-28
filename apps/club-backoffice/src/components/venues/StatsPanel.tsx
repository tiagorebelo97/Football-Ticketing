import React from 'react';
import { Users, Layers, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatsPanelProps {
    totalCapacity: number;
    standCount: number;
    completionPercentage: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
    totalCapacity,
    standCount,
    completionPercentage
}) => {
    const { t } = useTranslation();

    return (
        <div className="dashboard-stats-inner">
            <div className="stat-item">
                <Users size={16} color="#00d4ff" />
                <span className="stat-label">{t('venueWizard.capacity')}</span>
                <span className="stat-value">{totalCapacity.toLocaleString()}</span>
            </div>

            <div className="stat-item divider" />

            <div className="stat-item">
                <Layers size={16} color="#00d4ff" />
                <span className="stat-label">{t('venueWizard.stands')}</span>
                <span className="stat-value">{standCount}/4</span>
            </div>

            <div className="stat-item divider" />

            <div className="stat-item">
                <TrendingUp size={16} color="#00d4ff" />
                <span className="stat-label">{t('venueWizard.status')}</span>
                <div className="stat-progress-container">
                    <div className="stat-progress-bar-wrapper">
                        <div
                            className="stat-progress-fill"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    <span className="stat-value">{Math.round(completionPercentage)}%</span>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;

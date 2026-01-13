import React from 'react';
import { Users, Layers, TrendingUp } from 'lucide-react';

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
    return (
        <div className="stadium-stats-panel stadium-glass-intense stadium-animate-fade-in">
            <div className="stadium-label" style={{ marginBottom: 16 }}>
                Estatísticas do Estádio
            </div>

            <div className="stadium-stat-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={20} color="#00d4ff" />
                    <span className="stadium-label">Capacidade Total</span>
                </div>
                <span className="stadium-stat">{totalCapacity.toLocaleString()}</span>
            </div>

            <div className="stadium-stat-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={20} color="#00d4ff" />
                    <span className="stadium-label">Bancadas</span>
                </div>
                <span className="stadium-stat">{standCount}/4</span>
            </div>

            <div className="stadium-stat-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={20} color="#00d4ff" />
                    <span className="stadium-label">Conclusão</span>
                </div>
                <span className="stadium-stat">{Math.round(completionPercentage)}%</span>
            </div>

            <div className="stadium-progress-bar">
                <div
                    className="stadium-progress-fill"
                    style={{ width: `${completionPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default StatsPanel;

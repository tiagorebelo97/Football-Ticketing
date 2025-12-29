import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number; // percentage
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend }) => {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--color-text-light)', fontSize: '14px', marginBottom: '10px' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
                {trend && (
                    <div style={{
                        color: trend.value > 0 ? '#2ecc71' : trend.value < 0 ? 'var(--color-danger)' : '#bdc3c7',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: 500
                    }}>
                        {trend.value > 0 && '+'}{trend.value}%
                        {trend.value > 0 ? <FaArrowUp style={{ marginLeft: '4px', fontSize: '12px' }} /> : trend.value < 0 ? <FaArrowDown style={{ marginLeft: '4px', fontSize: '12px' }} /> : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;

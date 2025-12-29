import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
    data?: Array<{ name: string; value: number }>;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data = [] }) => {
    return (
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Revenue Activity</h3>
                <select style={{ border: 'none', background: 'transparent', color: 'var(--color-text)', fontWeight: 600, cursor: 'pointer' }}>
                    <option style={{ color: 'black' }}>Last 6 Months</option>
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={15}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ color: 'black' }} />
                        <Bar dataKey="value" fill="var(--color-primary-dark)" radius={[10, 10, 10, 10]} background={{ fill: '#eafaf1', radius: 10 }} />
                    </BarChart>
                </ResponsiveContainer>
                {data.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#aaa', marginTop: '-150px' }}>No revenue data available</div>
                )}
            </div>
        </div>
    );
};

export default ActivityChart;

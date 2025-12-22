import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'JAN', value: 100 },
    { name: 'FEB', value: 200 },
    { name: 'MAR', value: 180 },
    { name: 'APR', value: 278 },
    { name: 'MAY', value: 350 },
    { name: 'JUN', value: 300 },
    { name: 'JUL', value: 130 },
    { name: 'AUG', value: 180 },
    { name: 'SEP', value: 220 },
    { name: 'OCT', value: 190 },
    { name: 'NOV', value: 390 },
    { name: 'DEC', value: 410 },
];

const ActivityChart: React.FC = () => {
    return (
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Activity</h3>
                <select style={{ border: 'none', background: 'transparent', color: 'var(--color-text)', fontWeight: 600, cursor: 'pointer' }}>
                    <option>Month</option>
                    <option>Year</option>
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={15}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" fill="var(--color-primary-dark)" radius={[10, 10, 10, 10]} background={{ fill: '#eafaf1', radius: 10 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityChart;

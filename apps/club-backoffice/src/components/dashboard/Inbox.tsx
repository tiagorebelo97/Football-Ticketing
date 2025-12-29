import React from 'react';

interface InboxProps {
    messages?: Array<{
        id: string;
        user: string;
        text: string;
        time: string;
        type?: string;
    }>;
}

const Inbox: React.FC<InboxProps> = ({ messages = [] }) => {
    return (
        <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Recent System Events</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        backgroundColor: '#f1f2f6',
                        borderRadius: '10px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: msg.type === 'sale' ? '#d1fae5' : '#dbeafe', // Green for sale, Blue for member
                            color: msg.type === 'sale' ? '#059669' : '#1d4ed8',
                            marginRight: '15px',
                            border: '2px solid #fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}>
                            {msg.type === 'sale' ? '$$' : 'User'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-secondary)' }}>{msg.user}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>{msg.text}</div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#bdc3c7' }}>{msg.time}</div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#bdc3c7', padding: '20px' }}>No recent activity</div>
                )}
            </div>
        </div>
    );
};

export default Inbox;

import React from 'react';

const messages = [
    { id: 1, user: 'NewUser99', text: 'When are tickets available?', time: '12:45 PM' },
    { id: 2, user: 'NewUser99', text: 'When are tickets available?', time: '12:45 PM' },
    { id: 3, user: 'NewUser99', text: 'When are tickets available?', time: '12:45 PM' },
    { id: 4, user: 'NewUser99', text: 'When are tickets available?', time: '12:45 PM' },
];

const Inbox: React.FC = () => {
    return (
        <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Inbox</h3>
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
                            backgroundColor: '#dadee6',
                            marginRight: '15px',
                            border: '2px solid #fff'
                        }}></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-secondary)' }}>{msg.user}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>{msg.text}</div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#bdc3c7' }}>{msg.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inbox;

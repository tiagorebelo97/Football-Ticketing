import React from 'react';

const members = [
    { name: 'ZéPincel23', status: null },
    { name: 'Matumbo', status: null },
    { name: 'ArthurPicanhas', status: null },
    { name: 'Esgalha', status: null },
    { name: 'Caoceição', status: 'Join' },
];

const NewMembersList: React.FC = () => {
    return (
        <div className="card">
            <h3 style={{ marginBottom: '20px' }}>New Members Live</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {members.map((member, idx) => (
                        <MemberItem key={`l-${idx}`} member={member} />
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {members.map((member, idx) => (
                        <MemberItem key={`r-${idx}`} member={member} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const MemberItem: React.FC<{ member: { name: string, status: string | null } }> = ({ member }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#ecf0f1',
            marginRight: '10px',
            border: '1px solid #bdc3c7'
        }}></div>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>{member.name}</div>
        {member.status && (
            <span style={{
                marginLeft: 'auto',
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '4px'
            }}>
                {member.status}
            </span>
        )}
    </div>
);

export default NewMembersList;

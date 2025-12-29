import React from 'react';

interface NewMembersListProps {
    members?: Array<{
        name: string;
        status: string;
    }>;
}

const NewMembersList: React.FC<NewMembersListProps> = ({ members = [] }) => {
    return (
        <div className="card">
            <h3 style={{ marginBottom: '20px' }}>New Members</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {members.map((member, idx) => (
                        <MemberItem key={`m-${idx}`} member={member} />
                    ))}
                    {members.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#bdc3c7', padding: '20px' }}>No new members recently</div>
                    )}
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
                backgroundColor: member.status === 'Active' ? 'var(--color-primary)' : '#95a5a6',
                color: 'white',
                borderRadius: '4px'
            }}>
                {member.status}
            </span>
        )}
    </div>
);

export default NewMembersList;

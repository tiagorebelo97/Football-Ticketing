import React from 'react';
import { Save } from 'lucide-react';

interface TopBarProps {
    venueName: string;
    onSave: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ venueName, onSave }) => {
    return (
        <div className="stadium-top-bar stadium-glass">
            <div className="stadium-top-bar-title">
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #00d4ff, #0099ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                }}>
                    🏟️
                </div>
                <div>
                    <div className="stadium-heading-md">{venueName}</div>
                    <div className="stadium-label" style={{ marginTop: 2 }}>Stadium Architect</div>
                </div>
            </div>

            <div className="stadium-top-bar-actions">
                <button className="stadium-btn stadium-btn-primary" onClick={onSave}>
                    <Save size={16} />
                    Guardar Estádio
                </button>
            </div>
        </div>
    );
};

export default TopBar;

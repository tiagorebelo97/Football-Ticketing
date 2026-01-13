import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Plus } from 'lucide-react';

interface ActionPaletteProps {
    onUndo: () => void;
    onRedo: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const ActionPalette: React.FC<ActionPaletteProps> = ({
    onUndo,
    onRedo,
    onZoomIn,
    onZoomOut
}) => {
    return (
        <div className="stadium-action-palette">
            <button
                className="stadium-action-btn stadium-glass"
                onClick={onUndo}
                title="Desfazer (Ctrl+Z)"
            >
                <Undo />
            </button>

            <button
                className="stadium-action-btn stadium-glass"
                onClick={onRedo}
                title="Refazer (Ctrl+Y)"
            >
                <Redo />
            </button>

            <div style={{ height: 16 }} />

            <button
                className="stadium-action-btn stadium-glass"
                onClick={onZoomIn}
                title="Zoom In"
            >
                <ZoomIn />
            </button>

            <button
                className="stadium-action-btn stadium-glass"
                onClick={onZoomOut}
                title="Zoom Out"
            >
                <ZoomOut />
            </button>
        </div>
    );
};

export default ActionPalette;

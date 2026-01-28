import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    return (
        <div
            className="stadium-action-palette"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="stadium-action-btn stadium-glass"
                onClick={onUndo}
                title={t('venueWizard.undoTooltip')}
            >
                <Undo />
            </button>

            <button
                className="stadium-action-btn stadium-glass"
                onClick={onRedo}
                title={t('venueWizard.redoTooltip')}
            >
                <Redo />
            </button>

            <div style={{ height: 16 }} />

            <button
                className="stadium-action-btn stadium-glass"
                onClick={onZoomIn}
                title={t('venueWizard.zoomIn')}
            >
                <ZoomIn />
            </button>

            <button
                className="stadium-action-btn stadium-glass"
                onClick={onZoomOut}
                title={t('venueWizard.zoomOut')}
            >
                <ZoomOut />
            </button>
        </div>
    );
};

export default ActionPalette;

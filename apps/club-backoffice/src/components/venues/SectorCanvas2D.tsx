import React from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { useTranslation } from 'react-i18next';
import { Row } from '../../services/venueService';

interface SectorCanvas2DProps {
  rows: Row[];
  totalSeats: number;
}

const SectorCanvas2D: React.FC<SectorCanvas2DProps> = ({ rows, totalSeats }) => {
  const { t } = useTranslation();
  const stageRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = React.useState({ width: 800, height: 600 });
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setStageSize({ width, height });
    }
  }, []);

  const padding = 40;
  const rowLabelWidth = 100;
  const seatSize = 20;
  const maxSeatsPerRow = rows.length > 0 ? Math.max(...rows.map((r: Row) => r.seatsCount)) : 10;

  const pitchWidth = maxSeatsPerRow * seatSize;
  const pitchX = padding + rowLabelWidth;
  const fieldHeight = 120;
  const rowSpacing = 45;

  // Auto-fit and Center Content on Load
  React.useEffect(() => {
    if (containerRef.current && rows.length > 0) {
      const { width, height } = containerRef.current.getBoundingClientRect();

      const contentWidth = padding + rowLabelWidth + (maxSeatsPerRow * seatSize) + padding;
      const contentHeight = padding + fieldHeight + (rows.length * rowSpacing) + padding + 50;

      const scaleX = (width - 80) / contentWidth;
      const scaleY = (height - 80) / contentHeight;
      const newScale = Math.max(0.2, Math.min(1.2, scaleX, scaleY));

      setScale(newScale);
      setPosition({
        x: (width - contentWidth * newScale) / 2,
        y: 40
      });
    }
  }, [rows.length === 0, maxSeatsPerRow]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * 1.05 : oldScale / 1.05;
    newScale = Math.max(0.1, Math.min(5, newScale));

    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };

  const renderField = () => {
    const fieldY = padding;
    const stripeCount = 8;
    const stripeWidth = pitchWidth / stripeCount;

    return (
      <Group>
        <Rect
          x={pitchX}
          y={fieldY}
          width={pitchWidth}
          height={fieldHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: fieldHeight }}
          fillLinearGradientColorStops={[0, '#2e7d32', 1, '#1b5e20']}
          cornerRadius={4}
          shadowColor="#000"
          shadowBlur={10}
          shadowOpacity={0.2}
        />

        {Array.from({ length: stripeCount }).map((_, i) => (
          <Rect
            key={i}
            x={pitchX + (i * stripeWidth)}
            y={fieldY}
            width={stripeWidth}
            height={fieldHeight}
            fill={i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent'}
          />
        ))}

        <Text
          x={pitchX}
          y={fieldY + fieldHeight + 10}
          width={pitchWidth}
          text={t('venueWizard.orientationPitch')}
          fontSize={10}
          fontStyle="bold"
          fill="#4ade80"
          align="center"
          letterSpacing={2}
          opacity={0.6}
        />
      </Group>
    );
  };

  const renderSeats = () => {
    const startY = padding + fieldHeight + 80;
    const startX = padding + rowLabelWidth;

    return rows.map((row: Row, rowIndex: number) => {
      const y = startY + rowIndex * rowSpacing;

      return (
        <Group key={row.id || rowIndex}>
          <Text
            x={padding}
            y={y - seatSize / 2}
            width={rowLabelWidth - 10}
            height={seatSize}
            text={row.name.toUpperCase()}
            fontSize={11}
            fontStyle="bold"
            fill="#94a3b8"
            align="left"
            verticalAlign="middle"
            letterSpacing={1.5}
          />

          {Array.from({ length: row.seatsCount }).map((_, seatIndex) => {
            const seatX = startX + seatIndex * seatSize;

            return (
              <Rect
                key={`${row.id}-${seatIndex}`}
                x={seatX}
                y={y - seatSize / 2}
                width={seatSize - 4}
                height={seatSize - 4}
                fill="#00d4ff"
                opacity={0.85}
                cornerRadius={4}
                shadowColor="#00d4ff"
                shadowBlur={5}
                shadowOpacity={0.4}
              />
            );
          })}
        </Group>
      );
    });
  };

  return (
    <div
      className="sector-canvas-architect-v3"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '550px',
        background: '#020617',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'grab',
        position: 'relative'
      }}
      onMouseDown={() => { if (containerRef.current) containerRef.current.style.cursor = 'grabbing'; }}
      onMouseUp={() => { if (containerRef.current) containerRef.current.style.cursor = 'grab'; }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        draggable
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        onDragEnd={(e) => {
          setPosition({ x: e.target.x(), y: e.target.y() });
        }}
        ref={stageRef}
      >
        <Layer>
          <Rect
            width={4000}
            height={4000}
            fill="transparent"
            x={-1000}
            y={-1000}
          />

          {Array.from({ length: 100 }).map((_, i) => (
            <React.Fragment key={i}>
              <Rect x={-1000} y={i * 60 - 1000} width={4000} height={1} fill="#ffffff" opacity={0.015} listening={false} />
              <Rect x={i * 60 - 1000} y={-1000} width={1} height={4000} fill="#ffffff" opacity={0.015} listening={false} />
            </React.Fragment>
          ))}

          <Group>
            {renderField()}
            {rows.length > 0 ? (
              renderSeats()
            ) : (
              <Group>
                <Text
                  x={0}
                  y={200}
                  width={stageSize.width}
                  text={t('venueWizard.waitingSeatDefinition')}
                  fontSize={14}
                  fontStyle="bold"
                  fill="#64748b"
                  align="center"
                  letterSpacing={2}
                />
              </Group>
            )}
          </Group>
        </Layer>
      </Stage>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        color: '#00d4ff',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        pointerEvents: 'none',
        fontFamily: 'monospace',
        backdropFilter: 'blur(4px)'
      }}>
        ZOOM: {Math.round(scale * 100)}% | PAN ACTIVE
      </div>
    </div>
  );
};

export default SectorCanvas2D;

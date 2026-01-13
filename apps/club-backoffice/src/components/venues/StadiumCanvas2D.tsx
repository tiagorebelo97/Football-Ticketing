
import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import { Stand } from '../../services/venueService';

interface StadiumCanvas2DProps {
  sportCode: string;
  stands: Stand[];
  selectedStandId: string | null;
  onStandClick: (standId: string | null) => void;
}

const LOGICAL_WIDTH = 1000;
const LOGICAL_HEIGHT = 800;

const StadiumCanvas2D: React.FC<StadiumCanvas2DProps> = ({
  sportCode,
  stands,
  selectedStandId,
  onStandClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = React.useState({ width: 800, height: 600 });
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(600, width * 0.75);

        const scaleX = width / LOGICAL_WIDTH;
        const scaleY = height / LOGICAL_HEIGHT;
        const newScale = Math.min(scaleX, scaleY);

        setStageDimensions({ width, height });
        setScale(newScale);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getFieldDimensions = () => {
    const fieldConfigs: { [key: string]: { width: number; height: number; color: string; accent: string } } = {
      football: { width: 420, height: 272, color: '#1a4a1c', accent: '#2e7d32' },
      hockey: { width: 320, height: 160, color: '#1a237e', accent: '#283593' },
      futsal: { width: 320, height: 160, color: '#2e7d32', accent: '#388e3c' },
      basketball: { width: 280, height: 150, color: '#bf360c', accent: '#d84315' },
      handball: { width: 320, height: 160, color: '#01579b', accent: '#0277bd' },
      volleyball: { width: 270, height: 135, color: '#f57f17', accent: '#f9a825' }
    };
    return fieldConfigs[sportCode] || fieldConfigs.football;
  };

  const fieldDims = getFieldDimensions();
  const centerX = LOGICAL_WIDTH / 2;
  const centerY = LOGICAL_HEIGHT / 2;
  const fieldX = centerX - fieldDims.width / 2;
  const fieldY = centerY - fieldDims.height / 2;

  const standThickness = 70; // Increased for better labels
  const standPadding = 15;

  const getStandGeometry = (position: string) => {
    switch (position) {
      case 'north':
        return { x: fieldX, y: fieldY - standThickness - standPadding, width: fieldDims.width, height: standThickness };
      case 'south':
        return { x: fieldX, y: fieldY + fieldDims.height + standPadding, width: fieldDims.width, height: standThickness };
      case 'east':
        return { x: fieldX + fieldDims.width + standPadding, y: fieldY, width: standThickness, height: fieldDims.height };
      case 'west':
        return { x: fieldX - standThickness - standPadding, y: fieldY, width: standThickness, height: fieldDims.height };
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  };

  const renderField = () => {
    return (
      <Group>
        {/* Grass Pattern Shadow */}
        <Rect
          x={fieldX + 5}
          y={fieldY + 5}
          width={fieldDims.width}
          height={fieldDims.height}
          fill="black"
          opacity={0.3}
          cornerRadius={4}
        />
        {/* Main Field with Gradient Simulation (using pattern or just solid for now, but better color) */}
        <Rect
          x={fieldX}
          y={fieldY}
          width={fieldDims.width}
          height={fieldDims.height}
          fill={fieldDims.color}
          stroke="#FFFFFF"
          strokeWidth={3}
          cornerRadius={4}
        />

        {/* Blueprint Grid lines on field */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Line
            key={`grid-h-${i}`}
            points={[fieldX, fieldY + (i * fieldDims.height / 10), fieldX + fieldDims.width, fieldY + (i * fieldDims.height / 10)]}
            stroke="white"
            strokeWidth={0.5}
            opacity={0.1}
          />
        ))}

        {sportCode === 'football' && (
          <>
            <Circle x={centerX} y={centerY} radius={45} stroke="#FFFFFF" strokeWidth={2} />
            <Circle x={centerX} y={centerY} radius={3} fill="#FFFFFF" />
            <Line points={[centerX, fieldY, centerX, fieldY + fieldDims.height]} stroke="#FFFFFF" strokeWidth={2} />
            <Rect x={fieldX} y={centerY - 80} width={60} height={160} stroke="#FFFFFF" strokeWidth={2} />
            <Rect x={fieldX + fieldDims.width - 60} y={centerY - 80} width={60} height={160} stroke="#FFFFFF" strokeWidth={2} />
          </>
        )}
      </Group>
    );
  };

  const renderStands = () => {
    return stands.map((stand) => {
      if (!stand.id) return null;

      const geometry = getStandGeometry(stand.position);
      const isSelected = stand.id === selectedStandId;
      const isHorizontal = stand.position === 'north' || stand.position === 'south';

      return (
        <Group key={stand.id} onClick={() => onStandClick(stand.id!)} onTap={() => onStandClick(stand.id!)}>
          {/* Depth Shadow */}
          <Rect
            x={geometry.x + 4}
            y={geometry.y + 4}
            width={geometry.width}
            height={geometry.height}
            fill="black"
            opacity={0.4}
            cornerRadius={4}
          />

          {/* Stand Main Body */}
          <Rect
            x={geometry.x}
            y={geometry.y}
            width={geometry.width}
            height={geometry.height}
            fill={isSelected ? '#2c3e50' : '#34495e'}
            stroke={isSelected ? '#3498db' : '#7f8c8d'}
            strokeWidth={isSelected ? 4 : 1}
            cornerRadius={4}
            shadowBlur={isSelected ? 15 : 0}
            shadowColor="#3498db"
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'default';
            }}
          />

          {/* Blueprint Inner Borders */}
          <Rect
            x={geometry.x + 5}
            y={geometry.y + 5}
            width={geometry.width - 10}
            height={geometry.height - 10}
            stroke="white"
            strokeWidth={0.5}
            opacity={0.2}
            dash={[5, 5]}
            listening={false}
          />

          {/* Floors & Sectors */}
          {stand.floors?.map((floor, floorIdx) => {
            const numFloors = stand.floors?.length || 1;
            const floorWidth = isHorizontal ? geometry.width : geometry.width / numFloors;
            const floorHeight = isHorizontal ? geometry.height / numFloors : geometry.height;

            const floorX = isHorizontal ? geometry.x : geometry.x + (floorIdx * floorWidth);
            const floorY = isHorizontal ? geometry.y + (floorIdx * floorHeight) : geometry.y;

            return (
              <Group key={floor.id}>
                {/* Sector Rects (Simplified representation on main canvas) */}
                {floor.sectors?.map((sector, sectorIdx) => {
                  const numSectors = floor.sectors?.length || 1;
                  const secW = isHorizontal ? floorWidth / numSectors : floorWidth;
                  const secH = isHorizontal ? floorHeight : floorHeight / numSectors;

                  const secX = isHorizontal ? floorX + (sectorIdx * secW) : floorX;
                  const secY = isHorizontal ? floorY : floorY + (sectorIdx * secH);

                  return (
                    <Group key={sector.id}>
                      <Rect
                        x={secX + 2}
                        y={secY + 2}
                        width={secW - 4}
                        height={secH - 4}
                        fill={stand.color}
                        opacity={0.3}
                        cornerRadius={2}
                        stroke="white"
                        strokeWidth={0.5}
                      />
                      {secW > 40 && secH > 20 && (
                        <Text
                          x={secX}
                          y={secY + secH / 2 - 5}
                          width={secW}
                          text={sector.name}
                          fill="white"
                          fontSize={10}
                          align="center"
                          opacity={0.8}
                          listening={false}
                        />
                      )}
                    </Group>
                  );
                })}
              </Group>
            );
          })}

          {/* External Label (Stand Name) */}
          {isHorizontal ? (
            <Text
              x={geometry.x}
              y={stand.position === 'north' ? geometry.y - 30 : geometry.y + geometry.height + 10}
              width={geometry.width}
              text={stand.name?.toUpperCase()}
              fontSize={16}
              fontStyle="bold"
              fill="white"
              align="center"
              shadowBlur={2}
              shadowColor="black"
            />
          ) : (
            <Group
              x={stand.position === 'east' ? geometry.x + geometry.width + 10 : geometry.x - 30}
              y={geometry.y}
              rotation={stand.position === 'east' ? 90 : -90}
            >
              <Text
                x={0}
                y={stand.position === 'east' ? 0 : -geometry.height}
                width={geometry.height}
                text={stand.name?.toUpperCase()}
                fontSize={16}
                fontStyle="bold"
                fill="white"
                align="center"
                shadowBlur={2}
                shadowColor="black"
              />
            </Group>
          )}

          {/* Capacity Badge */}
          {isHorizontal && (
            <Group x={geometry.x + geometry.width - 60} y={stand.position === 'north' ? geometry.y - 25 : geometry.y + geometry.height + 10}>
              <Rect width={60} height={20} fill="#2c3e50" cornerRadius={10} stroke="#3498db" strokeWidth={1} />
              <Text width={60} height={20} text={stand.totalCapacity?.toString()} fill="#3498db" fontSize={10} fontStyle="bold" align="center" verticalAlign="middle" />
            </Group>
          )}
        </Group>
      );
    });
  };

  return (
    <div ref={containerRef} className="stadium-canvas-container" style={{ width: '100%', minHeight: '400px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Stage
        width={stageDimensions.width}
        height={stageDimensions.height}
        onClick={(e) => e.target === e.target.getStage() && onStandClick(null)}
      >
        <Layer>
          <Group
            scaleX={scale}
            scaleY={scale}
            x={(stageDimensions.width - LOGICAL_WIDTH * scale) / 2}
            y={(stageDimensions.height - LOGICAL_HEIGHT * scale) / 2}
          >
            {/* Blueprint Background */}
            <Rect
              x={0}
              y={0}
              width={LOGICAL_WIDTH}
              height={LOGICAL_HEIGHT}
              fill="#0f172a"
              listening={false}
            />
            {/* Fine Grid */}
            {Array.from({ length: 20 }).map((_, i) => (
              <React.Fragment key={`grid-${i}`}>
                <Line points={[i * 50, 0, i * 50, LOGICAL_HEIGHT]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <Line points={[0, i * 50, LOGICAL_WIDTH, i * 50]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              </React.Fragment>
            ))}

            {renderField()}
            {renderStands()}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default StadiumCanvas2D;

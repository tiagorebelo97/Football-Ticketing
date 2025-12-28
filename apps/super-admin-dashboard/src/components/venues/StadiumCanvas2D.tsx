
import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import { Stand } from '../../services/venueService';

interface StadiumCanvas2DProps {
  sportCode: string;
  stands: Stand[];
  selectedStandId: string | null;
  onStandClick: (standId: string) => void;
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
        const newScale = Math.min(scaleX, scaleY); // Fit to screen ensuring aspect ratio

        setStageDimensions({ width, height });
        setScale(newScale);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Field dimensions based on sport
  const getFieldDimensions = () => {
    const fieldConfigs: { [key: string]: { width: number; height: number; color: string } } = {
      football: { width: 420, height: 272, color: '#4CAF50' },
      hockey: { width: 320, height: 160, color: '#FFA726' },
      futsal: { width: 320, height: 160, color: '#66BB6A' },
      basketball: { width: 280, height: 150, color: '#FF7043' },
      handball: { width: 320, height: 160, color: '#42A5F5' },
      volleyball: { width: 270, height: 135, color: '#FFCA28' }
    };
    return fieldConfigs[sportCode] || fieldConfigs.football;
  };

  const fieldDims = getFieldDimensions();
  // Center in LOGICAL coordinates
  const centerX = LOGICAL_WIDTH / 2;
  const centerY = LOGICAL_HEIGHT / 2;
  const fieldX = centerX - fieldDims.width / 2;
  const fieldY = centerY - fieldDims.height / 2;

  // Stand dimensions
  const standThickness = 60;
  const standPadding = 10;

  const getStandGeometry = (position: string) => {
    switch (position) {
      case 'north':
        return {
          x: fieldX,
          y: fieldY - standThickness - standPadding,
          width: fieldDims.width,
          height: standThickness
        };
      case 'south':
        return {
          x: fieldX,
          y: fieldY + fieldDims.height + standPadding,
          width: fieldDims.width,
          height: standThickness
        };
      case 'east':
        return {
          x: fieldX + fieldDims.width + standPadding,
          y: fieldY,
          width: standThickness,
          height: fieldDims.height
        };
      case 'west':
        return {
          x: fieldX - standThickness - standPadding,
          y: fieldY,
          width: standThickness,
          height: fieldDims.height
        };
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  };

  // ... (renderField usually doesn't change if it uses fieldX/fieldY from above)
  const renderField = () => {
    if (sportCode === 'football') {
      return (
        <Group>
          {/* Field */}
          <Rect
            x={fieldX}
            y={fieldY}
            width={fieldDims.width}
            height={fieldDims.height}
            fill={fieldDims.color}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {/* Center circle */}
          <Circle
            x={centerX}
            y={centerY}
            radius={45}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <Circle
            x={centerX}
            y={centerY}
            radius={3}
            fill="#FFFFFF"
          />
          {/* Center line */}
          <Line
            points={[centerX, fieldY, centerX, fieldY + fieldDims.height]}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {/* Penalty areas */}
          <Rect
            x={fieldX}
            y={centerY - 80}
            width={60}
            height={160}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <Rect
            x={fieldX + fieldDims.width - 60}
            y={centerY - 80}
            width={60}
            height={160}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </Group>
      );
    }

    // Simple field for other sports
    return (
      <Group>
        <Rect
          x={fieldX}
          y={fieldY}
          width={fieldDims.width}
          height={fieldDims.height}
          fill={fieldDims.color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
        <Circle
          x={centerX}
          y={centerY}
          radius={30}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
        <Line
          points={[centerX, fieldY, centerX, fieldY + fieldDims.height]}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      </Group>
    );
  };

  const renderStands = () => {
    const elements: JSX.Element[] = [];

    stands.forEach((stand, index) => {
      if (!stand.id) return;

      const geometry = getStandGeometry(stand.position);
      const isSelected = stand.id === selectedStandId;
      const numFloors = stand.floors?.length || 1;
      const isHorizontal = stand.position === 'north' || stand.position === 'south';

      const labelWidth = isHorizontal ? geometry.width : 150;
      const nameFontSize = 18;
      const capacityFontSize = 14;

      // Rect for the stand background
      elements.push(
        <Rect
          key={`stand-rect-${stand.id}`}
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          fill={stand.color}
          opacity={0.3}
          stroke={isSelected ? '#FFD700' : '#333'}
          strokeWidth={isSelected ? 4 : 2}
          shadowBlur={isSelected ? 10 : 5}
          shadowColor="black"
          onClick={() => stand.id && onStandClick(stand.id)}
          onTap={() => stand.id && onStandClick(stand.id)}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            const container = stage?.container();
            if (container) container.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            const stage = e.target.getStage();
            const container = stage?.container();
            if (container) container.style.cursor = 'default';
          }}
        />
      );

      // Render floors (omitted detailed inner logic changes for brevity as they depend on geometry which is correct)
      // The previous logic for floors/sectors inside the stand rect works fine with updated geometry.
      // Copying the floor loop logic for completeness but ensuring variables are fresh.

      if (stand.floors && stand.floors.length > 0) {
        stand.floors.forEach((floor, floorIdx) => {
          const floorHeight = isHorizontal ? geometry.height / numFloors : geometry.height;
          const floorWidth = isHorizontal ? geometry.width : geometry.width / numFloors;

          let floorX, floorY, floorW, floorH;

          if (isHorizontal) {
            floorX = geometry.x;
            floorY = geometry.y + (floorIdx * floorHeight);
            floorW = geometry.width;
            floorH = floorHeight;
          } else {
            floorX = geometry.x + (floorIdx * floorWidth);
            floorY = geometry.y;
            floorW = floorWidth;
            floorH = geometry.height;
          }

          elements.push(
            <Rect
              key={`floor-${stand.id}-${floor.id}`}
              x={floorX}
              y={floorY}
              width={floorW}
              height={floorH}
              fill={stand.color}
              opacity={0.4 + (floorIdx * 0.1)}
              stroke="#FFFFFF"
              strokeWidth={1}
              listening={false}
            />
          );

          // Sectors logic...
          const numSectors = floor.sectors?.length || 0;
          if (numSectors > 0) {
            floor.sectors?.forEach((sector: any, sectorIdx: number) => {
              const sectorWidth = isHorizontal ? floorW / numSectors : floorW;
              const sectorHeight = isHorizontal ? floorH : floorH / numSectors;

              let sectorX, sectorY, sectorW, sectorH;

              if (isHorizontal) {
                sectorX = floorX + (sectorIdx * sectorWidth);
                sectorY = floorY;
                sectorW = sectorWidth;
                sectorH = floorH;
              } else {
                sectorX = floorX;
                sectorY = floorY + (sectorIdx * sectorHeight);
                sectorW = floorW;
                sectorH = sectorHeight;
              }

              elements.push(
                <Rect
                  key={`sector-${stand.id}-${floor.id}-${sector.id}`}
                  x={sectorX}
                  y={sectorY}
                  width={sectorW}
                  height={sectorH}
                  fill={stand.color}
                  opacity={0.5 + (sectorIdx * 0.05)}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  listening={false}
                />
              );

              if (sectorW > 30 && sectorH > 15) {
                // Label code...
                elements.push(
                  <Text
                    key={`sector-label-${stand.id}-${floor.id}-${sector.id}`} // Fixed duplicate key risk
                    x={sectorX}
                    y={sectorY + sectorH / 2 - 6} // Adjusted Y for centering without capacity text
                    width={sectorW}
                    text={String(sector.name || '')}
                    fontSize={13} // Increased from 9
                    fontStyle="bold"
                    fill="#FFFFFF"
                    align="center"
                    listening={false}
                  />
                );
              }
            });
          }
        });
      }

      // Stand Labels Logic
      let nameX, nameY, nameRotation;
      let nameAlign = 'center';

      const textPadding = 15;

      if (stand.position === 'north') {
        nameRotation = 0;
        nameX = geometry.x;
        nameY = geometry.y - 25;

      } else if (stand.position === 'south') {
        nameRotation = 0;
        nameX = geometry.x;
        nameY = geometry.y + geometry.height + 10;

      } else if (stand.position === 'east') {
        nameRotation = 90;
        // x = right edge + same padding as North (approx 25px)
        nameX = geometry.x + geometry.width + 25;
        nameY = geometry.y;

      } else {
        nameRotation = -90;
        // x = left edge - same padding (25px)
        nameX = geometry.x - 25;
        nameY = geometry.y + geometry.height;
      }

      if (isHorizontal) {
        // Just Text, no background
        elements.push(
          <Text
            key={`stand-text-${stand.id}`}
            x={nameX}
            y={nameY}
            width={geometry.width}
            text={String(stand.name || '')}
            fontSize={nameFontSize}
            fontStyle="bold"
            fill="#FFFFFF"
            align="center"
            listening={false}
          />
        );
      } else {
        // Vertical Stands (East/West)
        const vLabelWidth = geometry.height;

        let labelX, labelY, labelRot;

        if (stand.position === 'east') {
          labelRot = 90;
          labelX = geometry.x + geometry.width + 25;
          labelY = geometry.y;
        } else {
          labelRot = -90;
          labelX = geometry.x - 25;
          labelY = geometry.y + geometry.height;
        }

        // Group for Label - No Rect
        elements.push(
          <Group
            key={`label-group-${stand.id}`}
            x={labelX}
            y={labelY}
            rotation={labelRot}
          >
            <Text
              x={0}
              y={0}
              width={vLabelWidth}
              text={String(stand.name || '')}
              fontSize={nameFontSize}
              fontStyle="bold"
              fill="#FFFFFF"
              align="center"
            />
          </Group>
        );
      }

    });

    return elements;
  };

  return (
    <div ref={containerRef} className="stadium-canvas-container" style={{ width: '100%', minHeight: '400px' }}>
      <Stage width={stageDimensions.width} height={stageDimensions.height}>
        <Layer>
          {/* Main Scaling Group */}
          <Group
            scaleX={scale}
            scaleY={scale}
            x={(stageDimensions.width - LOGICAL_WIDTH * scale) / 2}
            y={(stageDimensions.height - LOGICAL_HEIGHT * scale) / 2}
          >
            {/* Background - covers logical area */}
            <Rect
              x={0}
              y={0}
              width={LOGICAL_WIDTH}
              height={LOGICAL_HEIGHT}
              fill="#1a1a1a" // Match background
              listening={false}
            />

            {/* Field */}
            {renderField()}

            {/* Stands */}
            {renderStands()}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default StadiumCanvas2D;


import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import { Stand } from '../../services/venueService';

interface StadiumCanvas2DProps {
  sportCode: string;
  stands: Stand[];
  selectedStandId: string | null;
  onStandClick: (standId: string) => void;
}

const StadiumCanvas2D: React.FC<StadiumCanvas2DProps> = ({
  sportCode,
  stands,
  selectedStandId,
  onStandClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(600, width * 0.75);
        setDimensions({ width, height });
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
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
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
          {/* Goals */}
          <Rect
            x={fieldX - 8}
            y={centerY - 30}
            width={8}
            height={60}
            fill="#FFFFFF"
          />
          <Rect
            x={fieldX + fieldDims.width}
            y={centerY - 30}
            width={8}
            height={60}
            fill="#FFFFFF"
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
            try {
              const stage = e.target.getStage();
              const container = stage?.container();
              if (container) container.style.cursor = 'pointer';
            } catch (error) {
              // Ignore
            }
          }}
          onMouseLeave={(e) => {
            try {
              const stage = e.target.getStage();
              const container = stage?.container();
              if (container) container.style.cursor = 'default';
            } catch (error) {
              // Ignore
            }
          }}
        />
      );

      // Render floors with divisions
      if (stand.floors && stand.floors.length > 0) {
        stand.floors.forEach((floor, floorIdx) => {
          const floorHeight = isHorizontal
            ? geometry.height / numFloors
            : geometry.height / numFloors;
          const floorWidth = isHorizontal
            ? geometry.width / numFloors
            : geometry.width / numFloors;

          let floorX, floorY, floorW, floorH;

          if (isHorizontal) {
            // North/South: stack floors vertically
            floorX = geometry.x;
            floorY = geometry.y + (floorIdx * floorHeight);
            floorW = geometry.width;
            floorH = floorHeight;
          } else {
            // East/West: stack floors horizontally
            floorX = geometry.x + (floorIdx * floorWidth);
            floorY = geometry.y;
            floorW = floorWidth;
            floorH = geometry.height;
          }

          // Floor background with different opacity
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

          // Render sectors within floor
          const numSectors = floor.sectors?.length || 0;
          if (numSectors > 0) {
            floor.sectors?.forEach((sector, sectorIdx) => {
              const sectorWidth = isHorizontal
                ? floorW / numSectors
                : floorW / numSectors;
              const sectorHeight = isHorizontal
                ? floorH / numSectors
                : floorH / numSectors;

              let sectorX, sectorY, sectorW, sectorH;

              if (isHorizontal) {
                // North/South: sectors side by side
                sectorX = floorX + (sectorIdx * sectorWidth);
                sectorY = floorY;
                sectorW = sectorWidth;
                sectorH = floorH;
              } else {
                // East/West: sectors top to bottom
                sectorX = floorX;
                sectorY = floorY + (sectorIdx * sectorHeight);
                sectorW = floorW;
                sectorH = sectorHeight;
              }

              // Sector background
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

              // Sector label (only if there's space)
              if (sectorW > 30 && sectorH > 15) {
                elements.push(
                  <Text
                    key={`sector-label-${stand.id}-${floor.id}-${sector.id}`}
                    x={sectorX}
                    y={sectorY + sectorH / 2 - 10}
                    width={sectorW}
                    text={String(sector.name || '')}
                    fontSize={9}
                    fontStyle="bold"
                    fill="#FFFFFF"
                    align="center"
                    listening={false}
                  />
                );

                // Sector capacity (only if configured)
                if (sector.configuredSeats && sector.configuredSeats > 0) {
                  elements.push(
                    <Text
                      key={`sector-capacity-${stand.id}-${floor.id}-${sector.id}`}
                      x={sectorX}
                      y={sectorY + sectorH / 2 + 2}
                      width={sectorW}
                      text={String(sector.configuredSeats)}
                      fontSize={8}
                      fill="#FFFFFF"
                      align="center"
                      listening={false}
                    />
                  );
                }
              }
            });
          }

          // Floor labels removed per user request
        });
      }

      // Text for the stand name - positioned OUTSIDE the rectangle
      let nameX, nameY, nameAlign;
      let capacityX, capacityY, capacityAlign;

      if (stand.position === 'north') {
        // North: labels above the stand
        nameX = geometry.x;
        nameY = geometry.y - 25;
        capacityX = geometry.x;
        capacityY = geometry.y - 10;
        nameAlign = 'center';
        capacityAlign = 'center';
      } else if (stand.position === 'south') {
        // South: labels below the stand
        nameX = geometry.x;
        nameY = geometry.y + geometry.height + 10;
        capacityX = geometry.x;
        capacityY = geometry.y + geometry.height + 25;
        nameAlign = 'center';
        capacityAlign = 'center';
      } else if (stand.position === 'east') {
        // East: labels to the right
        nameX = geometry.x + geometry.width + 10;
        nameY = geometry.y + geometry.height / 2 - 10;
        capacityX = geometry.x + geometry.width + 10;
        capacityY = geometry.y + geometry.height / 2 + 5;
        nameAlign = 'left';
        capacityAlign = 'left';
      } else {
        // West: labels to the left
        nameX = geometry.x - 10;
        nameY = geometry.y + geometry.height / 2 - 10;
        capacityX = geometry.x - 10;
        capacityY = geometry.y + geometry.height / 2 + 5;
        nameAlign = 'right';
        capacityAlign = 'right';
      }

      elements.push(
        <Text
          key={`stand-text-${stand.id}`}
          x={nameX}
          y={nameY}
          width={stand.position === 'north' || stand.position === 'south' ? geometry.width : 100}
          text={String(stand.name || '')}
          fontSize={14}
          fontStyle="bold"
          fill="#333333"
          align={nameAlign}
          listening={false}
        />
      );

      // Text for the total capacity
      if (stand.totalCapacity && stand.totalCapacity > 0) {
        elements.push(
          <Text
            key={`stand-capacity-${stand.id}`}
            x={capacityX}
            y={capacityY}
            width={stand.position === 'north' || stand.position === 'south' ? geometry.width : 100}
            text={String(stand.totalCapacity) + ' lugares'}
            fontSize={11}
            fill="#666666"
            align={capacityAlign}
            listening={false}
          />
        );
      }
    });

    return elements;
  };

  return (
    <div ref={containerRef} className="stadium-canvas-container">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="#1a1a1a"
            listening={false}
          />

          {/* Field */}
          {renderField()}

          {/* Stands */}
          {renderStands()}
        </Layer>
      </Stage>
    </div>
  );
};

export default StadiumCanvas2D;

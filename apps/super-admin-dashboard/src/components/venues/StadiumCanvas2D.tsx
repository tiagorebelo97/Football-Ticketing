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
    return stands.map(stand => {
      const geometry = getStandGeometry(stand.position);
      const isSelected = stand.id === selectedStandId;

      return (
        <Group key={stand.id}>
          <Rect
            x={geometry.x}
            y={geometry.y}
            width={geometry.width}
            height={geometry.height}
            fill={stand.color}
            opacity={isSelected ? 0.9 : 0.7}
            stroke={isSelected ? '#FFD700' : '#333'}
            strokeWidth={isSelected ? 4 : 2}
            shadowBlur={isSelected ? 10 : 5}
            shadowColor="black"
            onClick={(e) => {
              e.cancelBubble = true;
              onStandClick(stand.id!);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onStandClick(stand.id!);
            }}
          />
          <Text
            x={geometry.x}
            y={geometry.y + geometry.height / 2 - 10}
            width={geometry.width}
            height={20}
            text={stand.name}
            fontSize={14}
            fontStyle="bold"
            fill="#FFFFFF"
            align="center"
            verticalAlign="middle"
          />
          {stand.totalCapacity && stand.totalCapacity > 0 && (
            <Text
              x={geometry.x}
              y={geometry.y + geometry.height / 2 + 10}
              width={geometry.width}
              height={20}
              text={`${stand.totalCapacity} lugares`}
              fontSize={11}
              fill="#FFFFFF"
              align="center"
              verticalAlign="middle"
            />
          )}
        </Group>
      );
    });
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

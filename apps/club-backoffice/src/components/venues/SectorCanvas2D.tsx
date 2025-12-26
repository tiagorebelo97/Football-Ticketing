import React from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { Row } from '../../services/venueService';

interface SectorCanvas2DProps {
  rows: Row[];
  totalSeats: number;
}

const SectorCanvas2D: React.FC<SectorCanvas2DProps> = ({ rows, totalSeats }) => {
  const width = 600;
  const height = 400;
  const padding = 40;
  const fieldHeight = 80;
  
  // Calculate layout
  const maxSeatsPerRow = rows.length > 0 ? Math.max(...rows.map(r => r.seatsCount)) : 10;
  const seatSize = Math.min(20, (width - 2 * padding) / (maxSeatsPerRow + 2));
  const rowSpacing = Math.min(30, (height - padding - fieldHeight - 20) / (rows.length + 1));

  const renderField = () => {
    const fieldY = padding;
    return (
      <Group>
        <Rect
          x={padding}
          y={fieldY}
          width={width - 2 * padding}
          height={fieldHeight}
          fill="#4CAF50"
          stroke="#FFFFFF"
          strokeWidth={2}
        />
        <Text
          x={padding}
          y={fieldY + fieldHeight / 2 - 10}
          width={width - 2 * padding}
          height={20}
          text="CAMPO"
          fontSize={16}
          fontStyle="bold"
          fill="#FFFFFF"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  };

  const renderSeats = () => {
    const startY = padding + fieldHeight + 40;
    
    return rows.map((row, rowIndex) => {
      const y = startY + rowIndex * rowSpacing;
      const rowWidth = row.seatsCount * seatSize;
      const startX = (width - rowWidth) / 2;

      return (
        <Group key={row.id || rowIndex}>
          {/* Row label */}
          <Text
            x={startX - 40}
            y={y - seatSize / 2}
            width={35}
            height={seatSize}
            text={row.name}
            fontSize={12}
            fontStyle="bold"
            fill="#333"
            align="right"
            verticalAlign="middle"
          />
          
          {/* Seats */}
          {Array.from({ length: row.seatsCount }).map((_, seatIndex) => {
            const seatX = startX + seatIndex * seatSize;
            
            return (
              <Rect
                key={`${row.id}-${seatIndex}`}
                x={seatX}
                y={y - seatSize / 2}
                width={seatSize - 2}
                height={seatSize - 2}
                fill="#2196F3"
                stroke="#1976D2"
                strokeWidth={1}
                cornerRadius={2}
              />
            );
          })}
          
          {/* Seat count label */}
          <Text
            x={startX + rowWidth + 5}
            y={y - seatSize / 2}
            width={40}
            height={seatSize}
            text={`${row.seatsCount}`}
            fontSize={11}
            fill="#666"
            align="left"
            verticalAlign="middle"
          />
        </Group>
      );
    });
  };

  return (
    <div className="sector-canvas-container">
      <Stage width={width} height={height}>
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#f5f5f5"
          />
          
          {/* Field */}
          {renderField()}
          
          {/* Seats */}
          {rows.length > 0 ? (
            renderSeats()
          ) : (
            <Text
              x={0}
              y={height / 2 - 20}
              width={width}
              height={40}
              text="Configure as filas para visualizar os assentos"
              fontSize={14}
              fill="#999"
              align="center"
              verticalAlign="middle"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default SectorCanvas2D;

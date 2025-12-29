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
          fill="#388E3C" // Darker green like image
          stroke="#FFFFFF"
          strokeWidth={0}
        />
        <Text
          x={padding}
          y={fieldY}
          width={width - 2 * padding}
          height={fieldHeight}
          text="RELVADO"
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
      // Align LEFT (started from padding)
      const startX = padding + 60; // 60px offset for row label

      // Seat Path Logic (Rounded top, flat bottom)
      // Original size ~20px
      // Path for a simple seat shape: "M 0,seatSize H seatSize V seatSize/2 ... ?"
      // Let's use a path. 
      // M 2 (bottom-left) L 2 (top-left-rounded) ...
      // Simplified: Rect with different corner radius [top-left, top-right, bottom-right, bottom-left]
      // Konva Rect supports cornerRadius as array [tl, tr, br, bl]

      return (
        <Group key={row.id || rowIndex}>
          {/* Row label */}
          <Text
            x={padding} // Fixed left position for label
            y={y - seatSize / 2}
            width={50}
            height={seatSize}
            text={row.name}
            fontSize={12}
            fontStyle="bold"
            fill="#333"
            align="left"
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
                width={seatSize - 4} // Gap between seats
                height={seatSize - 2}
                fill="#009688" // Teal color like image
                cornerRadius={[5, 5, 0, 0]} // Rounded top, flat bottom
                shadowBlur={0}
              />
            );
          })}

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

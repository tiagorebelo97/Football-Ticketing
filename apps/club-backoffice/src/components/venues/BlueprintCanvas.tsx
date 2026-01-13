import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';

interface BlueprintCanvasProps {
    stands: any[];
    selectedStandId: string | null;
    onSelectStand: (id: string | null) => void;
    onAddStand: (position: string) => void;
    zoom: number;
    pan: { x: number; y: number };
    onZoomChange: (zoom: number) => void;
    onPanChange: (pan: { x: number; y: number }) => void;
    onEditSector: (standId: string, floorId: string, sectorId: string) => void;
}

const initialGhostZones = [
    { id: 'north', name: 'Norte', x: 0, y: 0, width: 0, height: 0 },
    { id: 'south', name: 'Sul', x: 0, y: 0, width: 0, height: 0 },
    { id: 'east', name: 'Este', x: 0, y: 0, width: 0, height: 0 },
    { id: 'west', name: 'Oeste', x: 0, y: 0, width: 0, height: 0 }
];

const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({
    stands,
    selectedStandId,
    onSelectStand,
    onAddStand,
    zoom,
    pan,
    onEditSector
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080
    });
    const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);
    const [hoveredStandId, setHoveredStandId] = useState<string | null>(null);
    const [mockGhostZones, setMockGhostZones] = useState(initialGhostZones);
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Field dimensions - scaled to viewport (40% width, 35% height)
    const fieldWidth = Math.min(width * 0.4, 700);
    const fieldHeight = Math.min(height * 0.4, 500);

    // Ghost zones for adding stands
    const standHeight = fieldHeight * 0.22;
    const standWidth = fieldWidth * 0.22;
    const gap = 15;

    const ghostZones = [
        {
            id: 'Norte',
            x: centerX - (fieldWidth + standWidth) / 2,
            y: centerY - fieldHeight / 2 - standHeight - gap,
            width: fieldWidth + standWidth,
            height: standHeight
        },
        {
            id: 'Sul',
            x: centerX - (fieldWidth + standWidth) / 2,
            y: centerY + fieldHeight / 2 + gap,
            width: fieldWidth + standWidth,
            height: standHeight
        },
        {
            id: 'Este',
            x: centerX + fieldWidth / 2 + gap,
            y: centerY - fieldHeight / 2,
            width: standWidth,
            height: fieldHeight
        },
        {
            id: 'Oeste',
            x: centerX - fieldWidth / 2 - standWidth - gap,
            y: centerY - fieldHeight / 2,
            width: standWidth,
            height: fieldHeight
        }
    ];

    const getStandByPosition = (position: string) => {
        return stands.find(s => s.position === position);
    };

    const renderGrid = () => {
        const gridLines = [];
        const gridSize = 50;
        for (let x = 0; x < width; x += gridSize) {
            gridLines.push(<Line key={`v-${x}`} points={[x, 0, x, height]} stroke="rgba(0, 212, 255, 0.08)" strokeWidth={1} />);
        }
        for (let y = 0; y < height; y += gridSize) {
            gridLines.push(<Line key={`h-${y}`} points={[0, y, width, y]} stroke="rgba(0, 212, 255, 0.08)" strokeWidth={1} />);
        }
        return gridLines;
    };

    // Improved Global Seats Rendering with Orientation Awareness
    const renderSectorSeats = (sector: any, sX: number, sY: number, sW: number, sH: number, standPosition: string) => {
        if (!sector.rows || sector.rows.length === 0) return null;

        const isHorizontalStand = standPosition === 'Norte' || standPosition === 'Sul';
        const rowCount = sector.rows.length;
        const maxSeats = Math.max(...sector.rows.map((r: any) => r.seatsCount));

        // Dimension mapping for "Filling" logic
        const depthDim = isHorizontalStand ? sH : sW;
        const widthDim = isHorizontalStand ? sW : sH;

        const rowGap = depthDim / (rowCount + 1);
        const seatGap = widthDim / (maxSeats + 1);
        const dotSize = Math.max(1, Math.min(2, seatGap * 0.7, rowGap * 0.7));

        return (
            <Group opacity={0.6}>
                {sector.rows.map((row: any, rIdx: number) => {
                    const depthCoord = (rIdx + 1) * rowGap;

                    if (seatGap < 1.5) {
                        const points = isHorizontalStand
                            ? [sX + 3, sY + depthCoord, sX + sW - 3, sY + depthCoord]
                            : [sX + depthCoord, sY + 3, sX + depthCoord, sY + sH - 3];

                        return (
                            <Line
                                key={`row-line-${rIdx}`}
                                points={points}
                                stroke="#00d4ff"
                                strokeWidth={dotSize}
                                opacity={0.5}
                            />
                        );
                    }

                    return Array.from({ length: row.seatsCount }).map((_, sIdx) => {
                        const widthCoord = (sIdx + 1) * seatGap;
                        const x = isHorizontalStand ? sX + widthCoord : sX + depthCoord;
                        const y = isHorizontalStand ? sY + depthCoord : sY + widthCoord;

                        return (
                            <Rect
                                key={`dot-${rIdx}-${sIdx}`}
                                x={x - dotSize / 2}
                                y={y - dotSize / 2}
                                width={dotSize}
                                height={dotSize}
                                fill="#00d4ff"
                                listening={false}
                            />
                        );
                    });
                })}
            </Group>
        );
    };

    const renderField = () => {
        const penaltyWidth = fieldWidth * 0.15;
        const penaltyHeight = fieldHeight * 0.57;
        const centerRadius = Math.min(fieldWidth, fieldHeight) * 0.12;
        const goalWidth = fieldWidth * 0.05;
        const goalHeight = fieldHeight * 0.2;
        const numStripes = 10;
        const stripeHeight = fieldHeight / numStripes;

        return (
            <Group>
                {Array.from({ length: numStripes }).map((_, i) => (
                    <Rect
                        key={`stripe-${i}`}
                        x={centerX - fieldWidth / 2}
                        y={centerY - fieldHeight / 2 + i * stripeHeight}
                        width={fieldWidth}
                        height={stripeHeight}
                        fill={i % 2 === 0 ? '#1a4d2e' : '#174529'}
                        listening={false}
                    />
                ))}
                <Rect x={centerX - fieldWidth / 2} y={centerY - fieldHeight / 2} width={fieldWidth} height={fieldHeight} fill="transparent" stroke="#00ff88" strokeWidth={3} listening={false} />
                <Circle x={centerX} y={centerY} radius={centerRadius} stroke="#00ff88" strokeWidth={3} listening={false} />
                <Line points={[centerX, centerY - fieldHeight / 2, centerX, centerY + fieldHeight / 2]} stroke="#00ff88" strokeWidth={3} listening={false} />
                <Rect x={centerX - fieldWidth / 2} y={centerY - penaltyHeight / 2} width={penaltyWidth} height={penaltyHeight} stroke="#00ff88" strokeWidth={3} listening={false} />
                <Rect x={centerX + fieldWidth / 2 - penaltyWidth} y={centerY - penaltyHeight / 2} width={penaltyWidth} height={penaltyHeight} stroke="#00ff88" strokeWidth={3} listening={false} />
                <Rect x={centerX - fieldWidth / 2} y={centerY - goalHeight / 2} width={goalWidth} height={goalHeight} stroke="#00ff88" strokeWidth={3} listening={false} />
                <Rect x={centerX + fieldWidth / 2 - goalWidth} y={centerY - goalHeight / 2} width={goalWidth} height={goalHeight} stroke="#00ff88" strokeWidth={3} listening={false} />
                <Text
                    x={centerX}
                    y={centerY - 15}
                    text="RELVADO"
                    fontSize={Math.max(24, fieldWidth * 0.04)}
                    fontFamily="Inter"
                    fontStyle="bold"
                    fill="#00ff88"
                    opacity={0.5}
                    align="center"
                    verticalAlign="middle"
                    offsetX={Math.max(24, fieldWidth * 0.04) * 2}
                    listening={false}
                />
            </Group>
        );
    };

    const renderGhostZones = () => {
        return ghostZones.map(zone => {
            if (getStandByPosition(zone.id)) return null;
            const isHovered = hoveredZone === zone.id;
            return (
                <Group key={zone.id}>
                    <Rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        fill={isHovered ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 212, 255, 0.05)'}
                        stroke="#00d4ff"
                        strokeWidth={3}
                        dash={[15, 8]}
                        cornerRadius={12}
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                        onClick={() => onAddStand(zone.id)}
                    />
                    <Text
                        x={zone.x + zone.width / 2}
                        y={zone.y + zone.height / 2 - 12}
                        text={`+ ${zone.id.toUpperCase()}`}
                        fontSize={14}
                        fontFamily="Inter"
                        fontStyle="bold"
                        fill="#00d4ff"
                        opacity={isHovered ? 1 : 0.7}
                        align="center"
                        offsetX={zone.id.length * 5}
                    />
                </Group>
            );
        });
    };

    const renderStands = () => {
        return stands.map(stand => {
            const baseZone = ghostZones.find(z => z.id === stand.position);
            if (!baseZone) return null;

            const minFloorSize = 60;
            const floorCount = Math.max(1, stand.floors?.length || 1);
            const isHorizontal = stand.position === 'Norte' || stand.position === 'Sul';
            const baseDepth = isHorizontal ? baseZone.height : baseZone.width;
            const dynamicDepth = Math.max(baseDepth, floorCount * minFloorSize);

            let zone = { ...baseZone };
            if (stand.position === 'Norte') { zone.y = (baseZone.y + baseZone.height) - dynamicDepth; zone.height = dynamicDepth; }
            else if (stand.position === 'Sul') { zone.height = dynamicDepth; }
            else if (stand.position === 'Oeste') { zone.x = (baseZone.x + baseZone.width) - dynamicDepth; zone.width = dynamicDepth; }
            else if (stand.position === 'Este') { zone.width = dynamicDepth; }

            const isSelected = selectedStandId === stand.id;
            const isStandHovered = hoveredStandId === stand.id;
            const standColor = stand.color || '#00d4ff';

            return (
                <Group key={stand.id} onMouseEnter={() => setHoveredStandId(stand.id)} onMouseLeave={() => setHoveredStandId(null)}>
                    <Rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill={standColor} opacity={isStandHovered && !hoveredSectorId ? 0.6 : 0.2} stroke={isStandHovered ? '#ffffff' : 'transparent'} strokeWidth={1} cornerRadius={12} onClick={() => onSelectStand(stand.id)} />
                    <Rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} stroke={isSelected ? '#ffffff' : standColor} strokeWidth={isSelected ? 5 : 3} cornerRadius={12} listening={false} />

                    {stand.floors?.map((floor: any, fIndex: number) => {
                        const floorCount = stand.floors.length;
                        const gap = 1;
                        const totalGap = (floorCount - 1) * gap;
                        const floorW = isHorizontal ? zone.width : (zone.width - totalGap) / floorCount;
                        const floorH = isHorizontal ? (zone.height - totalGap) / floorCount : zone.height;
                        const visualIndex = (stand.position === 'Sul' || stand.position === 'Este') ? fIndex : (floorCount - 1 - fIndex);
                        const floorX = isHorizontal ? zone.x : zone.x + (visualIndex * (floorW + gap));
                        const floorY = isHorizontal ? zone.y + (visualIndex * (floorH + gap)) : zone.y;

                        return (floor.sectors || []).map((sector: any, sIndex: number) => {
                            const cols = isHorizontal ? floor.sectors.length : 1;
                            const rows = isHorizontal ? 1 : floor.sectors.length;
                            const cellWidth = (floorW - (cols - 1)) / cols;
                            const cellHeight = (floorH - (rows - 1)) / rows;
                            const sectorX = floorX + (sIndex % cols) * (cellWidth + 1);
                            const sectorY = floorY + Math.floor(sIndex / cols) * (cellHeight + 1);

                            const isSectorHovered = hoveredSectorId === sector.id;
                            const showActiveSector = isSectorHovered && isSelected;

                            return (
                                <Group key={sector.id}>
                                    <Rect x={sectorX} y={sectorY} width={cellWidth} height={cellHeight} fill={showActiveSector ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255,255,255,0.05)'} stroke={showActiveSector ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth={1} cornerRadius={2} listening={false} />
                                    {renderSectorSeats(sector, sectorX, sectorY, cellWidth, cellHeight, stand.position)}
                                    {(cellWidth > 35 && cellHeight > 20) && (
                                        <Text x={sectorX} y={sectorY + (cellHeight / 2) - 5} width={cellWidth} text={sector.name.toUpperCase()} fontSize={9} fontFamily="Inter" fontStyle="bold" fill="white" align="center" opacity={showActiveSector ? 1 : 0.4} listening={false} />
                                    )}
                                    <Rect x={sectorX} y={sectorY} width={cellWidth} height={cellHeight} fill="transparent" listening={true}
                                        onMouseEnter={() => { setHoveredSectorId(sector.id); if (containerRef.current) containerRef.current.style.cursor = isSelected ? 'pointer' : 'default'; }}
                                        onMouseLeave={() => { setHoveredSectorId(null); if (containerRef.current) containerRef.current.style.cursor = 'default'; }}
                                        onClick={(e) => { e.cancelBubble = true; if (isSelected) onEditSector(stand.id, floor.id, sector.id); else onSelectStand(stand.id); }}
                                    />
                                </Group>
                            );
                        });
                    })}
                </Group>
            );
        });
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: 'var(--stadium-bg-primary)' }}>
            <Stage width={width} height={height}>
                <Layer>
                    {renderField()}
                    {renderGhostZones()}
                </Layer>
                <Layer>
                    {renderStands()}
                </Layer>
            </Stage>
        </div>
    );
};

export default BlueprintCanvas;

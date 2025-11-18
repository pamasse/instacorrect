import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useStore } from '../../store/useStore';
import { snapToGrid, pixelsToMeters } from '../../utils/geometry';
import type { Point, WallSegment, MEX, RoomTag } from '../../types';
import './Canvas.css';

/**
 * Composant Canvas principal utilisant Fabric.js
 * Gère le rendu du plan, la grille, et les outils de tracé
 */
export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    canvas,
    setCanvas,
    activeTool,
    selectedElementType,
    grid,
    scale,
    backgroundImage,
    isCalibrating,
    calibrationPoints,
    setCalibrationPoints,
    addWall,
    addMEX,
    addRoomTag,
  } = useStore();

  // État local pour le tracé en cours
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<fabric.Line | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  /**
   * Initialisation du canvas Fabric.js
   */
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#f5f5f5',
      selection: activeTool === 'select',
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [setCanvas]);

  /**
   * Mise à jour de la sélection selon l'outil actif
   */
  useEffect(() => {
    if (!canvas) return;

    canvas.selection = activeTool === 'select';
    canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'crosshair';

    if (activeTool !== 'select') {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }, [canvas, activeTool]);

  /**
   * Rendu de l'image de fond
   */
  useEffect(() => {
    if (!canvas || !backgroundImage) return;

    fabric.Image.fromURL(backgroundImage, (img: fabric.Image) => {
      if (!img.width || !img.height) return;

      // Adapter l'image à la taille du canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        canvasWidth / img.width,
        canvasHeight / img.height
      ) * 0.9;

      img.scale(scale);
      img.set({
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2,
        selectable: false,
        evented: false,
      });

      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  }, [canvas, backgroundImage]);

  /**
   * Rendu de la grille
   */
  useEffect(() => {
    if (!canvas || !grid.visible) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Supprimer l'ancienne grille
    const existingGrid = canvas.getObjects().filter((obj: fabric.Object) =>
      (obj as any).isGrid
    );
    existingGrid.forEach((obj: fabric.Object) => canvas.remove(obj));

    const gridSpacing = grid.primarySpacing * scale.pixelsPerMeter;
    const lines: fabric.Line[] = [];

    // Lignes verticales
    for (let x = grid.origin.x; x < canvasWidth; x += gridSpacing) {
      const line = new fabric.Line([x, 0, x, canvasHeight], {
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      (line as any).isGrid = true;
      lines.push(line);
    }

    // Lignes horizontales
    for (let y = grid.origin.y; y < canvasHeight; y += gridSpacing) {
      const line = new fabric.Line([0, y, canvasWidth, y], {
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      (line as any).isGrid = true;
      lines.push(line);
    }

    // Grille secondaire si définie
    if (grid.secondarySpacing) {
      const secondarySpacing = grid.secondarySpacing * scale.pixelsPerMeter;

      for (let x = grid.origin.x; x < canvasWidth; x += secondarySpacing) {
        if (x % gridSpacing !== 0) {
          const line = new fabric.Line([x, 0, x, canvasHeight], {
            stroke: '#eee',
            strokeWidth: 0.5,
            selectable: false,
            evented: false,
          });
          (line as any).isGrid = true;
          lines.push(line);
        }
      }

      for (let y = grid.origin.y; y < canvasHeight; y += secondarySpacing) {
        if (y % gridSpacing !== 0) {
          const line = new fabric.Line([0, y, canvasWidth, y], {
            stroke: '#eee',
            strokeWidth: 0.5,
            selectable: false,
            evented: false,
          });
          (line as any).isGrid = true;
          lines.push(line);
        }
      }
    }

    lines.forEach((line) => {
      canvas.add(line);
      canvas.sendToBack(line);
    });
    canvas.requestRenderAll();
  }, [canvas, grid, scale.pixelsPerMeter]);

  /**
   * Gestion des événements de souris pour le tracé
   */
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: fabric.IEvent) => {
      if (!event.pointer) return;

      const pointer = event.pointer;
      let point = { x: pointer.x, y: pointer.y };

      // Snap to grid si activé
      if (grid.snapEnabled && activeTool === 'wall') {
        point = snapToGrid(point, grid.primarySpacing, scale.pixelsPerMeter, grid.origin);
      }

      // Mode calibration
      if (isCalibrating) {
        const newPoints = [...calibrationPoints, point];
        setCalibrationPoints(newPoints);

        // Dessiner un marqueur
        const circle = new fabric.Circle({
          left: point.x - 5,
          top: point.y - 5,
          radius: 5,
          fill: 'red',
          selectable: false,
        });
        canvas.add(circle);

        return;
      }

      // Outil mur
      if (activeTool === 'wall' && selectedElementType) {
        setIsDrawing(true);
        setStartPoint(point);

        const line = new fabric.Line([point.x, point.y, point.x, point.y], {
          stroke: selectedElementType.color || '#000',
          strokeWidth: (selectedElementType.thickness || 0.1) * scale.pixelsPerMeter,
          selectable: false,
        });

        canvas.add(line);
        setCurrentLine(line);
      }

      // Outil MEX
      if (activeTool === 'mex' && selectedElementType) {
        const realPos = pixelsToMeters(point, scale.pixelsPerMeter);

        const mex: MEX = {
          id: `mex_${Date.now()}`,
          typeId: selectedElementType.id,
          position: realPos,
          rotation: 0,
        };

        // Dessiner un rectangle représentant la MEX
        const mexRect = new fabric.Rect({
          left: point.x - 10,
          top: point.y - 15,
          width: 20,
          height: 30,
          fill: selectedElementType.color || '#3498DB',
          stroke: '#2980B9',
          strokeWidth: 2,
        });

        mexRect.set('data', { id: mex.id });
        canvas.add(mexRect);

        addMEX(mex);
      }

      // Outil room tag
      if (activeTool === 'room-tag') {
        const realPos = pixelsToMeters(point, scale.pixelsPerMeter);
        const label = prompt('Nom de la pièce :');

        if (label) {
          const tag: RoomTag = {
            id: `tag_${Date.now()}`,
            label,
            position: realPos,
          };

          const text = new fabric.Text(label, {
            left: point.x,
            top: point.y,
            fontSize: 16,
            fill: '#333',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          });

          text.set('data', { id: tag.id });
          canvas.add(text);

          addRoomTag(tag);
        }
      }
    };

    const handleMouseMove = (event: fabric.IEvent) => {
      if (!isDrawing || !currentLine || !startPoint || !event.pointer) return;

      let pointer = { x: event.pointer.x, y: event.pointer.y };

      // Snap to grid si activé
      if (grid.snapEnabled) {
        pointer = snapToGrid(pointer, grid.primarySpacing, scale.pixelsPerMeter, grid.origin);
      }

      currentLine.set({ x2: pointer.x, y2: pointer.y });
      canvas.requestRenderAll();
    };

    const handleMouseUp = (event: fabric.IEvent) => {
      if (!isDrawing || !currentLine || !startPoint || !event.pointer) return;

      let endPoint = { x: event.pointer.x, y: event.pointer.y };

      // Snap to grid si activé
      if (grid.snapEnabled) {
        endPoint = snapToGrid(endPoint, grid.primarySpacing, scale.pixelsPerMeter, grid.origin);
      }

      // Convertir en coordonnées réelles
      const realStart = pixelsToMeters(startPoint, scale.pixelsPerMeter);
      const realEnd = pixelsToMeters(endPoint, scale.pixelsPerMeter);

      if (selectedElementType) {
        const wall: WallSegment = {
          id: `wall_${Date.now()}`,
          typeId: selectedElementType.id,
          start: realStart,
          end: realEnd,
        };

        addWall(wall);
      }

      setIsDrawing(false);
      setCurrentLine(null);
      setStartPoint(null);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [
    canvas,
    activeTool,
    selectedElementType,
    grid,
    scale,
    isDrawing,
    currentLine,
    startPoint,
    isCalibrating,
    calibrationPoints,
    setCalibrationPoints,
    addWall,
    addMEX,
    addRoomTag,
  ]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas ref={canvasRef} />
      <div className="canvas-info">
        <span>Outil actif: {activeTool}</span>
        {scale.isCalibrated && (
          <span>Échelle: {scale.pixelsPerMeter.toFixed(2)} px/m</span>
        )}
      </div>
    </div>
  );
};

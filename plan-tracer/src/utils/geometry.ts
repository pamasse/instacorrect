import type { Point, RealPoint, WallSegment, Intersection } from '../types';

/**
 * Convertit des coordonnées pixels en mètres
 */
export function pixelsToMeters(point: Point, pixelsPerMeter: number): RealPoint {
  return {
    x: point.x / pixelsPerMeter,
    y: point.y / pixelsPerMeter,
  };
}

/**
 * Convertit des coordonnées mètres en pixels
 */
export function metersToPixels(point: RealPoint, pixelsPerMeter: number): Point {
  return {
    x: point.x * pixelsPerMeter,
    y: point.y * pixelsPerMeter,
  };
}

/**
 * Calcule la distance entre deux points en pixels
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcule la distance entre deux points réels en mètres
 */
export function distanceMeters(p1: RealPoint, p2: RealPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Snap un point à la grille
 */
export function snapToGrid(
  point: Point,
  gridSpacing: number,
  pixelsPerMeter: number,
  origin: Point = { x: 0, y: 0 }
): Point {
  const gridPixels = gridSpacing * pixelsPerMeter;

  return {
    x: Math.round((point.x - origin.x) / gridPixels) * gridPixels + origin.x,
    y: Math.round((point.y - origin.y) / gridPixels) * gridPixels + origin.y,
  };
}

/**
 * Vérifie si deux segments se croisent et retourne le point d'intersection
 * Algorithme basé sur la détection d'intersection de segments
 */
export function getSegmentIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
  tolerance: number = 0.001
): Point | null {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  // Segments parallèles
  if (Math.abs(denom) < tolerance) {
    return null;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  // Vérifier si l'intersection est sur les deux segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    };
  }

  return null;
}

/**
 * Détecte toutes les intersections entre segments de murs
 * Feature V2 : permet la détection automatique des raccords
 */
export function findWallIntersections(
  walls: WallSegment[],
  pixelsPerMeter: number
): Intersection[] {
  const intersections: Intersection[] = [];

  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const wall1 = walls[i];
      const wall2 = walls[j];

      const p1 = metersToPixels(wall1.start, pixelsPerMeter);
      const p2 = metersToPixels(wall1.end, pixelsPerMeter);
      const p3 = metersToPixels(wall2.start, pixelsPerMeter);
      const p4 = metersToPixels(wall2.end, pixelsPerMeter);

      const intersection = getSegmentIntersection(p1, p2, p3, p4);

      if (intersection) {
        // Déterminer le type de raccord
        const type = determineJunctionType(p1, p2, p3, p4, intersection);

        intersections.push({
          point: intersection,
          segment1Id: wall1.id,
          segment2Id: wall2.id,
          type,
        });
      }
    }
  }

  return intersections;
}

/**
 * Détermine le type de raccord entre deux murs (T, L, ou X)
 */
function determineJunctionType(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
  intersection: Point
): 'T' | 'L' | 'X' {
  const threshold = 5; // pixels

  // Vérifier si l'intersection est à une extrémité des segments
  const isEnd1 = distance(intersection, p1) < threshold || distance(intersection, p2) < threshold;
  const isEnd2 = distance(intersection, p3) < threshold || distance(intersection, p4) < threshold;

  if (isEnd1 && isEnd2) {
    return 'L'; // Raccord en L (angle)
  } else if (isEnd1 || isEnd2) {
    return 'T'; // Raccord en T
  } else {
    return 'X'; // Croisement
  }
}

/**
 * Nettoie les segments redondants ou très proches
 * Feature V2 : évite les doublons lors du tracé
 */
export function removeDuplicateWalls(
  walls: WallSegment[],
  _pixelsPerMeter: number,
  threshold: number = 0.01 // 1cm
): WallSegment[] {
  const filtered: WallSegment[] = [];

  for (const wall of walls) {
    const isDuplicate = filtered.some((existing) => {
      const startDist = distanceMeters(wall.start, existing.start);
      const endDist = distanceMeters(wall.end, existing.end);

      // Vérifier si même segment (même sens)
      if (startDist < threshold && endDist < threshold) {
        return true;
      }

      // Vérifier si même segment (sens inverse)
      const startDistReverse = distanceMeters(wall.start, existing.end);
      const endDistReverse = distanceMeters(wall.end, existing.start);

      if (startDistReverse < threshold && endDistReverse < threshold) {
        return true;
      }

      return false;
    });

    if (!isDuplicate) {
      filtered.push(wall);
    }
  }

  return filtered;
}

/**
 * Calcule l'angle entre deux points en degrés
 */
export function angleBetweenPoints(p1: Point, p2: Point): number {
  const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return (radians * 180) / Math.PI;
}

/**
 * Vérifie si un point est proche d'un segment
 */
export function isPointNearSegment(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point,
  threshold: number = 10 // pixels
): boolean {
  const dist = distancePointToSegment(point, segmentStart, segmentEnd);
  return dist < threshold;
}

/**
 * Calcule la distance d'un point à un segment
 */
export function distancePointToSegment(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point
): number {
  const x = point.x;
  const y = point.y;
  const x1 = segmentStart.x;
  const y1 = segmentStart.y;
  const x2 = segmentEnd.x;
  const y2 = segmentEnd.y;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

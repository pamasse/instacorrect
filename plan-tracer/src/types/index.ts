// Types pour la bibliothèque d'éléments

/**
 * Catégorie d'élément constructif
 */
export type ElementCategory = 'mur' | 'cloison' | 'mex';

/**
 * Type d'outil de tracé
 */
export type ToolType = 'select' | 'wall' | 'mex' | 'room-tag' | 'calibrate' | 'pan';

/**
 * Définition d'un type d'élément dans la bibliothèque
 */
export interface ElementType {
  id: string;
  name: string;
  category: ElementCategory;
  thickness?: number; // en mètres, pour murs/cloisons
  color?: string; // couleur d'affichage
  metadata?: Record<string, unknown>;
}

/**
 * Point 2D en coordonnées canvas (pixels)
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Point 2D en coordonnées réelles (mètres)
 */
export interface RealPoint {
  x: number;
  y: number;
}

/**
 * Segment de mur/cloison
 */
export interface WallSegment {
  id: string;
  typeId: string; // référence à ElementType.id
  start: RealPoint;
  end: RealPoint;
  canvasId?: string; // ID de l'objet Fabric.js
}

/**
 * Menuiserie extérieure
 */
export interface MEX {
  id: string;
  typeId: string;
  position: RealPoint;
  rotation: number; // en degrés
  wallId?: string; // ID du mur sur lequel la MEX est placée
  canvasId?: string;
}

/**
 * Tag de pièce
 */
export interface RoomTag {
  id: string;
  label: string;
  position: RealPoint;
  canvasId?: string;
}

/**
 * Configuration de la grille
 */
export interface GridConfig {
  enabled: boolean;
  snapEnabled: boolean;
  primarySpacing: number; // en mètres
  secondarySpacing?: number; // en mètres (subdivision)
  origin: Point; // origine de la grille en pixels
  visible: boolean;
}

/**
 * Calibration de l'échelle
 */
export interface ScaleCalibration {
  pixelsPerMeter: number;
  isCalibrated: boolean;
  referenceDistance?: number; // distance réelle en mètres
  referencePixels?: number; // distance en pixels sur le canvas
}

/**
 * Métadonnées du projet
 */
export interface ProjectMetadata {
  name: string;
  date: string;
  floor?: string;
  scale: ScaleCalibration;
}

/**
 * Quantitatifs calculés
 */
export interface Quantities {
  walls: Record<string, number>; // typeId -> longueur totale en mètres
  mexCount: Record<string, number>; // typeId -> nombre
}

/**
 * Structure JSON d'export pour Revit
 */
export interface ExportData {
  metadata: ProjectMetadata;
  walls: WallSegment[];
  mex: MEX[];
  roomTags: RoomTag[];
  quantities: Quantities;
}

/**
 * Intersection entre deux segments
 */
export interface Intersection {
  point: Point;
  segment1Id: string;
  segment2Id: string;
  type: 'T' | 'L' | 'X'; // Type de raccord
}

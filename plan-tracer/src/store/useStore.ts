import { create } from 'zustand';
import type {
  ElementType,
  ToolType,
  WallSegment,
  MEX,
  RoomTag,
  GridConfig,
  ScaleCalibration,
  ProjectMetadata,
  Quantities,
} from '../types';
import libraryData from '../data/library.json';
import { fabric } from 'fabric';

/**
 * Interface de l'état global de l'application
 */
interface AppState {
  // Métadonnées du projet
  projectName: string;
  setProjectName: (name: string) => void;

  // Bibliothèque d'éléments
  library: ElementType[];

  // Outil actif
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;

  // Type d'élément sélectionné pour le tracé
  selectedElementType: ElementType | null;
  setSelectedElementType: (type: ElementType | null) => void;

  // Canvas Fabric.js instance
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;

  // Éléments tracés
  walls: WallSegment[];
  mex: MEX[];
  roomTags: RoomTag[];

  addWall: (wall: WallSegment) => void;
  removeWall: (id: string) => void;
  updateWall: (id: string, updates: Partial<WallSegment>) => void;

  addMEX: (mex: MEX) => void;
  removeMEX: (id: string) => void;

  addRoomTag: (tag: RoomTag) => void;
  removeRoomTag: (id: string) => void;
  updateRoomTag: (id: string, updates: Partial<RoomTag>) => void;

  // Calibration de l'échelle
  scale: ScaleCalibration;
  setScale: (scale: Partial<ScaleCalibration>) => void;

  // Configuration de la grille
  grid: GridConfig;
  setGrid: (grid: Partial<GridConfig>) => void;

  // Image de fond de plan
  backgroundImage: string | null;
  setBackgroundImage: (image: string | null) => void;

  // Mode calibration
  isCalibrating: boolean;
  setIsCalibrating: (value: boolean) => void;
  calibrationPoints: { x: number; y: number }[];
  setCalibrationPoints: (points: { x: number; y: number }[]) => void;

  // Calcul des quantitatifs
  getQuantities: () => Quantities;

  // Export JSON
  exportJSON: () => string;

  // Réinitialisation
  reset: () => void;
}

/**
 * Store Zustand principal de l'application
 */
export const useStore = create<AppState>((set, get) => ({
  // État initial
  projectName: 'Nouveau projet',
  library: libraryData.elements as ElementType[],
  activeTool: 'select',
  selectedElementType: null,
  canvas: null,
  walls: [],
  mex: [],
  roomTags: [],
  scale: {
    pixelsPerMeter: 100,
    isCalibrated: false,
  },
  grid: {
    enabled: true,
    snapEnabled: true,
    primarySpacing: 1.20, // 120cm - trame modulaire standard
    secondarySpacing: 0.60, // 60cm - subdivision
    origin: { x: 0, y: 0 },
    visible: true,
  },
  backgroundImage: null,
  isCalibrating: false,
  calibrationPoints: [],

  // Actions
  setProjectName: (name) => set({ projectName: name }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setSelectedElementType: (type) => set({ selectedElementType: type }),

  setCanvas: (canvas) => set({ canvas }),

  addWall: (wall) => set((state) => ({ walls: [...state.walls, wall] })),

  removeWall: (id) =>
    set((state) => ({
      walls: state.walls.filter((w) => w.id !== id),
    })),

  updateWall: (id, updates) =>
    set((state) => ({
      walls: state.walls.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  addMEX: (mex) => set((state) => ({ mex: [...state.mex, mex] })),

  removeMEX: (id) =>
    set((state) => ({
      mex: state.mex.filter((m) => m.id !== id),
    })),

  addRoomTag: (tag) => set((state) => ({ roomTags: [...state.roomTags, tag] })),

  removeRoomTag: (id) =>
    set((state) => ({
      roomTags: state.roomTags.filter((t) => t.id !== id),
    })),

  updateRoomTag: (id, updates) =>
    set((state) => ({
      roomTags: state.roomTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  setScale: (scale) =>
    set((state) => ({
      scale: { ...state.scale, ...scale },
    })),

  setGrid: (grid) =>
    set((state) => ({
      grid: { ...state.grid, ...grid },
    })),

  setBackgroundImage: (image) => set({ backgroundImage: image }),

  setIsCalibrating: (value) => set({ isCalibrating: value }),

  setCalibrationPoints: (points) => set({ calibrationPoints: points }),

  /**
   * Calcule les quantitatifs en temps réel
   */
  getQuantities: () => {
    const state = get();
    const quantities: Quantities = {
      walls: {},
      mexCount: {},
    };

    // Calcul des métrés linéaires pour les murs
    state.walls.forEach((wall) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (!quantities.walls[wall.typeId]) {
        quantities.walls[wall.typeId] = 0;
      }
      quantities.walls[wall.typeId] += length;
    });

    // Comptage des MEX
    state.mex.forEach((mex) => {
      if (!quantities.mexCount[mex.typeId]) {
        quantities.mexCount[mex.typeId] = 0;
      }
      quantities.mexCount[mex.typeId] += 1;
    });

    return quantities;
  },

  /**
   * Exporte les données au format JSON pour Revit
   */
  exportJSON: () => {
    const state = get();
    const metadata: ProjectMetadata = {
      name: state.projectName,
      date: new Date().toISOString(),
      scale: state.scale,
    };

    const exportData = {
      metadata,
      walls: state.walls,
      mex: state.mex,
      roomTags: state.roomTags,
      quantities: state.getQuantities(),
    };

    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Réinitialise l'application
   */
  reset: () =>
    set({
      projectName: 'Nouveau projet',
      activeTool: 'select',
      selectedElementType: null,
      walls: [],
      mex: [],
      roomTags: [],
      scale: {
        pixelsPerMeter: 100,
        isCalibrated: false,
      },
      backgroundImage: null,
      isCalibrating: false,
      calibrationPoints: [],
    }),
}));

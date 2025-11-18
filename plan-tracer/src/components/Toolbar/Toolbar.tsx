import { useStore } from '../../store/useStore';
import type { ToolType } from '../../types';
import './Toolbar.css';

/**
 * Barre d'outils principale
 */
export const Toolbar = () => {
  const { activeTool, setActiveTool } = useStore();

  const tools: { type: ToolType; label: string; icon: string; shortcut?: string }[] = [
    { type: 'select', label: 'Sélection', icon: '↖', shortcut: 'V' },
    { type: 'wall', label: 'Mur/Cloison', icon: '▬', shortcut: 'W' },
    { type: 'mex', label: 'MEX', icon: '🪟', shortcut: 'M' },
    { type: 'room-tag', label: 'Tag pièce', icon: '🏷', shortcut: 'T' },
    { type: 'calibrate', label: 'Calibration', icon: '📏', shortcut: 'C' },
    { type: 'pan', label: 'Déplacer', icon: '✋', shortcut: 'H' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-title">Outils</div>
      <div className="toolbar-buttons">
        {tools.map((tool) => (
          <button
            key={tool.type}
            className={`toolbar-button ${activeTool === tool.type ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.type)}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import './GridSettings.css';

/**
 * Composant de paramétrage de la grille
 */
export const GridSettings = () => {
  const { grid, setGrid } = useStore();

  const [primarySpacing, setPrimarySpacing] = useState(grid.primarySpacing.toString());
  const [secondarySpacing, setSecondarySpacing] = useState(
    grid.secondarySpacing?.toString() || ''
  );

  const handlePrimarySpacingChange = (value: string) => {
    setPrimarySpacing(value);
    const spacing = parseFloat(value);
    if (!isNaN(spacing) && spacing > 0) {
      setGrid({ primarySpacing: spacing });
    }
  };

  const handleSecondarySpacingChange = (value: string) => {
    setSecondarySpacing(value);
    if (value === '') {
      setGrid({ secondarySpacing: undefined });
    } else {
      const spacing = parseFloat(value);
      if (!isNaN(spacing) && spacing > 0) {
        setGrid({ secondarySpacing: spacing });
      }
    }
  };

  // Espacements prédéfinis pour construction modulaire
  const presets = [
    { label: '1.20m (trame standard)', primary: 1.20, secondary: 0.60 },
    { label: '0.60m', primary: 0.60, secondary: 0.30 },
    { label: '1.00m', primary: 1.00, secondary: 0.50 },
    { label: '2.40m', primary: 2.40, secondary: 1.20 },
  ];

  return (
    <div className="grid-settings">
      <h4>Paramètres de la grille</h4>

      <div className="grid-controls">
        <label className="grid-checkbox">
          <input
            type="checkbox"
            checked={grid.visible}
            onChange={(e) => setGrid({ visible: e.target.checked })}
          />
          <span>Afficher la grille</span>
        </label>

        <label className="grid-checkbox">
          <input
            type="checkbox"
            checked={grid.snapEnabled}
            onChange={(e) => setGrid({ snapEnabled: e.target.checked })}
          />
          <span>Magnétisme (snap to grid)</span>
        </label>
      </div>

      <div className="grid-spacing">
        <div className="spacing-input">
          <label htmlFor="primary-spacing">Espacement principal (m):</label>
          <input
            id="primary-spacing"
            type="number"
            step="0.01"
            min="0.01"
            value={primarySpacing}
            onChange={(e) => handlePrimarySpacingChange(e.target.value)}
          />
        </div>

        <div className="spacing-input">
          <label htmlFor="secondary-spacing">Subdivision (m) - optionnel:</label>
          <input
            id="secondary-spacing"
            type="number"
            step="0.01"
            min="0.01"
            value={secondarySpacing}
            onChange={(e) => handleSecondarySpacingChange(e.target.value)}
            placeholder="Aucune"
          />
        </div>
      </div>

      <div className="grid-presets">
        <label>Préréglages:</label>
        <div className="preset-buttons">
          {presets.map((preset) => (
            <button
              key={preset.label}
              className="preset-button"
              onClick={() => {
                setPrimarySpacing(preset.primary.toString());
                setSecondarySpacing(preset.secondary.toString());
                setGrid({
                  primarySpacing: preset.primary,
                  secondarySpacing: preset.secondary,
                });
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

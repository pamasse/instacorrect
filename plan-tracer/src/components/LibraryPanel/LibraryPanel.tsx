import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { ElementCategory } from '../../types';
import './LibraryPanel.css';

/**
 * Panneau de bibliothèque d'éléments
 */
export const LibraryPanel = () => {
  const { library, selectedElementType, setSelectedElementType } = useStore();
  const [categoryFilter, setCategoryFilter] = useState<ElementCategory | 'all'>('all');

  const filteredElements = library.filter(
    (element) => categoryFilter === 'all' || element.category === categoryFilter
  );

  const categories: { value: ElementCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'mur', label: 'Murs' },
    { value: 'cloison', label: 'Cloisons' },
    { value: 'mex', label: 'Menuiseries' },
  ];

  return (
    <div className="library-panel">
      <div className="library-header">
        <h3>Bibliothèque</h3>
      </div>

      <div className="library-filters">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`filter-button ${categoryFilter === cat.value ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="library-items">
        {filteredElements.map((element) => (
          <div
            key={element.id}
            className={`library-item ${
              selectedElementType?.id === element.id ? 'selected' : ''
            }`}
            onClick={() => setSelectedElementType(element)}
          >
            <div
              className="item-color-indicator"
              style={{ backgroundColor: element.color || '#ccc' }}
            />
            <div className="item-info">
              <div className="item-name">{element.name}</div>
              <div className="item-details">
                {element.thickness && (
                  <span className="item-thickness">
                    Épaisseur: {(element.thickness * 1000).toFixed(0)}mm
                  </span>
                )}
                <span className="item-category">{element.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedElementType && (
        <div className="selected-element-info">
          <h4>Élément sélectionné</h4>
          <div className="selected-element-name">{selectedElementType.name}</div>
          {selectedElementType.metadata && (
            <div className="selected-element-metadata">
              {Object.entries(selectedElementType.metadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}:</span>
                  <span className="metadata-value">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

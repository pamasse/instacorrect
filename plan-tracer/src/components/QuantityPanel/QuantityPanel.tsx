import { useStore } from '../../store/useStore';
import './QuantityPanel.css';

/**
 * Panneau de quantitatifs
 * Affiche les métrés linéaires et comptages en temps réel
 */
export const QuantityPanel = () => {
  const { library, getQuantities } = useStore();

  const quantities = getQuantities();

  // Grouper les quantités par catégorie
  const wallQuantities = Object.entries(quantities.walls).map(([typeId, length]) => {
    const elementType = library.find((e) => e.id === typeId);
    return { typeId, length, elementType };
  });

  const mexQuantities = Object.entries(quantities.mexCount).map(([typeId, count]) => {
    const elementType = library.find((e) => e.id === typeId);
    return { typeId, count, elementType };
  });

  const totalWallLength = Object.values(quantities.walls).reduce((sum, l) => sum + l, 0);
  const totalMEXCount = Object.values(quantities.mexCount).reduce((sum, c) => sum + c, 0);

  return (
    <div className="quantity-panel">
      <div className="quantity-header">
        <h3>Quantitatifs</h3>
      </div>

      <div className="quantity-section">
        <h4>Murs et Cloisons</h4>
        {wallQuantities.length > 0 ? (
          <>
            <div className="quantity-list">
              {wallQuantities.map(({ typeId, length, elementType }) => (
                <div key={typeId} className="quantity-item">
                  <div
                    className="quantity-color"
                    style={{ backgroundColor: elementType?.color || '#ccc' }}
                  />
                  <div className="quantity-info">
                    <div className="quantity-name">
                      {elementType?.name || 'Inconnu'}
                    </div>
                    <div className="quantity-value">{length.toFixed(2)} m</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="quantity-total">
              Total: <strong>{totalWallLength.toFixed(2)} m</strong>
            </div>
          </>
        ) : (
          <div className="quantity-empty">Aucun mur tracé</div>
        )}
      </div>

      <div className="quantity-section">
        <h4>Menuiseries (MEX)</h4>
        {mexQuantities.length > 0 ? (
          <>
            <div className="quantity-list">
              {mexQuantities.map(({ typeId, count, elementType }) => (
                <div key={typeId} className="quantity-item">
                  <div
                    className="quantity-color"
                    style={{ backgroundColor: elementType?.color || '#ccc' }}
                  />
                  <div className="quantity-info">
                    <div className="quantity-name">
                      {elementType?.name || 'Inconnu'}
                    </div>
                    <div className="quantity-value">{count} unité(s)</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="quantity-total">
              Total: <strong>{totalMEXCount} menuiserie(s)</strong>
            </div>
          </>
        ) : (
          <div className="quantity-empty">Aucune menuiserie placée</div>
        )}
      </div>
    </div>
  );
};

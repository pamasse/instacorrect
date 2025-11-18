import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { distance } from '../../utils/geometry';
import './ScaleCalibration.css';

/**
 * Composant de calibration de l'échelle
 */
export const ScaleCalibration = () => {
  const {
    scale,
    setScale,
    isCalibrating,
    setIsCalibrating,
    calibrationPoints,
    setCalibrationPoints,
    setActiveTool,
  } = useStore();

  const [realDistance, setRealDistance] = useState<string>('');

  /**
   * Démarre le mode calibration
   */
  const startCalibration = () => {
    setCalibrationPoints([]);
    setIsCalibrating(true);
    setActiveTool('calibrate');
  };

  /**
   * Annule la calibration
   */
  const cancelCalibration = () => {
    setIsCalibrating(false);
    setCalibrationPoints([]);
    setActiveTool('select');
  };

  /**
   * Valide la calibration
   */
  const validateCalibration = () => {
    if (calibrationPoints.length !== 2) {
      alert('Veuillez cliquer deux points sur le plan');
      return;
    }

    const realDist = parseFloat(realDistance);
    if (!realDist || realDist <= 0) {
      alert('Veuillez entrer une distance valide en mètres');
      return;
    }

    const pixelDist = distance(calibrationPoints[0], calibrationPoints[1]);

    if (pixelDist === 0) {
      alert('Les deux points doivent être différents');
      return;
    }

    const pixelsPerMeter = pixelDist / realDist;

    setScale({
      pixelsPerMeter,
      isCalibrated: true,
      referenceDistance: realDist,
      referencePixels: pixelDist,
    });

    setIsCalibrating(false);
    setCalibrationPoints([]);
    setActiveTool('select');

    alert(`Calibration réussie!\nÉchelle: ${pixelsPerMeter.toFixed(2)} pixels/mètre`);
  };

  return (
    <div className="scale-calibration">
      <h4>Calibration de l'échelle</h4>

      {scale.isCalibrated && (
        <div className="calibration-info">
          <div className="calibration-status calibrated">✓ Calibré</div>
          <div className="calibration-details">
            <div>Échelle: {scale.pixelsPerMeter.toFixed(2)} px/m</div>
            {scale.referenceDistance && (
              <div>
                Référence: {scale.referenceDistance.toFixed(2)}m ={' '}
                {scale.referencePixels?.toFixed(0)}px
              </div>
            )}
          </div>
        </div>
      )}

      {!isCalibrating && (
        <button className="calibration-button" onClick={startCalibration}>
          {scale.isCalibrated ? 'Recalibrer' : 'Calibrer l\'échelle'}
        </button>
      )}

      {isCalibrating && (
        <div className="calibration-active">
          <div className="calibration-instructions">
            <p>
              <strong>Étape {calibrationPoints.length + 1}/2:</strong>
            </p>
            <p>
              {calibrationPoints.length === 0
                ? 'Cliquez sur le premier point de référence sur le plan'
                : 'Cliquez sur le second point de référence'}
            </p>
          </div>

          {calibrationPoints.length === 2 && (
            <div className="calibration-input">
              <label htmlFor="real-distance">
                Distance réelle entre les deux points (en mètres) :
              </label>
              <input
                id="real-distance"
                type="number"
                step="0.01"
                min="0.01"
                value={realDistance}
                onChange={(e) => setRealDistance(e.target.value)}
                placeholder="Ex: 3.6"
                autoFocus
              />
            </div>
          )}

          <div className="calibration-actions">
            <button className="button-cancel" onClick={cancelCalibration}>
              Annuler
            </button>
            {calibrationPoints.length === 2 && (
              <button className="button-validate" onClick={validateCalibration}>
                Valider
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

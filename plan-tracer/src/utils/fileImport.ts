import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js
// Note: le chemin peut nécessiter un ajustement selon le build
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Types de fichiers acceptés
 */
export const ACCEPTED_FILE_TYPES = {
  PDF: 'application/pdf',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
};

/**
 * Charge une image depuis un fichier
 */
export async function loadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Erreur lors de la lecture du fichier'));
      }
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));

    reader.readAsDataURL(file);
  });
}

/**
 * Convertit la première page d'un PDF en image
 */
export async function loadPDFFile(file: File, scale: number = 2): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Charger la première page
    const page = await pdf.getPage(1);

    // Calculer les dimensions du viewport
    const viewport = page.getViewport({ scale });

    // Créer un canvas pour le rendu
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Impossible de créer le contexte canvas');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Rendre la page sur le canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext as any).promise;

    // Convertir le canvas en data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Erreur lors du chargement du PDF:', error);
    throw new Error('Impossible de charger le fichier PDF');
  }
}

/**
 * Charge un fichier fond de plan (PDF ou image)
 */
export async function loadBackgroundFile(file: File): Promise<string> {
  // Vérifier le type de fichier
  if (file.type === ACCEPTED_FILE_TYPES.PDF) {
    return loadPDFFile(file);
  } else if (
    file.type === ACCEPTED_FILE_TYPES.PNG ||
    file.type === ACCEPTED_FILE_TYPES.JPEG ||
    file.type === ACCEPTED_FILE_TYPES.JPG ||
    file.type.startsWith('image/')
  ) {
    return loadImageFile(file);
  } else {
    throw new Error(
      'Format de fichier non supporté. Formats acceptés : PDF, PNG, JPG.\n\n' +
        'Pour les fichiers DWG, veuillez les convertir en PDF ou image avant import.'
    );
  }
}

/**
 * Télécharge un fichier JSON
 */
export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Client-side WebP conversion
 * Converts JPEG/PNG images to WebP before upload
 */

export async function convertImageToWebP(file: File, quality: number = 0.85): Promise<File> {
  // If already WebP, return as-is
  if (file.type === 'image/webp') {
    console.log('✅ Already WebP format');
    return file;
  }

  console.log('🔄 Converting to WebP...', {
    original: file.name,
    type: file.type,
    size: (file.size / 1024).toFixed(2) + 'KB'
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Set canvas dimensions to image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP conversion failed'));
              return;
            }

            // Create new File from blob
            const webpFile = new File(
              [blob],
              file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
              { type: 'image/webp' }
            );

            const savings = ((file.size - webpFile.size) / file.size) * 100;

            console.log('✅ Converted to WebP:', {
              originalSize: (file.size / 1024).toFixed(2) + 'KB',
              webpSize: (webpFile.size / 1024).toFixed(2) + 'KB',
              savings: savings.toFixed(1) + '%'
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

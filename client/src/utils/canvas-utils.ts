import { Filter, Frame } from '@/types/photo-booth';

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: Filter['effect']
) {
  if (filter === 'none') return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  switch (filter) {
    case 'beauty':
      // Soft beauty filter - increase brightness and reduce contrast slightly
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.1);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
      }
      break;
    case 'vintage':
      // Vintage sepia effect
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
      break;
    case 'warm':
      // Warm filter - increase red and yellow tones
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
      }
      break;
    case 'cool':
      // Cool filter - increase blue tones
      for (let i = 0; i < data.length; i += 4) {
        data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
      }
      break;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

export function addFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameType: Frame['type']
) {
  if (frameType === 'none') return;

  ctx.lineWidth = 20;
  
  switch (frameType) {
    case 'heart':
      ctx.strokeStyle = '#FF1493';
      break;
    case 'flower':
      ctx.strokeStyle = '#DA70D6';
      break;
    case 'star':
      ctx.strokeStyle = '#FFD700';
      break;
    case 'rainbow':
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#FF0000');
      gradient.addColorStop(0.2, '#FF7F00');
      gradient.addColorStop(0.4, '#FFFF00');
      gradient.addColorStop(0.6, '#00FF00');
      gradient.addColorStop(0.8, '#0000FF');
      gradient.addColorStop(1, '#8F00FF');
      ctx.strokeStyle = gradient;
      break;
  }
  
  ctx.strokeRect(10, 10, width - 20, height - 20);
}

export function downloadCanvas(canvas: HTMLCanvasElement) {
  const link = document.createElement('a');
  link.download = `kawaii-photo-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

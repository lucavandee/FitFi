// /src/utils/shareImage.ts
type ShareInput = {
  title: string;
  match: number;
  archetype: string;
  imageUrl: string;
  pageUrl: string;
};

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
};

export async function generateOutfitShareImage(input: ShareInput): Promise<string | null> {
  try {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Achtergrond (licht, neutraal)
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, W, H);

    // Afbeelding (boven)
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = input.imageUrl;
    });

    const IMG_W = W - 160;
    const IMG_H = Math.round(IMG_W * (4 / 3)); // 3/4 beeld -> in staand canvas
    const IMG_X = 80;
    const IMG_Y = 80;
    // card-achtergrond
    ctx.fillStyle = "rgba(0,0,0,0.04)";
    ctx.fillRect(IMG_X - 10, IMG_Y - 10, IMG_W + 20, IMG_H + 20);
    ctx.drawImage(img, IMG_X, IMG_Y, IMG_W, IMG_H);

    // Titel + meta
    const baseX = 100;
    let baseY = IMG_Y + IMG_H + 80;

    ctx.fillStyle = "black";
    ctx.font = "bold 44px Montserrat, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial";
    drawWrappedText(ctx, input.title, baseX, baseY, W - 200, 48);
    baseY += 100;

    // Match badge
    ctx.fillStyle = "black";
    ctx.font = "500 28px Lato, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial";
    ctx.fillText(`${input.match}% match • ${input.archetype}`, baseX, baseY);
    baseY += 56;

    // Footer (FitFi + URL)
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.font = "500 24px Lato, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial";
    ctx.fillText("FitFi — Personal Style", baseX, H - 120);
    ctx.fillText(input.pageUrl, baseX, H - 80);

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
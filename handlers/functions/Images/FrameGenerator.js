const { createCanvas, loadImage } = require('canvas'); // Si vous utilisez Node.js
const { AttachmentBuilder } = require('discord.js');

const FrameGenerator = async (profile) => {
    const canvas = createCanvas(349, 715);
    const ctx = canvas.getContext('2d');
    
    function roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // D'abord dessiner le fond (blanc ou image)
    if (profile.background_url) {
        try {
            const bgImage = await loadImage(profile.background_url);
            // Créer le clipping path avant de dessiner l'image
            roundedRect(10, 8, 329, 699, 45);
            ctx.clip();
            ctx.drawImage(bgImage, 10, 8, 329, 699);
            ctx.restore(); // Important: réinitialiser le clipping
        } catch (error) {
            console.error("Erreur de chargement de l'image:", error);
            // Fallback au rectangle blanc
            ctx.fillStyle = 'rgb(255, 255, 255)';
            roundedRect(10, 8, 329, 699, 45);
            ctx.fill();
        }
    } else {
        // Cas où il n'y a pas d'URL: dessiner directement le rectangle blanc
        ctx.fillStyle = 'rgb(255, 255, 255)';
        roundedRect(10, 8, 329, 699, 45);
        ctx.fill();
    }

    // Dessiner le contour (toujours visible)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    roundedRect(10, 8, 329, 699, 45);
    ctx.stroke();

    // Superposer le frame
    const frame = await loadImage('https://i.imgur.com/Hx9pZSD.png');
    ctx.drawImage(frame, 0, 0);

    return {
        ctx,
        canvas
    };
};

async function getImageBrightness(imageUrl) {
    try {
        const img = await loadImage(imageUrl);
        const tempCanvas = createCanvas(img.width, img.height);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, img.width, img.height).data;
        let brightnessSum = 0;
        
        // Analyser seulement un échantillon des pixels pour des performances
        for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            brightnessSum += (0.299 * r + 0.587 * g + 0.114 * b); // Formule de luminance
        }
        
        const avgBrightness = brightnessSum / (imageData.length / 16 / 4);
        return avgBrightness / 255; // Normaliser entre 0 et 1
    } catch {
        return 0.5; // Valeur par défaut si erreur
    }
}

const ImageBuffer = async (canvas, name) => {
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: `${name}.png` });
    return attachment;
}

module.exports = { FrameGenerator, getImageBrightness, ImageBuffer };
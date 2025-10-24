

const DELIMITER = '11111111111111111111111100000000';

const textToBinary = (text: string): string => {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
};

const binaryToText = (binary: string): string => {
  if (binary.length % 8 !== 0) {
    console.error("Binary string length is not a multiple of 8");
    return "";
  }
  const chars = binary.match(/.{1,8}/g) || [];
  return chars.map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
};

const applyKeyToImage = (imageData: ImageData, key: string): void => {
    const pixels = imageData.data;
    if (key.length === 0) return;

    for (let i = 0; i < pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) { // R, G, B channels
            pixels[i + j] ^= key.charCodeAt((i + j) % key.length);
        }
    }
};

const encryptDecryptText = (text: string, key: string): string => {
    if (key.length === 0) return text;
    return text.split('').map((char, i) => {
        return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length));
    }).join('');
};


export const hideData = (
    ctx: CanvasRenderingContext2D,
    message: string,
    imageKey: string,
    messageKey: string
): string => {
    const encryptedMessage = encryptDecryptText(message, messageKey);
    const binaryMessage = textToBinary(encryptedMessage) + DELIMITER;

    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const maxBits = pixels.length / 4 * 3;
    if (binaryMessage.length > maxBits) {
        throw new Error('Message is too large to hide in this image.');
    }

    applyKeyToImage(imageData, imageKey); // Encrypt the image

    let dataIndex = 0;
    for (let i = 0; i < pixels.length && dataIndex < binaryMessage.length; i += 4) {
        for (let j = 0; j < 3 && dataIndex < binaryMessage.length; j++) { // R, G, B channels
            pixels[i + j] = (pixels[i + j] & 0xfe) | parseInt(binaryMessage[dataIndex], 2);
            dataIndex++;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return ctx.canvas.toDataURL();
};

export const revealData = (
    ctx: CanvasRenderingContext2D,
    imageKey: string,
    messageKey: string
): { message: string; recoveredImageUrl: string } => {
    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let binaryMessage = '';
    let foundDelimiter = false;

    // Create a temporary copy of image data before decryption to extract message
    const stegoImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);

    // Extract LSBs from the stego image to find message
    for (let i = 0; i < stegoImageData.data.length; i += 4) {
        for (let j = 0; j < 3; j++) { // R, G, B channels
            binaryMessage += stegoImageData.data[i + j] & 1;
            if (binaryMessage.endsWith(DELIMITER)) {
                foundDelimiter = true;
                break;
            }
        }
        if (foundDelimiter) break;
    }

    if (!foundDelimiter) {
        throw new Error('No hidden message found or delimiter is corrupted.');
    }
    
    const encryptedMessageText = binaryToText(binaryMessage.slice(0, -DELIMITER.length));
    const message = encryptDecryptText(encryptedMessageText, messageKey);

    // Decrypt original image data to recover it
    applyKeyToImage(imageData, imageKey);
    
    ctx.putImageData(imageData, 0, 0);
    const recoveredImageUrl = ctx.canvas.toDataURL();

    return { message, recoveredImageUrl };
};
const canvas = document.getElementById('canvas');

canvas.width = window.innerWidth;

const rangeStart = 300;
const rangeEnd = 760;

const lmsToCieXyzMatrix = [
    [1.9102, -1.11212, 0.20191],
    [0.37095, 0.62905, 0],
    [0, 0, 1],
]

const xyzToLinearRgbMatrix = [
    [3.2406255, -1.5372080, -0.4986286],
    [-0.9689307, 1.8757561, 0.0415175],
    [0.0557101, -0.2040211, 1.0569959]
]


function getLong(x) {
    return Math.exp(-0.5 * Math.pow((x - 560) / 50, 2));
}

function getMedium(x) {
    return Math.exp(-0.5 * Math.pow((x - 530) / 50, 2));
}

function getShort(x) {
    return Math.exp(-0.5 * Math.pow((x - 430) / 25, 2));
}


function applyMatrix(vector, matrix) {
    const result = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        let sum = 0;
        for (let j = 0; j < 3; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result[i] = sum;
    }
    return result;
}


function gammaCorrect(value) {
    value = Math.max(0, value);
    return value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}


function convertToRgb(vector) {
    const [r, g, b] = vector;
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function drawRainbow(canvas, colors) {
    const context = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = 800;
    canvas.height = canvasHeight;

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);


    let radius = 360
    for (let x = 0; x < colors.length; x++) {
        context.beginPath();
        context.arc(canvasWidth/2, canvasHeight, radius++, Math.PI, 0);
        context.strokeStyle = colors[x];
        context.lineWidth = 2;
        context.stroke();


    }
}

const wavelengths = [];

for(let x = rangeStart; x <= rangeEnd; x ++) {
    wavelengths.push(x);
}

const rgbColors = [];

for (const wavelength of wavelengths) {
    const l = getLong(wavelength);
    const m = getMedium(wavelength);
    const s = getShort(wavelength);

    const [x, y, z] = applyMatrix([l, m, s], lmsToCieXyzMatrix);

    let [r, g, b] = applyMatrix([x, y, z], xyzToLinearRgbMatrix);

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    b = gammaCorrect(b);

    rgbColors.push(convertToRgb([r, g, b]));
}

drawRainbow(canvas, rgbColors);
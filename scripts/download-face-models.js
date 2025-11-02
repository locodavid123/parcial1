const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(process.cwd(), 'public', 'models');

// Asegurarse de que el directorio existe
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const modelFiles = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

function downloadFile(filename) {
    const filePath = path.join(modelsDir, filename);
    const file = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
        https.get(baseUrl + filename, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {}); // Delete the file if there was an error
            reject(err);
        });
    });
}

async function downloadAllModels() {
    console.log('Downloading face-api.js models...');
    try {
        await Promise.all(modelFiles.map(file => downloadFile(file)));
        console.log('All models downloaded successfully!');
    } catch (error) {
        console.error('Error downloading models:', error);
        process.exit(1);
    }
}

downloadAllModels();
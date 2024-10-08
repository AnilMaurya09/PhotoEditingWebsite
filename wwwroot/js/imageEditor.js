// Initialize Fabric.js canvas
var canvas = new fabric.Canvas('photoCanvas');
var currentImage; // Variable to store the current image
var canvasHistory = []; // History stack for undo
var redoStack = []; // Stack for redo actions

// Event listener for file input change
document.getElementById('imageFile').addEventListener('change', function (e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
            canvas.clear();
            currentImage = new fabric.Image(imgObj);
            canvas.add(currentImage);
            canvas.renderAll();
            saveState();
        };
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Function to save the current state to history
function saveState() {
    canvasHistory.push(canvas.toJSON());
    redoStack = [];
}

// Function to apply filters to the image
function applyFilters() {
    if (currentImage) {
        currentImage.filters = [];
        const brightnessValue = parseInt(document.getElementById('brightness').value);
        const contrastValue = parseInt(document.getElementById('contrast').value);
        const saturationValue = parseInt(document.getElementById('saturation').value);

        if (brightnessValue !== 0) {
            currentImage.filters.push(new fabric.Image.filters.Brightness({
                brightness: brightnessValue / 100
            }));
        }

        if (contrastValue !== 0) {
            currentImage.filters.push(new fabric.Image.filters.Contrast({
                contrast: contrastValue / 100
            }));
        }

        if (saturationValue !== 0) {
            currentImage.filters.push(new fabric.Image.filters.Saturation({
                saturation: saturationValue / 100
            }));
        }

        currentImage.applyFilters();
        canvas.renderAll();
    }
}

// Show/Hide Progress Bars
const brightnessProgress = document.getElementById('brightness-progress');
const contrastProgress = document.getElementById('contrast-progress');
const saturationProgress = document.getElementById('saturation-progress');

function hideAllProgressBars() {
    brightnessProgress.style.display = 'none';
    contrastProgress.style.display = 'none';
    saturationProgress.style.display = 'none';
}

// Show the brightness slider
document.getElementById('showBrightness').addEventListener('click', function () {
    hideAllProgressBars();
    brightnessProgress.style.display = 'block'; // Show brightness slider
});

// Show the contrast slider
document.getElementById('showContrast').addEventListener('click', function () {
    hideAllProgressBars();
    contrastProgress.style.display = 'block'; // Show contrast slider
});

// Show the saturation slider
document.getElementById('showSaturation').addEventListener('click', function () {
    hideAllProgressBars();
    saturationProgress.style.display = 'block'; // Show saturation slider
});

// Event listeners for filter sliders
document.getElementById('brightness').addEventListener('input', function () {
    applyFilters();
    saveState();
});

document.getElementById('contrast').addEventListener('input', function () {
    applyFilters();
    saveState();
});

document.getElementById('saturation').addEventListener('input', function () {
    applyFilters();
    saveState();
});

// Event listeners for button clicks that do not show progress bars
document.getElementById('grayscale').addEventListener('click', function () {
    if (currentImage) {
        currentImage.filters.push(new fabric.Image.filters.Grayscale());
        currentImage.applyFilters();
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

document.getElementById('sepia').addEventListener('click', function () {
    if (currentImage) {
        currentImage.filters.push(new fabric.Image.filters.Sepia());
        currentImage.applyFilters();
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

// Add Remini Effect Functionality
document.getElementById('reminiEffect').addEventListener('click', function () {
    if (currentImage) {
        currentImage.filters = [];
        currentImage.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
        currentImage.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.1 }));
        currentImage.applyFilters();
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

// Rotation and Flipping (do not show progress bars)
document.getElementById('rotateLeft').addEventListener('click', function () {
    if (currentImage) {
        currentImage.rotate(currentImage.angle - 90);
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

document.getElementById('rotateRight').addEventListener('click', function () {
    if (currentImage) {
        currentImage.rotate(currentImage.angle + 90);
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

document.getElementById('flipHorizontal').addEventListener('click', function () {
    if (currentImage) {
        currentImage.set('flipX', !currentImage.flipX);
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

document.getElementById('flipVertical').addEventListener('click', function () {
    if (currentImage) {
        currentImage.set('flipY', !currentImage.flipY);
        canvas.renderAll();
        saveState();
        hideAllProgressBars();
    }
});

// Undo function
document.getElementById('undo').addEventListener('click', function () {
    if (canvasHistory.length > 1) {
        redoStack.push(canvasHistory.pop()); // Move current state to redo stack
        const lastState = canvasHistory[canvasHistory.length - 1];
        canvas.loadFromJSON(lastState, function () {
            canvas.renderAll();
            currentImage = canvas.getObjects()[0]; // Update currentImage
        });
    }
});

// Redo function
document.getElementById('redo').addEventListener('click', function () {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        canvasHistory.push(redoState);
        canvas.loadFromJSON(redoState, function () {
            canvas.renderAll();
            currentImage = canvas.getObjects()[0]; // Update currentImage
        });
    }
});

// Event listener for saving the edited image
document.getElementById('saveImage').addEventListener('click', function () {
    var dataURL = canvas.toDataURL();
    fetch('/Image/SaveEdited', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imgBase64: dataURL })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Image saved successfully!');
            } else {
                alert('Error saving the image.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

// Event listener for downloading the edited image
document.getElementById('downloadButton').addEventListener('click', function () {
    const dataURL = canvas.toDataURL('image/png');
    this.href = dataURL;
    this.style.display = 'block';
});

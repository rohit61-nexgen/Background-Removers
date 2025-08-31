document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const originalPreview = document.getElementById('originalPreview');
    const resultPreview = document.getElementById('resultPreview');
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    
    let originalImage = null;
    let processedImage = null;
    
    // API configuration - REPLACE WITH YOUR ACTUAL API KEY
    const API_KEY = 'mVojrZYpfLcfjczp3wYRGk8e';
    const API_URL = 'https://api.remove.bg/v1.0/removebg';
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection(fileInput.files[0]);
        }
    });
    
    // File selection
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelection(fileInput.files[0]);
        }
    });
    
    // Process button click
    processBtn.addEventListener('click', processImage);
    
    // Download button click
    downloadBtn.addEventListener('click', () => {
        if (processedImage) {
            const a = document.createElement('a');
            a.href = processedImage;
            a.download = 'background-removed.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
    
    // Handle file selection
    function handleFileSelection(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.).');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = e.target.result;
            displayImage(originalPreview, originalImage);
            processBtn.disabled = false;
            downloadBtn.disabled = true;
            
            // Reset result preview
            resultPreview.innerHTML = `
                <div class="placeholder-text">
                    <i class="fas fa-sparkles placeholder-icon"></i>
                    <p>Processed image will appear here</p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
    
    // Display image in preview
    function displayImage(previewElement, imageData) {
        previewElement.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageData;
        img.classList.add('img-fluid');
        previewElement.appendChild(img);
    }
    
    // Process image using Remove.bg API
    async function processImage() {
        if (!originalImage) return;
        
        loadingModal.show();
        processBtn.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('image_file', fileInput.files[0]);
            formData.append('size', 'auto');
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-Api-Key': API_KEY
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors ? errorData.errors[0].title : 'API request failed');
            }
            
            const blob = await response.blob();
            processedImage = URL.createObjectURL(blob);
            displayImage(resultPreview, processedImage);
            downloadBtn.disabled = false;
            
            // Add success animation
            resultPreview.querySelector('img').classList.add('animate__animated', 'animate__fadeIn');
        } catch (error) {
            console.error('Error processing image:', error);
            alert(`Error: ${error.message}`);
        } finally {
            loadingModal.hide();
            processBtn.disabled = false;
        }
    }
    
    // Add some dynamic effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'translateY(1px)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = '';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
});
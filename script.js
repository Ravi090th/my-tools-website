// PDF to Text Converter
document.getElementById('pdfFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        showPDFPreview(file);
    } else {
        alert('कृपया PDF फाइल चुनें');
    }
});

function showPDFPreview(file) {
    document.getElementById('fileName').textContent = `फाइल: ${file.name}`;
    document.getElementById('fileSize').textContent = `साइज: ${(file.size / 1024).toFixed(2)} KB`;
    document.getElementById('pdfPreview').style.display = 'block';
    document.getElementById('pdfUploadArea').style.display = 'none';
}

function extractTextFromPDF() {
    const file = document.getElementById('pdfFile').files[0];
    if (!file) {
        alert('कृपया पहले PDF फाइल चुनें');
        return;
    }
    
    // Simulate PDF text extraction (in real implementation, use PDF.js)
    const reader = new FileReader();
    reader.onload = function(e) {
        // This is a simulation - real PDF extraction would use PDF.js library
        const fakeText = `PDF से निकाला गया टेक्स्ट (डेमो)\n\n` +
                        `फाइल नाम: ${file.name}\n` +
                        `साइज: ${(file.size / 1024).toFixed(2)} KB\n\n` +
                        `यह एक डेमो टेक्स्ट है। असल PDF कन्वर्ज़न के लिए PDF.js लाइब्रेरी का उपयोग करें।\n\n` +
                        `PDF.js इंस्टालेशन:\n` +
                        `1. CDN लिंक जोड़ें: <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>\n` +
                        `2. PDF फाइल को ArrayBuffer में कन्वर्ट करें\n` +
                        `3. pdfjsLib.getDocument() का उपयोग करें\n` +
                        `4. प्रत्येक पेज से टेक्स्ट निकालें`;
        
        document.getElementById('extractedText').value = fakeText;
        document.getElementById('textResult').style.display = 'block';
        showNotification('टेक्स्ट सफलतापूर्वक निकाला गया!');
    };
    reader.readAsArrayBuffer(file);
}

// Image Resizer
let originalImage = null;

document.getElementById('imageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        showImagePreview(file);
    } else {
        alert('कृपया इमेज फाइल चुनें (JPG, PNG, GIF)');
    }
});

function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imageDimensions').textContent = 
                `Dimensions: ${img.width} × ${img.height} px`;
            document.getElementById('imageSize').textContent = 
                `Size: ${(file.size / 1024).toFixed(2)} KB`;
            
            // Set slider values
            document.getElementById('widthSlider').value = img.width;
            document.getElementById('widthInput').value = img.width;
            document.getElementById('heightSlider').value = img.height;
            document.getElementById('heightInput').value = img.height;
            
            document.getElementById('imagePreviewContainer').style.display = 'block';
            document.getElementById('imageUploadArea').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Sync sliders and inputs
document.getElementById('widthSlider').addEventListener('input', function() {
    document.getElementById('widthInput').value = this.value;
});

document.getElementById('widthInput').addEventListener('input', function() {
    document.getElementById('widthSlider').value = this.value;
});

document.getElementById('heightSlider').addEventListener('input', function() {
    document.getElementById('heightInput').value = this.value;
});

document.getElementById('heightInput').addEventListener('input', function() {
    document.getElementById('heightSlider').value = this.value;
});

document.getElementById('qualitySlider').addEventListener('input', function() {
    document.getElementById('qualityValue').textContent = this.value + '%';
});

function resizeImage() {
    if (!originalImage) {
        alert('कृपया पहले इमेज अपलोड करें');
        return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const width = parseInt(document.getElementById('widthInput').value);
    const height = parseInt(document.getElementById('heightInput').value);
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(originalImage, 0, 0, width, height);
    
    const resizedDataURL = canvas.toDataURL('image/jpeg', quality);
    document.getElementById('resizedImage').src = resizedDataURL;
    document.getElementById('resizedImageResult').style.display = 'block';
    
    showNotification('इमेज सफलतापूर्वक रीसाइज़ की गई!');
}

function downloadImage() {
    const image = document.getElementById('resizedImage').src;
    const link = document.createElement('a');
    link.href = image;
    link.download = 'resized-image.jpg';
    link.click();
}

// Text Tools
function countText() {
    const text = document.getElementById('textInput').value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const lines = text.split('\n').length;
    const readTime = Math.ceil(words / 200);
    
    document.getElementById('wordCount').textContent = words;
    document.getElementById('charCount').textContent = chars;
    document.getElementById('lineCount').textContent = lines;
    document.getElementById('readTime').textContent = `${readTime} मिनट`;
    
    showNotification('शब्द गिनती पूरी!');
}

function convertCase() {
    const text = document.getElementById('textInput');
    const current = text.value;
    
    if (current === current.toUpperCase()) {
        text.value = current.toLowerCase();
    } else {
        text.value = current.toUpperCase();
    }
    
    showNotification('टेक्स्ट केस बदला गया!');
    countText();
}

function removeSpaces() {
    const text = document.getElementById('textInput');
    text.value = text.value.replace(/\s+/g, ' ').trim();
    showNotification('एक्स्ट्रा स्पेस हटाए गए!');
    countText();
}

function generateLorem() {
    const loremText = `लोरेम इप्सम डोलर सिट अमेत, कॉन्सेक्टेटुर एडिपिसिसिंग एलिट। 
प्रोग्रामिंग सीखना एक रोमांचक यात्रा है। 
यह वेबसाइट बनाना HTML, CSS और JavaScript के साथ शुरू होता है।
आज के डिजिटल युग में वेब डेवलपमेंट एक महत्वपूर्ण स्किल है।
नई टेक्नोलॉजी सीखते रहना सफलता की कुंजी है।`;
    
    document.getElementById('textInput').value = loremText;
    countText();
    showNotification('लोरेम टेक्सट जेनरेट किया गया!');
}

function copyText() {
    const text = document.getElementById('extractedText').value;
    navigator.clipboard.writeText(text);
    showNotification('टेक्स्ट कॉपी किया गया!');
}

function copyAllText() {
    const text = document.getElementById('textInput').value;
    navigator.clipboard.writeText(text);
    showNotification('सारा टेक्स्ट कॉपी किया गया!');
}

function downloadText() {
    const text = document.getElementById('extractedText').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted-text.txt';
    link.click();
}

function saveText() {
    const text = document.getElementById('textInput').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'my-text.txt';
    link.click();
}

function clearText() {
    document.getElementById('textInput').value = '';
    countText();
    showNotification('टेक्स्ट क्लियर किया गया!');
}

// Utility Functions
function showNotification(message) {
    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .dragover {
        border-color: #6C63FF !important;
        background: #f0f4ff !important;
    }
`;
document.head.appendChild(style);

// Drag and drop functionality
['pdfUploadArea', 'imageUploadArea'].forEach(id => {
    const area = document.getElementById(id);
    const fileInput = area.nextElementSibling;
    
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });
    
    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });
    
    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
    
    area.addEventListener('click', () => {
        fileInput.click();
    });
});

// Auto count text on input
document.getElementById('textInput').addEventListener('input', countText);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    countText();
    showNotification('टूल्स वेबसाइट में आपका स्वागत है!');
});

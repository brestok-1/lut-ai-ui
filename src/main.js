import './style.css'

class LUTTransformer {
  constructor() {
    this.selectedFile = null;
    this.resultImage = null;
    this.uploadedFiles = [];
    this.showingUploadedFiles = false;
    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
    this.fetchUploadedFiles();
  }

  createUI() {
    document.querySelector('#app').innerHTML = `
      <div class="header">
        <h1>LUT AI Transformer</h1>
        <p>Transform your color grading with AI-powered prompts</p>
      </div>

      <div class="main-card">
        <div class="upload-section">
          <div class="upload-area" id="upload-area">
            <div class="upload-icon">📁</div>
            <div class="upload-text">Click to upload your .cube LUT file</div>
            <div class="upload-hint">or drag and drop it here</div>
            <input type="file" id="file-input" accept=".cube" />
          </div>
          <div class="file-info" id="file-info">
            <span id="file-name"></span>
          </div>
        </div>

        <button class="btn btn-secondary" id="show-uploaded-btn">
          <span></span>
          Show uploaded files
        </button>

        <div class="uploaded-files-section" id="uploaded-files-section">
          <h3>Previously Uploaded Files</h3>
          <div class="uploaded-files-grid" id="uploaded-files-grid">
          </div>
        </div>

        <div class="prompt-section">
          <label for="prompt-input">Transformation Prompt</label>
          <textarea 
            id="prompt-input" 
            placeholder="Describe how you want to transform your LUT... e.g., 'Make this LUT more cinematic with cool shadows' or 'Add warm highlights and increase contrast'"
          ></textarea>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" id="transform-btn" disabled>
            <span>🎨</span>
            Transform LUT
          </button>
        </div>

        <div class="loading-section" id="loading-section">
          <div class="spinner"></div>
          <div class="loading-text">Transforming your LUT with AI magic...</div>
        </div>

        <div class="error-section" id="error-section">
          <div id="error-message"></div>
        </div>

        <div class="result-section" id="result-section">
          <img class="result-image" id="result-image" alt="LUT Transformation Result" />
          <div class="result-actions">
            <a class="btn btn-success" id="download-btn" download="transformed_preview.png">
              <span>💾</span>
              Download Image
            </a>
            <button class="btn btn-secondary" id="try-again-btn">
              <span>🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const transformBtn = document.getElementById('transform-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const promptInput = document.getElementById('prompt-input');
    const showUploadedBtn = document.getElementById('show-uploaded-btn');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    transformBtn.addEventListener('click', () => this.transformLUT());
    tryAgainBtn.addEventListener('click', () => this.resetForm());
    promptInput.addEventListener('input', () => this.validateForm());
    showUploadedBtn.addEventListener('click', () => this.toggleUploadedFiles());

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
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });
  }

  async fetchUploadedFiles() {
    try {
      const response = await fetch('http://localhost:8000/cube-files');
      if (response.ok) {
        this.uploadedFiles = await response.json();
        this.displayUploadedFiles();
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  }

  displayUploadedFiles() {
    const grid = document.getElementById('uploaded-files-grid');
    const showUploadedBtn = document.getElementById('show-uploaded-btn');
    const uploadedSection = document.getElementById('uploaded-files-section');

    if (this.uploadedFiles.length === 0) {
      showUploadedBtn.style.display = 'none';
      uploadedSection.style.display = 'none';
      return;
    }

    showUploadedBtn.style.display = 'block';

    if (this.showingUploadedFiles) {
      uploadedSection.style.display = 'block';
      
      grid.innerHTML = this.uploadedFiles.map(file => `
        <div class="uploaded-file-item" data-file-id="${file.file_id}">
          <div class="file-icon">📄</div>
          <div class="file-details">
            <div class="file-name">${file.file_name}</div>
            <div class="upload-date">${new Date(file.upload_date).toLocaleDateString()}</div>
          </div>
          <button class="btn btn-small btn-primary select-file-btn" data-file-id="${file.file_id}" data-file-name="${file.file_name}">
            Select
          </button>
        </div>
      `).join('');

      grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('select-file-btn')) {
          const fileId = e.target.dataset.fileId;
          const fileName = e.target.dataset.fileName;
          this.selectUploadedFile(fileId, fileName);
        }
      });
    } else {
      uploadedSection.style.display = 'none';
    }
  }

  toggleUploadedFiles() {
    this.showingUploadedFiles = !this.showingUploadedFiles;
    const showUploadedBtn = document.getElementById('show-uploaded-btn');
    
    if (this.showingUploadedFiles) {
      showUploadedBtn.innerHTML = '<span></span> Hide uploaded files';
    } else {
      showUploadedBtn.innerHTML = '<span></span> Show uploaded files';
    }
    
    this.displayUploadedFiles();
  }

  selectUploadedFile(fileId, fileName) {
    this.selectedFileId = fileId;
    this.selectedFile = { name: fileName };
    
    const fileInfo = document.getElementById('file-info');
    const fileNameElement = document.getElementById('file-name');
    
    fileNameElement.textContent = `Selected: ${fileName} (from uploaded files)`;
    fileInfo.style.display = 'block';
    
    this.validateForm();
    this.hideError();
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.cube')) {
      this.showError('Please select a .cube file');
      return;
    }

    this.selectedFile = file;
    this.selectedFileId = null;
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    
    fileName.textContent = `Selected: ${file.name} (${this.formatFileSize(file.size)})`;
    fileInfo.style.display = 'block';
    
    this.validateForm();
    this.hideError();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateForm() {
    const transformBtn = document.getElementById('transform-btn');
    const promptInput = document.getElementById('prompt-input');
    
    const isValid = (this.selectedFile || this.selectedFileId) && promptInput.value.trim().length > 0;
    transformBtn.disabled = !isValid;
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  async uploadCubeFile() {
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const response = await fetch('http://localhost:8000/upload-cube', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }

  async transformLUT() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
      this.showError('Please enter a transformation prompt');
      return;
    }

    if (!this.selectedFile && !this.selectedFileId) {
      this.showError('Please select a .cube file');
      return;
    }

    try {
      this.showLoading();
      this.hideError();

      let fileId = this.selectedFileId;

      if (!fileId && this.selectedFile) {
        const uploadResponse = await this.uploadCubeFile();
        fileId = uploadResponse.file_id;
        this.fetchUploadedFiles();
      }

      const response = await fetch('http://localhost:8000/transform-lut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          user_prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.showResult(data.split_preview_base64);
      } else {
        throw new Error(data.message || 'Transformation failed');
      }

    } catch (error) {
      console.error('Error transforming LUT:', error);
      this.showError(`Failed to transform LUT: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    document.getElementById('loading-section').style.display = 'block';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('transform-btn').disabled = true;
  }

  hideLoading() {
    document.getElementById('loading-section').style.display = 'none';
    document.getElementById('transform-btn').disabled = false;
    this.validateForm();
  }

  showResult(base64Image) {
    const resultSection = document.getElementById('result-section');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');

    this.resultImage = `data:image/png;base64,${base64Image}`;
    resultImage.src = this.resultImage;
    downloadBtn.href = this.resultImage;

    resultSection.style.display = 'block';
  }

  showError(message) {
    const errorSection = document.getElementById('error-section');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
  }

  hideError() {
    document.getElementById('error-section').style.display = 'none';
  }

  resetForm() {
    this.selectedFile = null;
    this.selectedFileId = null;
    this.resultImage = null;
    
    document.getElementById('file-input').value = '';
    document.getElementById('prompt-input').value = '';
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('loading-section').style.display = 'none';
    
    this.showingUploadedFiles = false;
    const showUploadedBtn = document.getElementById('show-uploaded-btn');
    showUploadedBtn.innerHTML = '<span></span> Show uploaded files';
    this.displayUploadedFiles();
    
    this.hideError();
    this.validateForm();
  }
}

new LUTTransformer();

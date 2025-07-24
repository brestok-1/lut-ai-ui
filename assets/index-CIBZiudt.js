(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function s(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(t){if(t.ep)return;t.ep=!0;const o=s(t);fetch(t.href,o)}})();class r{constructor(){this.selectedFile=null,this.resultImage=null,this.uploadedFiles=[],this.showingUploadedFiles=!1,this.apiBaseUrl="http://localhost:8000",this.init()}init(){this.createUI(),this.bindEvents(),this.fetchUploadedFiles()}createUI(){document.querySelector("#app").innerHTML=`
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
    `}bindEvents(){const e=document.getElementById("upload-area"),s=document.getElementById("file-input"),i=document.getElementById("transform-btn"),t=document.getElementById("try-again-btn"),o=document.getElementById("prompt-input"),n=document.getElementById("show-uploaded-btn");e.addEventListener("click",()=>s.click()),s.addEventListener("change",l=>this.handleFileSelect(l)),i.addEventListener("click",()=>this.transformLUT()),t.addEventListener("click",()=>this.resetForm()),o.addEventListener("input",()=>this.validateForm()),n.addEventListener("click",()=>this.toggleUploadedFiles()),e.addEventListener("dragover",l=>{l.preventDefault(),e.classList.add("dragover")}),e.addEventListener("dragleave",()=>{e.classList.remove("dragover")}),e.addEventListener("drop",l=>{l.preventDefault(),e.classList.remove("dragover");const d=l.dataTransfer.files;d.length>0&&this.handleFile(d[0])})}async fetchUploadedFiles(){try{const e=await fetch(`${this.apiBaseUrl}/cube-files`);e.ok&&(this.uploadedFiles=await e.json(),this.displayUploadedFiles())}catch(e){console.error("Error fetching uploaded files:",e)}}displayUploadedFiles(){const e=document.getElementById("uploaded-files-grid"),s=document.getElementById("show-uploaded-btn"),i=document.getElementById("uploaded-files-section");if(this.uploadedFiles.length===0){s.style.display="none",i.style.display="none";return}s.style.display="block",this.showingUploadedFiles?(i.style.display="block",e.innerHTML=this.uploadedFiles.map(t=>`
        <div class="uploaded-file-item" data-file-id="${t.file_id}">
          <div class="file-icon">📄</div>
          <div class="file-details">
            <div class="file-name">${t.file_name}</div>
            <div class="upload-date">${new Date(t.upload_date).toLocaleDateString()}</div>
          </div>
          <button class="btn btn-small btn-primary select-file-btn" data-file-id="${t.file_id}" data-file-name="${t.file_name}">
            Select
          </button>
        </div>
      `).join(""),e.addEventListener("click",t=>{if(t.target.classList.contains("select-file-btn")){const o=t.target.dataset.fileId,n=t.target.dataset.fileName;this.selectUploadedFile(o,n)}})):i.style.display="none"}toggleUploadedFiles(){this.showingUploadedFiles=!this.showingUploadedFiles;const e=document.getElementById("show-uploaded-btn");this.showingUploadedFiles?e.innerHTML="<span></span> Hide uploaded files":e.innerHTML="<span></span> Show uploaded files",this.displayUploadedFiles()}selectUploadedFile(e,s){this.selectedFileId=e,this.selectedFile={name:s};const i=document.getElementById("file-info"),t=document.getElementById("file-name");t.textContent=`Selected: ${s} (from uploaded files)`,i.style.display="block",this.validateForm(),this.hideError()}handleFileSelect(e){const s=e.target.files[0];s&&this.handleFile(s)}handleFile(e){if(!e.name.toLowerCase().endsWith(".cube")){this.showError("Please select a .cube file");return}this.selectedFile=e,this.selectedFileId=null;const s=document.getElementById("file-info"),i=document.getElementById("file-name");i.textContent=`Selected: ${e.name} (${this.formatFileSize(e.size)})`,s.style.display="block",this.validateForm(),this.hideError()}formatFileSize(e){if(e===0)return"0 Bytes";const s=1024,i=["Bytes","KB","MB"],t=Math.floor(Math.log(e)/Math.log(s));return parseFloat((e/Math.pow(s,t)).toFixed(2))+" "+i[t]}validateForm(){const e=document.getElementById("transform-btn"),s=document.getElementById("prompt-input"),i=(this.selectedFile||this.selectedFileId)&&s.value.trim().length>0;e.disabled=!i}async fileToBase64(e){return new Promise((s,i)=>{const t=new FileReader;t.readAsDataURL(e),t.onload=()=>{const o=t.result.split(",")[1];s(o)},t.onerror=o=>i(o)})}async uploadCubeFile(){const e=new FormData;e.append("file",this.selectedFile);const s=await fetch(`${this.apiBaseUrl}/upload-cube`,{method:"POST",body:e});if(!s.ok)throw new Error(`Upload failed! status: ${s.status}`);return await s.json()}async transformLUT(){const s=document.getElementById("prompt-input").value.trim();if(!s){this.showError("Please enter a transformation prompt");return}if(!this.selectedFile&&!this.selectedFileId){this.showError("Please select a .cube file");return}try{this.showLoading(),this.hideError();let i=this.selectedFileId;!i&&this.selectedFile&&(i=(await this.uploadCubeFile()).file_id,this.fetchUploadedFiles());const t=await fetch(`${this.apiBaseUrl}/transform-lut`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_id:i,user_prompt:s})});if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const o=await t.json();if(o.success)this.showResult(o.split_preview_base64);else throw new Error(o.message||"Transformation failed")}catch(i){console.error("Error transforming LUT:",i),this.showError(`Failed to transform LUT: ${i.message}`)}finally{this.hideLoading()}}showLoading(){document.getElementById("loading-section").style.display="block",document.getElementById("result-section").style.display="none",document.getElementById("transform-btn").disabled=!0}hideLoading(){document.getElementById("loading-section").style.display="none",document.getElementById("transform-btn").disabled=!1,this.validateForm()}showResult(e){const s=document.getElementById("result-section"),i=document.getElementById("result-image"),t=document.getElementById("download-btn");this.resultImage=`data:image/png;base64,${e}`,i.src=this.resultImage,t.href=this.resultImage,s.style.display="block"}showError(e){const s=document.getElementById("error-section"),i=document.getElementById("error-message");i.textContent=e,s.style.display="block"}hideError(){document.getElementById("error-section").style.display="none"}resetForm(){this.selectedFile=null,this.selectedFileId=null,this.resultImage=null,document.getElementById("file-input").value="",document.getElementById("prompt-input").value="",document.getElementById("file-info").style.display="none",document.getElementById("result-section").style.display="none",document.getElementById("loading-section").style.display="none",this.showingUploadedFiles=!1;const e=document.getElementById("show-uploaded-btn");e.innerHTML="<span></span> Show uploaded files",this.displayUploadedFiles(),this.hideError(),this.validateForm()}}new r;

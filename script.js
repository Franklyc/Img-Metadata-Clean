// 主题切换
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // 文件上传逻辑
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const selectFilesBtn = document.getElementById('select-files');
    const processFilesBtn = document.getElementById('process-files');
    const fileList = document.getElementById('file-list');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const alertsContainer = document.getElementById('alerts');

    let files = [];

    // 选择文件按钮点击事件
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件输入变化事件
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 拖放区域事件
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
        handleFiles(e.dataTransfer.files);
    });

    // 点击上传区域事件
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 处理文件
    function handleFiles(newFiles) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.webp'];
        
        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (validExtensions.includes(extension)) {
                // 检查是否已存在同名文件
                if (!files.some(f => f.name === file.name)) {
                    files.push(file);
                }
            }
        }
        
        updateFileList();
    }

    // 更新文件列表显示
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (files.length === 0) {
            processFilesBtn.disabled = true;
            return;
        }
        
        processFilesBtn.disabled = false;
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileIcon = document.createElement('div');
            fileIcon.className = 'file-icon';
            
            // 根据不同类型显示不同图标
            if (file.type === 'image/png') {
                fileIcon.innerHTML = '<i class="fas fa-file-image" style="color: #4f46e5;"></i>';
            } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                fileIcon.innerHTML = '<i class="fas fa-file-image" style="color: #f59e0b;"></i>';
            } else if (file.type === 'image/bmp') {
                fileIcon.innerHTML = '<i class="fas fa-file-image" style="color: #10b981;"></i>';
            } else if (file.type === 'image/webp') {
                fileIcon.innerHTML = '<i class="fas fa-file-image" style="color: #ec4899;"></i>';
            } else {
                fileIcon.innerHTML = '<i class="fas fa-file-image"></i>';
            }
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('div');
            fileSize.className = 'file-size';
            fileSize.textContent = formatFileSize(file.size);
            
            const fileRemove = document.createElement('div');
            fileRemove.className = 'file-remove';
            fileRemove.innerHTML = '<i class="fas fa-times"></i>';
            fileRemove.addEventListener('click', () => {
                files.splice(index, 1);
                updateFileList();
            });
            
            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileSize);
            fileItem.appendChild(fileRemove);
            
            fileList.appendChild(fileItem);
        });
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 显示提示信息
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} fade-in`;
        
        const icon = document.createElement('div');
        icon.className = 'alert-icon';
        icon.innerHTML = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
        
        const text = document.createElement('div');
        text.textContent = message;
        
        alert.appendChild(icon);
        alert.appendChild(text);
        
        alertsContainer.appendChild(alert);
        
        // 5秒后自动消失
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    }

    // 检查元数据是否已清除
    async function verifyMetadataRemoval(blob) {
        if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
            const buffer = await readFileAsArrayBuffer(blob);
            try {
                const exifData = piexif.load(buffer);
                return Object.keys(exifData).length === 0;
            } catch {
                return true;
            }
        }
        return true;
    }

    // 读取文件为ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // 处理JPEG文件(无损方式)
    async function processJpegWithoutReencoding(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const cleaned = piexif.remove(e.target.result);
                    const blob = new Blob([cleaned], {type: 'image/jpeg'});
                    resolve(blob);
                } catch (error) {
                    console.warn("Piexif处理失败，降级使用Canvas:", error);
                    processViaCanvas(file).then(resolve);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 通过Canvas处理图像(高质量重编码)
    async function processViaCanvas(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // 根据不同类型选择质量参数
                let quality = 0.92; // 默认高质量
                let mimeType = file.type;
                
                if (file.type === 'image/png' || file.type === 'image/bmp') {
                    quality = 1; // 无损
                }
                
                canvas.toBlob((blob) => {
                    resolve(blob || file); // 失败时返回原始文件
                }, mimeType, quality);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    // 智能处理图像(自动选择最佳方法)
    async function processImage(file) {
        try {
            // 对于JPEG优先使用无损方法
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                const cleanedBlob = await processJpegWithoutReencoding(file);
                const isClean = await verifyMetadataRemoval(cleanedBlob);
                if (isClean) return cleanedBlob;
                
                // 如果验证失败，使用Canvas方法
                return await processViaCanvas(file);
            }
            
            // PNG/BMP使用Canvas无损处理
            if (file.type === 'image/png' || file.type === 'image/bmp') {
                return await processViaCanvas(file);
            }
            
            // 其他格式使用Canvas高质量处理
            return await processViaCanvas(file);
        } catch (error) {
            console.error("图像处理失败:", error);
            return file; // 返回原始文件作为fallback
        }
    }

    // 处理文件按钮点击事件
    processFilesBtn.addEventListener('click', async () => {
        if (files.length === 0) {
            showAlert('请先选择要处理的图片文件', 'error');
            return;
        }
        
        progressContainer.style.display = 'block';
        processFilesBtn.disabled = true;
        
        try {
            const zipDownloadToggle = document.getElementById('zip-download-toggle');
            const useZip = zipDownloadToggle.checked;
            const zip = new JSZip();
            let processedCount = 0;
            const totalFiles = files.length;
            const processedFiles = [];
            
            for (const file of files) {
                try {
                    // 处理单个文件
                    const cleanBlob = await processImage(file);
                    
                    const extension = file.name.split('.').pop().toLowerCase();
                    const newName = file.name.replace(new RegExp(`.${extension}$`, 'i'), `_cleaned.${extension}`);
                    
                    // 如果选择了ZIP下载，添加到ZIP，否则存储处理后的文件
                    if (useZip) {
                        const arrayBuffer = await readFileAsArrayBuffer(cleanBlob);
                        zip.file(newName, arrayBuffer);
                    } else {
                        processedFiles.push({
                            blob: cleanBlob,
                            name: newName
                        });
                    }
                    
                    // 更新进度
                    processedCount++;
                    const progress = Math.round((processedCount / totalFiles) * 100);
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `处理中... (${processedCount}/${totalFiles})`;
                } catch (error) {
                    console.error(`处理 ${file.name} 失败:`, error);
                }
            }
            
            if (useZip) {
                // 生成ZIP文件
                progressText.textContent = '正在生成ZIP文件...';
                const zipContent = await zip.generateAsync({ type: 'blob' });
                
                // 下载ZIP
                saveAs(zipContent, 'cleaned_images.zip');
                showAlert('图片处理成功！ZIP下载已开始', 'success');
            } else {
                // 分别下载每个文件
                progressText.textContent = '正在下载处理后的文件...';
                
                // 间隔下载文件，避免浏览器同时触发太多下载
                for (let i = 0; i < processedFiles.length; i++) {
                    const file = processedFiles[i];
                    setTimeout(() => {
                        saveAs(file.blob, file.name);
                    }, i * 300); // 每个文件间隔300ms下载
                }
                
                showAlert(`图片处理成功！${processedFiles.length}个文件将分别下载`, 'success');
            }
            
            // 重置UI
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
                progressText.textContent = '处理中...';
                files = [];
                updateFileList();
            }, 1000);
            
        } catch (error) {
            console.error('处理失败:', error);
            showAlert('图片处理失败，请重试', 'error');
            progressContainer.style.display = 'none';
            processFilesBtn.disabled = false;
        }
    });
});

// 主题切换 (no changes needed here)
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
    const reportContainer = document.getElementById('report-container'); // Get report container

    let files = [];

    // 选择文件按钮点击事件
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件输入变化事件
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        // Clear report when new files are selected
        if (reportContainer) reportContainer.style.display = 'none';
        if (alertsContainer) alertsContainer.innerHTML = ''; // Clear alerts too
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
        // Clear report when new files are dropped
        if (reportContainer) reportContainer.style.display = 'none';
        if (alertsContainer) alertsContainer.innerHTML = ''; // Clear alerts too
    });

    // 点击上传区域事件
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 处理文件
    function handleFiles(newFiles) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.webp'];
        let addedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            if (validExtensions.includes(extension)) {
                // 检查是否已存在同名文件
                if (!files.some(f => f.name === file.name && f.size === file.size)) { // Check size too for better uniqueness
                    files.push(file);
                    addedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                skippedCount++;
                console.warn(`Skipped invalid file type: ${file.name}`);
            }
        }

        if (skippedCount > 0) {
            showAlert(`${skippedCount}个文件因格式不受支持或重复而被跳过。`, 'warning');
        }
        if (addedCount > 0) {
            // Optionally show success message for added files
            // showAlert(`${addedCount}个有效文件已添加。`, 'success');
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
                fileIcon.innerHTML = '<i class="fas fa-file-alt"></i>'; // Generic file icon
            }

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileName.title = file.name; // Add title for long names

            const fileSize = document.createElement('div');
            fileSize.className = 'file-size';
            fileSize.textContent = formatFileSize(file.size);

            const fileRemove = document.createElement('div');
            fileRemove.className = 'file-remove';
            fileRemove.innerHTML = '<i class="fas fa-times"></i>';
            fileRemove.title = '移除文件';
            fileRemove.addEventListener('click', () => {
                files.splice(index, 1);
                updateFileList();
                // Clear report when file list changes
                if (reportContainer) reportContainer.style.display = 'none';
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
        // Clear previous alerts of the same type to avoid spamming
        const existingAlerts = alertsContainer.querySelectorAll(`.alert-${type}`);
        existingAlerts.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} fade-in`;

        const icon = document.createElement('div');
        icon.className = 'alert-icon';
        icon.innerHTML = type === 'success' ? '<i class="fas fa-check-circle"></i>' :
            type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
                type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' :
                    '<i class="fas fa-info-circle"></i>';

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

    // 读取文件为ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // 检查元数据是否已清除 (主要用于 JPEG 验证)
    async function verifyMetadataRemoval(blob) {
        if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
            const buffer = await readFileAsArrayBuffer(blob);
            try {
                const exifData = piexif.load(buffer);
                // Check if any standard EXIF IFDs exist and have data
                const hasExif = Object.keys(exifData).some(key =>
                    ["0th", "Exif", "GPS", "1st", "Interop"].includes(key) && Object.keys(exifData[key]).length > 0
                );
                return !hasExif; // Return true if NO EXIF found
            } catch (e) {
                // If piexif.load fails, it likely means no valid EXIF structure exists
                console.log("Piexif load failed during verification, assuming clean:", e);
                return true;
            }
        }
        // For other types, assume Canvas stripping worked
        return true;
    }


    // 处理JPEG文件(无损方式)，返回 { blob, report }
    async function processJpegWithoutReencoding(file) {
        return new Promise(async (resolve, reject) => { // Make outer function async
            const reader = new FileReader();
            reader.onload = async function (e) { // Make onload async
                const arrayBuffer = e.target.result;
                let report = {
                    fileName: file.name,
                    originalType: file.type,
                    method: 'Piexif (无损)',
                    foundExif: false,
                    status: 'success'
                };
                try {
                    // Check for EXIF before removing
                    const exifData = piexif.load(arrayBuffer);
                    if (Object.keys(exifData).some(key => ["0th", "Exif", "GPS", "1st", "Interop"].includes(key) && Object.keys(exifData[key]).length > 0)) {
                        report.foundExif = true;
                    }

                    const cleaned = piexif.remove(arrayBuffer);
                    const blob = new Blob([cleaned], { type: 'image/jpeg' });

                    // Verification step (optional but recommended)
                    const isClean = await verifyMetadataRemoval(blob);
                    if (!isClean) {
                        console.warn(`Piexif verification failed for ${file.name}. Metadata might remain.`);
                        report.status = 'warning'; // Indicate potential issue
                        report.errorMessage = 'Verification failed, some metadata might remain.';
                    }

                    resolve({ blob, report });
                } catch (error) {
                    console.warn(`Piexif processing failed for ${file.name}, falling back to Canvas:`, error);
                    // If piexif fails, resolve using canvas method, updating the report
                    try {
                        const canvasResult = await processViaCanvas(file);
                        canvasResult.report.status = 'fallback'; // Indicate fallback
                        canvasResult.report.method = 'Canvas (Piexif失败回退)';
                        resolve(canvasResult);
                    } catch (canvasError) {
                        console.error(`Canvas fallback failed for ${file.name}:`, canvasError);
                        report.status = 'error';
                        report.method = '失败';
                        report.errorMessage = `Piexif and Canvas failed: ${error.message || error}, ${canvasError.message || canvasError}`;
                        resolve({ blob: file, report }); // Resolve with original file and error report
                    }
                }
            };
            reader.onerror = (err) => {
                console.error(`File reading error for ${file.name}:`, err);
                const report = {
                    fileName: file.name, originalType: file.type, method: '读取失败', foundExif: 'N/A', status: 'error', errorMessage: '无法读取文件'
                };
                resolve({ blob: file, report }); // Resolve with original file and error report
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 通过Canvas处理图像(高质量重编码)，返回 { blob, report }
    async function processViaCanvas(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            let report = {
                fileName: file.name,
                originalType: file.type,
                method: 'Canvas (重编码)',
                foundExif: 'N/A', // Canvas method doesn't specifically check EXIF first
                status: 'success'
            };
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth; // Use naturalWidth/Height for accuracy
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(img.src); // Clean up object URL

                let quality = 0.92; // Default high quality for lossy formats
                let mimeType = file.type;

                if (file.type === 'image/png' || file.type === 'image/bmp') {
                    quality = 1; // Lossless for PNG/BMP
                    report.method = 'Canvas (无损)';
                    // Note: BMP might default to PNG output from canvas.toBlob depending on browser
                    // Specify BMP if needed, but PNG is generally preferred.
                    // mimeType = 'image/png'; // Force PNG for BMP for better compatibility?
                } else if (file.type === 'image/webp') {
                    // Quality setting for webp might vary, 0.92 is a reasonable default
                    report.method = 'Canvas (重编码)';
                } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    report.method = 'Canvas (重编码)'; // Explicitly state re-encoding if canvas is used for JPEG
                }

                try {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({ blob, report });
                        } else {
                            console.error(`Canvas toBlob returned null for ${file.name}`);
                            report.status = 'error';
                            report.errorMessage = 'Canvas toBlob failed (returned null).';
                            resolve({ blob: file, report }); // Return original file on failure
                        }
                    }, mimeType, quality);
                } catch (e) {
                    console.error(`Canvas toBlob error for ${file.name}:`, e);
                    report.status = 'error';
                    report.errorMessage = `Canvas toBlob error: ${e.message}`;
                    resolve({ blob: file, report }); // Return original file on failure
                }
            };
            img.onerror = function () {
                console.error(`Failed to load image ${file.name} into Image object.`);
                URL.revokeObjectURL(img.src); // Clean up object URL
                report.status = 'error';
                report.method = '加载失败';
                report.errorMessage = '无法加载图片进行处理。';
                resolve({ blob: file, report }); // Resolve with original file and error report
            };
            img.src = URL.createObjectURL(file);
        });
    }

    // 智能处理图像(自动选择最佳方法)，返回 { blob, report }
    async function processImage(file) {
        let result;
        let defaultErrorReport = {
            fileName: file.name, originalType: file.type, method: '未知错误', foundExif: 'N/A', status: 'error', errorMessage: 'An unknown error occurred during processing.'
        };

        try {
            // For JPEG优先使用无损方法
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                result = await processJpegWithoutReencoding(file);
            }
            // PNG/BMP/WEBP 使用 Canvas 处理
            else if (['image/png', 'image/bmp', 'image/webp'].includes(file.type)) {
                result = await processViaCanvas(file);
            }
            // Fallback for other potential image types (though UI limits them)
            else {
                console.warn(`Unsupported file type ${file.type} for direct processing, attempting Canvas fallback.`);
                result = await processViaCanvas(file);
                if (result.report) result.report.method = `Canvas (回退处理 ${file.type})`;
                else result = { blob: file, report: { ...defaultErrorReport, method: `Canvas (回退处理 ${file.type})`, errorMessage: 'Fallback processing failed.' } }; // Ensure report exists
            }
            return result; // Should contain { blob, report }
        } catch (error) {
            console.error(`图像处理失败 for ${file.name}:`, error);
            // If error object contains a report (e.g., from reject in processViaCanvas), use it
            if (error && error.report) {
                return { blob: error.blob || file, report: error.report }; // Return blob from error if available
            } else {
                // Update default report with error status
                defaultErrorReport.errorMessage = error.message || 'Unknown processing error';
                return { blob: file, report: defaultErrorReport }; // Return original file and the error report
            }
        }
    }

    // 新函数：显示处理报告
    function displayProcessingReport(reports) {
        if (!reportContainer) return; // Exit if container doesn't exist

        reportContainer.innerHTML = ''; // Clear previous report

        if (!reports || reports.length === 0) {
            reportContainer.innerHTML = '<p>没有处理报告可显示。</p>';
            reportContainer.style.display = 'block';
            return;
        }

        const reportTitle = document.createElement('h3');
        reportTitle.textContent = '处理报告';
        reportTitle.className = 'report-title';
        reportContainer.appendChild(reportTitle);

        const reportList = document.createElement('ul');
        reportList.className = 'report-list';

        reports.forEach(report => {
            const listItem = document.createElement('li');
            listItem.className = 'report-item';

            let statusIconClass = '';
            let statusText = '';
            let statusColorClass = ''; // For potential text coloring

            switch (report.status) {
                case 'success':
                    statusIconClass = 'fas fa-check-circle';
                    statusText = '成功';
                    break;
                case 'warning':
                    statusIconClass = 'fas fa-exclamation-triangle';
                    statusText = '成功 (有警告)';
                    break;
                case 'fallback':
                    statusIconClass = 'fas fa-sync-alt';
                    statusText = '成功 (回退方法)';
                    break;
                case 'error':
                    statusIconClass = 'fas fa-times-circle';
                    statusText = '失败';
                    break;
                default:
                    statusIconClass = 'fas fa-question-circle';
                    statusText = '未知状态';
            }

            const iconElement = document.createElement('i');
            iconElement.className = statusIconClass; // Class applies color via CSS

            const detailsSpan = document.createElement('span');
            let details = `文件: <strong>${report.fileName}</strong> | 类型: ${report.originalType} | 方法: ${report.method} | 状态: ${statusText}`;
            if (report.method.toLowerCase().includes('piexif')) {
                details += ` | EXIF检测: ${report.foundExif ? '是' : '否'}`;
            } else if (report.method.toLowerCase().includes('canvas')) {
                details += ` | EXIF检测: N/A (Canvas处理)`;
            }
            if (report.errorMessage) {
                details += ` | 详情: ${report.errorMessage}`;
            }

            detailsSpan.innerHTML = details;

            listItem.appendChild(iconElement);
            listItem.appendChild(detailsSpan);
            reportList.appendChild(listItem);
        });

        reportContainer.appendChild(reportList);
        reportContainer.style.display = 'block'; // Make sure it's visible
    }


    // 处理文件按钮点击事件
    processFilesBtn.addEventListener('click', async () => {
        if (files.length === 0) {
            showAlert('请先选择要处理的图片文件', 'error');
            return;
        }

        progressContainer.style.display = 'block';
        processFilesBtn.disabled = true;
        selectFilesBtn.disabled = true; // Disable select button during processing
        if (reportContainer) reportContainer.style.display = 'none'; // Hide old report
        alertsContainer.innerHTML = ''; // Clear previous alerts

        const processingResults = []; // Store { blob, name, report }
        let processedCount = 0;
        const totalFiles = files.length;

        try {
            const zipDownloadToggle = document.getElementById('zip-download-toggle');
            const useZip = zipDownloadToggle.checked;

            for (const file of files) {
                progressText.textContent = `处理中 ${processedCount + 1}/${totalFiles}: ${file.name}...`;
                try {
                    // 处理单个文件
                    const result = await processImage(file); // result = { blob, report }

                    const extension = file.name.split('.').pop()?.toLowerCase() || 'cleaned'; // Safer extension extraction
                    const baseName = file.name.substring(0, file.name.length - (extension.length + 1));
                    const newName = `${baseName}_cleaned.${extension}`;

                    processingResults.push({
                        blob: result.blob,
                        name: newName,
                        report: result.report // Store the report object
                    });

                } catch (error) { // Catch errors from processImage if it somehow throws instead of resolving with error report
                    console.error(`处理 ${file.name} 时发生意外错误:`, error);
                    processingResults.push({
                        blob: file, // Original file
                        name: file.name + '_failed',
                        report: {
                            fileName: file.name,
                            originalType: file.type,
                            method: 'N/A',
                            foundExif: 'N/A',
                            status: 'error',
                            errorMessage: error.message || 'Unhandled processing error'
                        }
                    });
                } finally {
                    // 更新进度 in finally block to ensure it always updates
                    processedCount++;
                    const progress = Math.round((processedCount / totalFiles) * 100);
                    progressFill.style.width = `${progress}%`;
                    // Update text only after processing the file
                    progressText.textContent = `处理中... (${processedCount}/${totalFiles})`;
                }
            }

            // Display the report AFTER the loop finishes
            displayProcessingReport(processingResults.map(r => r.report));

            // Filter successful results for download
            const successfulResults = processingResults.filter(r => r.report.status !== 'error');
            const failedCount = totalFiles - successfulResults.length;

            if (failedCount > 0) {
                showAlert(`${failedCount}个文件处理失败。请查看下面的报告了解详情。`, 'error');
            }

            if (successfulResults.length === 0) {
                showAlert('没有成功处理的文件可供下载。', 'warning');
                progressText.textContent = '处理完成，无文件可下载';
            } else {
                if (useZip) {
                    // 生成ZIP文件
                    progressText.textContent = '正在生成ZIP文件...';
                    const zip = new JSZip();
                    for (const result of successfulResults) {
                        // No need to read buffer again if blob exists
                        zip.file(result.name, result.blob);
                    }
                    const zipContent = await zip.generateAsync({ type: 'blob' }, (metadata) => {
                        // Update progress during zipping (optional)
                        progressText.textContent = `正在压缩... ${metadata.percent.toFixed(0)}%`;
                    });

                    // 下载ZIP
                    saveAs(zipContent, 'cleaned_images.zip');
                    showAlert(`成功处理 ${successfulResults.length} 个文件！ZIP下载已开始。`, 'success');
                    progressText.textContent = 'ZIP文件已生成';
                } else {
                    // 分别下载每个文件
                    progressText.textContent = '正在准备下载处理后的文件...';
                    showAlert(`成功处理 ${successfulResults.length} 个文件！将分别下载。`, 'success');

                    // Interval download using a helper function for clarity
                    function downloadSequentially(items, delay) {
                        items.forEach((item, index) => {
                            setTimeout(() => {
                                saveAs(item.blob, item.name);
                                progressText.textContent = `正在下载 ${index + 1}/${items.length}...`;
                                if (index === items.length - 1) {
                                    progressText.textContent = '所有文件下载已启动';
                                }
                            }, index * delay);
                        });
                    }
                    downloadSequentially(successfulResults, 300); // 300ms delay
                }
            }

            // Reset UI slightly later to allow users to see final progress/report
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
                progressText.textContent = '处理中...';
                files = []; // Clear the file list model
                updateFileList(); // Update the UI file list
                processFilesBtn.disabled = true; // Keep disabled until new files are added
                selectFilesBtn.disabled = false; // Re-enable select button
            }, 2000); // Keep progress visible for 2 seconds after completion/download start

        } catch (error) {
            console.error('处理过程中发生严重错误:', error);
            showAlert('处理过程中发生严重错误，请刷新页面重试', 'error');
            progressContainer.style.display = 'none';
            processFilesBtn.disabled = false; // Re-enable on error
            selectFilesBtn.disabled = false;
            // Display any reports collected so far
            if (processingResults.length > 0) {
                displayProcessingReport(processingResults.map(r => r.report));
            }
        }
    });
});

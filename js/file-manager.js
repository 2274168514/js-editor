/**
 * 文件管理器模块
 * 处理新建文件和删除文件功能
 * 独立于 file-explorer.js，避免冲突
 */

class FileManager {
    constructor(editor) {
        this.editor = editor;
        this.selectedFile = null;
        this.currentFolder = 'html';
        this.init();
    }

    /**
     * 初始化文件管理器
     */
    init() {
        this.setupEventListeners();
        console.log('FileManager: 初始化完成');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 使用事件委托覆盖原有的事件监听器
        // 阻止事件冒泡并阻止默认行为
        setTimeout(() => {
            // 新建文件按钮事件 - 覆盖原有事件
            const newFileBtn = document.getElementById('newFileBtn');
            if (newFileBtn) {
                // 移除现有的事件监听器
                const newClone = newFileBtn.cloneNode(true);
                newFileBtn.parentNode.replaceChild(newClone, newFileBtn);

                // 添加新的事件监听器
                newClone.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showNewFileDialog();
                });
            }

            // 删除文件按钮事件 - 覆盖原有事件
            const deleteFileBtn = document.getElementById('deleteFileBtn');
            if (deleteFileBtn) {
                // 移除现有的事件监听器
                const deleteClone = deleteFileBtn.cloneNode(true);
                deleteFileBtn.parentNode.replaceChild(deleteClone, deleteFileBtn);

                // 添加新的事件监听器
                deleteClone.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.deleteSelectedFile();
                });
            }
        }, 100); // 延迟执行，确保DOM完全加载

        // 文件对话框事件
        const fileDialogCancel = document.getElementById('fileDialogCancel');
        if (fileDialogCancel) {
            fileDialogCancel.addEventListener('click', () => {
                this.hideFileDialog();
            });
        }

        const fileDialogConfirm = document.getElementById('fileDialogConfirm');
        if (fileDialogConfirm) {
            fileDialogConfirm.addEventListener('click', () => {
                this.confirmNewFile();
            });
        }

        const fileDialogOverlay = document.getElementById('fileDialogOverlay');
        if (fileDialogOverlay) {
            fileDialogOverlay.addEventListener('click', () => {
                this.hideFileDialog();
            });
        }

        // 键盘快捷键
        const fileNameInput = document.getElementById('fileNameInput');
        if (fileNameInput) {
            fileNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.confirmNewFile();
                } else if (e.key === 'Escape') {
                    this.hideFileDialog();
                }
            });
        }
    }

    /**
     * 获取当前文件夹
     */
    getCurrentFolder() {
        // 查找当前激活的文件夹按钮
        const activeFolderBtn = document.querySelector('[data-folder].active');
        if (activeFolderBtn) {
            this.currentFolder = activeFolderBtn.dataset.folder;
        }
        return this.currentFolder;
    }

    /**
     * 获取选中的文件
     */
    getSelectedFile() {
        console.log('FileManager: 开始获取选中的文件');

        // 优先从 FileExplorer 实例获取选中的文件
        if (window.jsEditor && window.jsEditor.fileExplorer) {
            const selectedFile = window.jsEditor.fileExplorer.selectedFile;
            console.log('FileManager: FileExplorer.selectedFile:', selectedFile);
            if (selectedFile) {
                return selectedFile;
            }
        }

        // 备用方案：从DOM查询选中的文件项
        const selectedFileItem = document.querySelector('.file-item.selected');
        console.log('FileManager: DOM中选中的文件项:', selectedFileItem);
        if (selectedFileItem) {
            return {
                name: selectedFileItem.dataset.file,
                type: selectedFileItem.dataset.type
            };
        }

        console.log('FileManager: 没有找到选中的文件');
        return null;
    }

    /**
     * 显示新建文件对话框
     */
    showNewFileDialog() {
        const dialog = document.getElementById('fileDialog');
        const overlay = document.getElementById('fileDialogOverlay');
        const title = document.getElementById('fileDialogTitle');
        const input = document.getElementById('fileNameInput');

        if (dialog && overlay && title && input) {
            // 重置对话框状态
            dialog.classList.remove('delete-confirmation');
            input.style.display = 'block';

            title.textContent = '新建文件';
            input.value = '';
            input.placeholder = '请输入文件名（如：newFile.html）';

            // 根据当前文件夹设置默认文件类型提示
            const currentFolder = this.getCurrentFolder();
            const folderHints = {
                'html': '建议使用 .html 或 .htm 扩展名',
                'css': '建议使用 .css 扩展名',
                'javascript': '建议使用 .js 扩展名',
                'assets': '支持 .json, .csv, .txt, .md 等格式'
            };

            // 创建或更新文件类型提示
            let hintElement = dialog.querySelector('.file-type-hint');
            if (!hintElement) {
                hintElement = document.createElement('div');
                hintElement.className = 'file-type-hint';
                input.parentNode.insertBefore(hintElement, input.nextSibling);
            }
            hintElement.textContent = folderHints[currentFolder] || '支持各种文件类型';
            hintElement.style.display = 'block';

            // 重置按钮状态
            const confirmBtn = document.getElementById('fileDialogConfirm');
            const cancelBtn = document.getElementById('fileDialogCancel');
            if (confirmBtn) {
                confirmBtn.textContent = '创建';
                confirmBtn.className = 'btn btn-primary';
            }
            if (cancelBtn) {
                cancelBtn.textContent = '取消';
                cancelBtn.className = 'btn btn-secondary';
            }

            // 移除删除警告
            const warningElement = dialog.querySelector('.delete-warning');
            if (warningElement) {
                warningElement.style.display = 'none';
            }

            // 先显示overlay和dialog，然后触发动画
            overlay.style.display = 'block';
            dialog.style.display = 'block';

            // 使用setTimeout确保动画能够正确触发
            setTimeout(() => {
                overlay.classList.add('active');
                dialog.classList.add('active');

                // 聚焦到输入框
                input.focus();
                input.select();
            }, 10);
        }
    }

    /**
     * 隐藏文件对话框
     */
    hideFileDialog() {
        const dialog = document.getElementById('fileDialog');
        const overlay = document.getElementById('fileDialogOverlay');

        if (dialog && overlay) {
            // 先移除active类触发淡出动画
            dialog.classList.remove('active');
            overlay.classList.remove('active');

            // 等待动画完成后隐藏元素
            setTimeout(() => {
                if (!dialog.classList.contains('active')) {
                    overlay.style.display = 'none';
                    dialog.style.display = 'none';
                }
            }, 300); // 与CSS动画时间匹配
        }
    }

    /**
     * 确认新建文件
     */
    confirmNewFile() {
        const fileName = document.getElementById('fileNameInput').value.trim();
        if (!fileName) {
            this.editor.showTemporaryMessage('请输入文件名', 'warning');
            return;
        }

        this.createFile(fileName);
        this.hideFileDialog();
    }

    /**
     * 创建新文件
     * @param {string} fileName - 文件名
     */
    createFile(fileName) {
        try {
            const fileType = this.getFileType(fileName);
            const currentFolder = this.getCurrentFolder();

            // 创建文件对象
            const newFile = {
                name: fileName,
                type: fileType,
                icon: this.getFileIcon(fileType),
                content: this.getDefaultContentForType(fileType, fileName)
            };

            // 添加到文件浏览器（通过现有的FileExplorer实例）
            if (window.jsEditor && window.jsEditor.fileExplorer) {
                const fileExplorer = window.jsEditor.fileExplorer;

                // 检查文件名是否已存在
                if (fileExplorer.files[currentFolder] &&
                    fileExplorer.files[currentFolder].some(f => f.name === fileName)) {
                    this.editor.showTemporaryMessage('文件名已存在', 'warning');
                    return;
                }

                // 添加文件到当前文件夹
                if (!fileExplorer.files[currentFolder]) {
                    fileExplorer.files[currentFolder] = [];
                }
                fileExplorer.files[currentFolder].push(newFile);

                // 刷新文件列表
                fileExplorer.showFolder(currentFolder);

                // 如果是代码文件，自动切换到对应编辑器并加载内容
                if (['html', 'css', 'javascript'].includes(fileType)) {
                    const targetTab = fileType === 'javascript' ? 'js' : fileType;
                    this.editor.switchTab(targetTab);

                    // 自动打开新创建的文件
                    setTimeout(() => {
                        fileExplorer.openFile(newFile);
                    }, 100);
                } else if (['json', 'csv'].includes(fileType)) {
                    // 对于数据文件，切换到数据面板
                    this.editor.switchTab('data');
                    setTimeout(() => {
                        fileExplorer.openFile(newFile);
                    }, 100);
                }

                // 立即保存文件系统状态到localStorage
                this.saveFileSystemState();

                this.editor.logToConsole('info', `文件 "${fileName}" 已创建`);
                this.editor.showTemporaryMessage(`文件 "${fileName}" 创建成功`, 'success');
            } else {
                console.error('FileExplorer实例未找到');
                this.editor.showTemporaryMessage('文件创建失败：文件浏览器未初始化', 'error');
            }
        } catch (error) {
            console.error('创建文件时出错:', error);
            this.editor.showTemporaryMessage('文件创建失败: ' + error.message, 'error');
        }
    }

    /**
     * 删除选中的文件
     */
    deleteSelectedFile() {
        try {
            const selectedFile = this.getSelectedFile();
            console.log('FileManager: 获取到的选中文件:', selectedFile);

            if (!selectedFile) {
                console.log('FileManager: 没有选中的文件');
                this.editor.logToConsole('warning', '请先选择要删除的文件');
                this.editor.showTemporaryMessage('请先选择要删除的文件', 'warning');
                return;
            }

            console.log('FileManager: 显示删除确认对话框，文件名:', selectedFile.name);
            this.showDeleteConfirmDialog(selectedFile.name);
        } catch (error) {
            console.error('删除文件时出错:', error);
            this.editor.showTemporaryMessage('删除失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示删除确认对话框
     * @param {string} fileName - 要删除的文件名
     */
    showDeleteConfirmDialog(fileName) {
        const dialog = document.getElementById('fileDialog');
        const overlay = document.getElementById('fileDialogOverlay');
        const title = document.getElementById('fileDialogTitle');
        const input = document.getElementById('fileNameInput');

        if (dialog && overlay && title && input) {
            // 设置对话框为删除确认模式
            dialog.classList.add('delete-confirmation');

            title.textContent = '删除文件确认';

            // 隐藏输入框，显示删除警告
            input.style.display = 'none';

            // 隐藏文件类型提示
            const hintElement = dialog.querySelector('.file-type-hint');
            if (hintElement) {
                hintElement.style.display = 'none';
            }

            // 创建删除警告内容
            let warningElement = dialog.querySelector('.delete-warning');
            if (!warningElement) {
                warningElement = document.createElement('div');
                warningElement.className = 'delete-warning';
                input.parentNode.insertBefore(warningElement, input);
            }
            warningElement.innerHTML = `确定要删除文件 <span class="file-name">${fileName}</span> 吗？<br>此操作无法撤销。`;
            warningElement.style.display = 'block';

            // 修改按钮
            const confirmBtn = document.getElementById('fileDialogConfirm');
            const cancelBtn = document.getElementById('fileDialogCancel');

            if (confirmBtn) {
                confirmBtn.textContent = '删除';
                confirmBtn.className = 'btn btn-danger';
            }
            if (cancelBtn) {
                cancelBtn.textContent = '取消';
                cancelBtn.className = 'btn btn-secondary';
            }

            // 先显示overlay和dialog，然后触发动画
            overlay.style.display = 'block';
            dialog.style.display = 'block';

            // 使用setTimeout确保动画能够正确触发
            setTimeout(() => {
                overlay.classList.add('active');
                dialog.classList.add('active');
            }, 10);

            // 绑定确认删除事件
            this._pendingDeleteFileName = fileName;
            this._tempConfirmHandler = () => this.confirmDeleteFile(fileName);
            this._tempCancelHandler = () => this.hideDeleteConfirmDialog();

            if (confirmBtn) {
                confirmBtn.removeEventListener('click', this._tempConfirmHandler);
                confirmBtn.addEventListener('click', this._tempConfirmHandler);
            }
            if (cancelBtn) {
                cancelBtn.removeEventListener('click', this._tempCancelHandler);
                cancelBtn.addEventListener('click', this._tempCancelHandler);
            }
        }
    }

    /**
     * 隐藏删除确认对话框
     */
    hideDeleteConfirmDialog() {
        const dialog = document.getElementById('fileDialog');
        const overlay = document.getElementById('fileDialogOverlay');
        const input = document.getElementById('fileNameInput');
        const confirmBtn = document.getElementById('fileDialogConfirm');

        if (dialog && overlay) {
            // 移除删除确认模式
            dialog.classList.remove('delete-confirmation');

            // 恢复输入框显示
            if (input) {
                input.style.display = 'block';
            }

            // 恢复文件类型提示
            const hintElement = dialog.querySelector('.file-type-hint');
            if (hintElement) {
                hintElement.style.display = 'block';
            }

            // 移除删除警告
            const warningElement = dialog.querySelector('.delete-warning');
            if (warningElement) {
                warningElement.style.display = 'none';
            }

            // 恢复按钮
            if (confirmBtn) {
                confirmBtn.textContent = '创建';
                confirmBtn.className = 'btn btn-primary';
            }

            // 移除临时事件监听器
            if (this._tempConfirmHandler && confirmBtn) {
                confirmBtn.removeEventListener('click', this._tempConfirmHandler);
            }
            if (this._tempCancelHandler) {
                const cancelBtn = document.getElementById('fileDialogCancel');
                if (cancelBtn) {
                    cancelBtn.removeEventListener('click', this._tempCancelHandler);
                }
            }

            // 清理临时变量
            this._pendingDeleteFileName = null;
            this._tempConfirmHandler = null;
            this._tempCancelHandler = null;

            // 隐藏对话框
            this.hideFileDialog();
        }
    }

    /**
     * 确认删除文件
     * @param {string} fileName - 要删除的文件名
     */
    confirmDeleteFile(fileName) {
        try {
            const currentFolder = this.getCurrentFolder();

            // 通过现有的FileExplorer实例执行删除
            if (window.jsEditor && window.jsEditor.fileExplorer) {
                const fileExplorer = window.jsEditor.fileExplorer;

                // 执行删除操作
                const index = fileExplorer.files[currentFolder].findIndex(f => f.name === fileName);
                if (index > -1) {
                    fileExplorer.files[currentFolder].splice(index, 1);
                }

                // 显示删除成功反馈
                this.showDeleteFeedback(fileName);

                // 清空选中状态
                this.selectedFile = null;

                // 刷新文件列表
                fileExplorer.showFolder(currentFolder);

                // 立即保存文件系统状态到localStorage
                this.saveFileSystemState();

                this.editor.logToConsole('info', `文件 "${fileName}" 已删除`);
                this.editor.showTemporaryMessage(`文件 "${fileName}" 已删除`, 'success');
            } else {
                console.error('FileExplorer实例未找到');
                this.editor.showTemporaryMessage('删除失败：文件浏览器未初始化', 'error');
            }

            // 隐藏对话框
            this.hideDeleteConfirmDialog();
        } catch (error) {
            console.error('删除文件时出错:', error);
            this.editor.showTemporaryMessage('删除失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示删除成功反馈
     * @param {string} message - 删除成功消息
     */
    showDeleteFeedback(message) {
        // 触发删除按钮动画
        const deleteBtn = document.getElementById('deleteFileBtn');
        if (deleteBtn) {
            deleteBtn.classList.add('delete-active');
            setTimeout(() => {
                deleteBtn.classList.remove('delete-active');
            }, 600);
        }
    }

    /**
     * 根据文件名获取文件类型
     * @param {string} fileName - 文件名
     * @returns {string} 文件类型
     */
    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'js': 'javascript',
            'javascript': 'javascript',
            'json': 'json',
            'xml': 'xml',
            'txt': 'text',
            'md': 'text',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'csv': 'csv'
        };
        return typeMap[extension] || 'text';
    }

    /**
     * 根据文件类型获取图标
     * @param {string} fileType - 文件类型
     * @returns {string} 图标类名
     */
    getFileIcon(fileType) {
        const iconMap = {
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'javascript': 'fab fa-js',
            'json': 'fas fa-code',
            'csv': 'fas fa-file-csv',
            'xml': 'fas fa-code',
            'text': 'fas fa-file-alt',
            'image': 'fas fa-image'
        };
        return iconMap[fileType] || 'fas fa-file';
    }

    /**
     * 根据文件类型获取默认内容
     * @param {string} fileType - 文件类型
     * @param {string} fileName - 文件名
     * @returns {string} 默认文件内容
     */
    getDefaultContentForType(fileType, fileName) {
        switch (fileType) {
            case 'html':
                return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* 基础样式重置 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        .container {
            width: 100%;
            height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }

        header {
            text-align: center;
            margin-bottom: 30px;
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .content {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>欢迎来到 ${fileName}</h1>
        </header>
        <main>
            <section class="content">
                <p>这是一个新创建的HTML文件。</p>
            </section>
        </main>
    </div>
</body>
</html>`;

            case 'css':
                return `/* ${fileName} */
/* CSS样式文件 */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.container {
    width: 100%;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
}

header {
    text-align: center;
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    font-size: 2.5em;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.content {
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}`;

            case 'javascript':
                return `// ${fileName}
// JavaScript文件

console.log('${fileName} 已加载');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');

    // 在这里添加你的代码
});

/**
 * 示例函数
 */
function exampleFunction() {
    console.log('这是一个示例函数');
}`;

            case 'json':
                return `{
  "name": "${fileName}",
  "description": "这是一个JSON文件",
  "version": "1.0.0",
  "data": []
}`;

            case 'csv':
                return `id,name,value
1,示例数据,100
2,测试项目,200`;

            case 'text':
                return `${fileName}
这是一个文本文件。

在这里添加你的内容。`;

            default:
                return `// ${fileName}
// 新创建的文件
`;
        }
    }

    /**
     * 保存文件系统状态到localStorage
     */
    saveFileSystemState() {
        try {
            if (window.jsEditor && window.jsEditor.fileExplorer) {
                const fileExplorer = window.jsEditor.fileExplorer;
                const fileSystemData = {
                    fileSystem: {
                        currentFolder: fileExplorer.currentFolder,
                        selectedFile: fileExplorer.selectedFile,
                        files: fileExplorer.files
                    },
                    timestamp: new Date().toISOString()
                };

                // 获取现有的localStorage数据
                const existingData = localStorage.getItem('jsEditorCode');
                let completeData = {};

                if (existingData) {
                    try {
                        completeData = JSON.parse(existingData);
                    } catch (error) {
                        console.error('解析现有数据失败:', error);
                    }
                }

                // 更新文件系统部分
                completeData.fileSystem = fileSystemData.fileSystem;

                // 保存到localStorage
                localStorage.setItem('jsEditorCode', JSON.stringify(completeData));
                console.log('FileManager: 文件系统状态已保存到localStorage');
            }
        } catch (error) {
            console.error('FileManager: 保存文件系统状态失败:', error);
        }
    }
}

// 页面加载完成后初始化文件管理器
document.addEventListener('DOMContentLoaded', function() {
    console.log('FileManager: DOM加载完成，开始初始化检查...');

    function initializeFileManager(retryCount) {
        retryCount = retryCount || 0;
        console.log('FileManager: 尝试初始化，重试次数 ' + retryCount);

        if (window.jsEditor && typeof FileManager !== 'undefined') {
            try {
                console.log('FileManager: 主编辑器已就绪，正在初始化文件管理器...');

                // 避免重复初始化
                if (window.jsEditor.fileManager) {
                    console.log('FileManager: 文件管理器已经初始化，跳过');
                    return;
                }

                window.jsEditor.fileManager = new FileManager(window.jsEditor);
                console.log('FileManager: 文件管理器初始化完成');

                // 验证初始化是否成功
                setTimeout(function() {
                    if (window.jsEditor.fileManager) {
                        console.log('FileManager: 验证成功，文件管理器正常运行');
                    } else {
                        console.error('FileManager: 验证失败，文件管理器初始化有问题');
                    }
                }, 500);

            } catch (error) {
                console.error('FileManager: 文件管理器初始化失败:', error);
                if (retryCount < 5) {
                    console.log('FileManager: 将在200ms后重试 ' + (retryCount + 1) + '/5');
                    setTimeout(function() {
                        initializeFileManager(retryCount + 1);
                    }, 200);
                }
            }
        } else if (retryCount < 15) {
            console.log('FileManager: 等待主编辑器初始化... 重试 ' + (retryCount + 1) + '/15');
            setTimeout(function() {
                initializeFileManager(retryCount + 1);
            }, 200);
        } else {
            console.error('FileManager: 主编辑器初始化超时，文件管理器无法初始化');
        }
    }

    // 延迟启动初始化
    setTimeout(function() {
        initializeFileManager();
    }, 600); // 稍微延迟，确保FileExplorer先初始化
});

// 提供手动初始化函数，以防自动初始化失败
window.initializeFileManager = function() {
    console.log('FileManager: 手动初始化文件管理器...');
    if (window.jsEditor && typeof FileManager !== 'undefined') {
        try {
            window.jsEditor.fileManager = new FileManager(window.jsEditor);
            console.log('FileManager: 手动初始化完成');
            return true;
        } catch (error) {
            console.error('FileManager: 手动初始化失败:', error);
            return false;
        }
    }
    console.error('FileManager: 手动初始化失败，缺少必要的依赖');
    return false;
};
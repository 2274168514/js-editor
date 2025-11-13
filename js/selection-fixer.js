/**
 * 文件选择修复器模块
 * 修复JSON和CSV文件无法选中的问题
 */

class SelectionFixer {
    constructor() {
        this.init();
    }

    /**
     * 初始化选择修复器
     */
    init() {
        this.setupEventFix();
        console.log('SelectionFixer: 初始化完成');
    }

    /**
     * 设置事件修复
     */
    setupEventFix() {
        // 延迟执行，确保FileExplorer已完全初始化
        setTimeout(() => {
            this.fixFileSelection();
        }, 1000);
    }

    /**
     * 修复文件选择问题
     */
    fixFileSelection() {
        try {
            // 为所有文件项添加额外的事件监听器
            this.addEventListenerToFileItems();

            // 修复现有的FileExplorer的openFile方法
            this.patchOpenFileMethod();

            console.log('SelectionFixer: 文件选择修复完成');
        } catch (error) {
            console.error('SelectionFixer: 修复失败:', error);
        }
    }

    /**
     * 为文件项添加事件监听器
     */
    addEventListenerToFileItems() {
        // 使用事件委托监听文件项点击
        const fileList = document.getElementById('fileList');
        if (fileList) {
            fileList.addEventListener('click', (e) => {
                const fileItem = e.target.closest('.file-item');
                if (fileItem) {
                    this.handleFileItemClick(fileItem);
                }
            });
        }
    }

    /**
     * 处理文件项点击
     */
    handleFileItemClick(fileItem) {
        try {
            const fileName = fileItem.dataset.file;
            const fileType = fileItem.dataset.type;

            console.log('SelectionFixer: 点击文件', fileName, fileType);

            // 确保文件被选中
            this.selectFileItem(fileItem);

            // 如果是JSON或CSV文件，确保选中状态被正确设置
            if (fileType === 'json' || fileType === 'csv') {
                this.ensureSelectionInFileExplorer(fileName, fileType);
            }
        } catch (error) {
            console.error('SelectionFixer: 处理文件点击时出错:', error);
        }
    }

    /**
     * 选中文件项
     */
    selectFileItem(fileItem) {
        // 移除其他文件的选中状态
        document.querySelectorAll('.file-item.selected').forEach(item => {
            item.classList.remove('selected');
        });

        // 选中当前文件
        fileItem.classList.add('selected');
        console.log('SelectionFixer: 已选中文件', fileItem.dataset.file);
    }

    /**
     * 确保FileExplorer中的选中状态正确
     */
    ensureSelectionInFileExplorer(fileName, fileType) {
        if (window.jsEditor && window.jsEditor.fileExplorer) {
            const fileExplorer = window.jsEditor.fileExplorer;
            const currentFolder = fileExplorer.currentFolder;

            // 在对应的文件夹中查找文件
            const files = fileExplorer.files[currentFolder] || [];
            const targetFile = files.find(f => f.name === fileName && f.type === fileType);

            if (targetFile) {
                // 手动设置选中状态
                fileExplorer.selectedFile = targetFile;
                console.log('SelectionFixer: 已在FileExplorer中设置选中文件', targetFile);
            }
        }
    }

    /**
     * 修复FileExplorer的openFile方法
     */
    patchOpenFileMethod() {
        if (window.jsEditor && window.jsEditor.fileExplorer) {
            const fileExplorer = window.jsEditor.fileExplorer;
            const originalOpenFile = fileExplorer.openFile.bind(fileExplorer);

            // 重写openFile方法
            fileExplorer.openFile = function(file) {
                console.log('SelectionFixer: 修复版openFile被调用', file.name, file.type);

                // 调用原始方法
                originalOpenFile(file);

                // 对于JSON和CSV文件，确保选中状态被设置
                if (file.type === 'json' || file.type === 'csv') {
                    // 延迟执行，确保DOM更新完成
                    setTimeout(() => {
                        const fileItem = document.querySelector(`[data-file="${file.name}"][data-type="${file.type}"]`);
                        if (fileItem) {
                            // 使用保存的原始selectFile方法
                            this.originalSelectFile(file, fileItem);
                        }
                    }, 100);
                }
            };

            // 保存selectFile方法的引用
            if (!fileExplorer.originalSelectFile) {
                fileExplorer.originalSelectFile = fileExplorer.selectFile.bind(fileExplorer);
            }
        }
    }

    /**
     * 增强文件选择检测
     */
    enhanceSelectionDetection() {
        // 为删除按钮添加选中状态检测
        const deleteBtn = document.getElementById('deleteFileBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.logSelectionStatus();
            });
        }
    }

    /**
     * 记录选择状态
     */
    logSelectionStatus() {
        const selectedFileItem = document.querySelector('.file-item.selected');
        const fileExplorerSelected = window.jsEditor?.fileExplorer?.selectedFile;

        console.log('SelectionFixer: 选中状态检查');
        console.log('- DOM中选中的文件项:', selectedFileItem);
        console.log('- FileExplorer中选中的文件:', fileExplorerSelected);

        if (selectedFileItem) {
            console.log('- 文件名:', selectedFileItem.dataset.file);
            console.log('- 文件类型:', selectedFileItem.dataset.type);
        }
    }

    /**
     * 提供手动修复方法
     */
    provideManualFix() {
        console.log(`
🔧 SelectionFixer 手动修复方案：

如果JSON/CSV文件仍然无法选中：

1. 检查控制台输出，确认文件项被点击
2. 确认文件项有.selected类
3. 验证FileExplorer.selectedFile被正确设置

可以使用以下命令手动检查：
- SelectionFixer.logSelectionStatus() - 检查选中状态
- document.querySelector('.file-item.selected') - 查看选中项
- window.jsEditor.fileExplorer.selectedFile - 查看FileExplorer选中状态
        `);
    }
}

// 页面加载完成后初始化选择修复器
document.addEventListener('DOMContentLoaded', function() {
    console.log('SelectionFixer: DOM加载完成');

    function initializeSelectionFixer(retryCount) {
        retryCount = retryCount || 0;

        if (window.jsEditor && typeof SelectionFixer !== 'undefined') {
            try {
                window.selectionFixer = new SelectionFixer();
                console.log('SelectionFixer: 初始化成功');

                // 提供全局修复方法
                window.fixSelection = () => {
                    window.selectionFixer.provideManualFix();
                };

            } catch (error) {
                console.error('SelectionFixer: 初始化失败:', error);
                if (retryCount < 5) {
                    setTimeout(() => initializeSelectionFixer(retryCount + 1), 200);
                }
            }
        } else if (retryCount < 10) {
            setTimeout(() => initializeSelectionFixer(retryCount + 1), 200);
        }
    }

    setTimeout(() => initializeSelectionFixer(), 800);
});
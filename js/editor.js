/**
 * JavaScript在线编辑器核心功能
 * 支持HTML、CSS、JavaScript实时编辑和预览
 * 集成D3.js数据可视化功能
 */

/**
 * 数据预览器类
 */
class DataPreviewer {
    constructor() {
        this.currentData = null;
        this.currentFileName = '';
        this.init();
    }

    /**
     * 初始化数据预览器
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        const vizTypeSelect = document.getElementById('dataVisualizationType');
        const refreshBtn = document.getElementById('refreshDataPreview');

        if (vizTypeSelect) {
            vizTypeSelect.addEventListener('change', () => {
                this.refreshPreview();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshPreview();
            });
        }
    }

    /**
     * 预览数据
     * @param {string} data - 数据内容
     * @param {string} fileName - 文件名
     * @param {string} fileType - 文件类型
     */
    previewData(data, fileName, fileType) {
        this.currentData = data;
        this.currentFileName = fileName;

        const content = document.getElementById('dataPreviewContent');
        const footer = document.getElementById('dataPreviewFooter');

        if (content && footer) {
            try {
                if (fileType === 'json') {
                    this.previewJson(data, fileName);
                } else if (fileType === 'csv') {
                    this.previewCsv(data, fileName);
                } else {
                    this.showEmptyState();
                }

                footer.style.display = 'block';
                this.updateStats(data, fileType);
            } catch (error) {
                this.showError('数据解析失败: ' + error.message);
            }
        }
    }

    /**
     * 预览JSON数据
     * @param {string} data - JSON数据
     * @param {string} fileName - 文件名
     */
    previewJson(data, fileName) {
        const vizType = document.getElementById('dataVisualizationType').value;
        const content = document.getElementById('dataPreviewContent');

        if (!content) return;

        let parsedData;
        try {
            parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            throw new Error('JSON格式错误');
        }

        switch (vizType) {
            case 'table':
                content.innerHTML = this.createJsonTable(parsedData);
                break;
            case 'chart':
                content.innerHTML = this.createJsonChart(parsedData);
                break;
            case 'json':
                content.innerHTML = `<div class="json-preview">${this.formatJson(parsedData)}</div>`;
                break;
            default:
                content.innerHTML = `<div class="json-preview">${this.formatJson(parsedData)}</div>`;
        }
    }

    /**
     * 预览CSV数据
     * @param {string} data - CSV数据
     * @param {string} fileName - 文件名
     */
    previewCsv(data, fileName) {
        const vizType = document.getElementById('dataVisualizationType').value;
        const content = document.getElementById('dataPreviewContent');

        if (!content) return;

        const parsedData = this.parseCsv(data);

        switch (vizType) {
            case 'table':
                content.innerHTML = this.createCsvTable(parsedData);
                break;
            case 'chart':
                content.innerHTML = this.createCsvChart(parsedData);
                break;
            case 'csv':
                content.innerHTML = `<div class="csv-preview">${this.escapeHtml(data)}</div>`;
                break;
            default:
                content.innerHTML = `<div class="csv-preview">${this.escapeHtml(data)}</div>`;
        }
    }

    /**
     * 创建JSON表格
     * @param {Object|Array} data - JSON数据
     * @returns {string} HTML表格
     */
    createJsonTable(data) {
        if (Array.isArray(data)) {
            if (data.length === 0) return '<p>数据为空</p>';

            const keys = Object.keys(data[0]);
            let table = '<table class="data-table"><thead><tr>';
            keys.forEach(key => {
                table += `<th>${this.escapeHtml(key)}</th>`;
            });
            table += '</tr></thead><tbody>';

            data.forEach(row => {
                table += '<tr>';
                keys.forEach(key => {
                    const value = row[key];
                    table += `<td>${this.formatValue(value)}</td>`;
                });
                table += '</tr>';
            });

            table += '</tbody></table>';
            return table;
        } else {
            // 对象类型，显示键值对
            let table = '<table class="data-table"><thead><tr><th>属性</th><th>值</th></tr></thead><tbody>';
            Object.entries(data).forEach(([key, value]) => {
                table += `<tr><td>${this.escapeHtml(key)}</td><td>${this.formatValue(value)}</td></tr>`;
            });
            table += '</tbody></table>';
            return table;
        }
    }

    /**
     * 创建CSV表格
     * @param {Array} data - 解析后的CSV数据
     * @returns {string} HTML表格
     */
    createCsvTable(data) {
        if (data.length === 0) return '<p>数据为空</p>';

        let table = '<table class="data-table"><thead><tr>';
        data[0].forEach(header => {
            table += `<th>${this.escapeHtml(header)}</th>`;
        });
        table += '</tr></thead><tbody>';

        for (let i = 1; i < data.length; i++) {
            table += '<tr>';
            data[i].forEach(cell => {
                table += `<td>${this.escapeHtml(cell)}</td>`;
            });
            table += '</tr>';
        }

        table += '</tbody></table>';

        // 添加实时编辑按钮
        table += '<div class="csv-actions" style="margin-top: 15px; text-align: center;">';
        table += '<button class="btn btn-primary btn-small" onclick="window.jsEditor?.enableCsvLiveEdit(window.jsEditor?.dataPreviewer?.currentData || \'\', window.jsEditor?.dataPreviewer?.currentFileName || \'\')">';
        table += '<i class="fas fa-edit"></i> 实时编辑';
        table += '</button>';
        table += '</div>';

        return table;
    }

    /**
     * 创建JSON图表占位符
     * @param {Object|Array} data - JSON数据
     * @returns {string} HTML内容
     */
    createJsonChart(data) {
        return `
            <div class="chart-container">
                <div class="chart-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <p>图表预览功能</p>
                    <p>数据已准备好，可以在JavaScript代码中使用D3.js创建图表</p>
                    <button class="btn btn-primary btn-small" onclick="window.jsEditor?.insertChartExample()">
                        插入图表示例代码
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 创建CSV图表占位符
     * @param {Array} data - 解析后的CSV数据
     * @returns {string} HTML内容
     */
    createCsvChart(data) {
        return `
            <div class="chart-container">
                <div class="chart-placeholder">
                    <i class="fas fa-chart-line"></i>
                    <p>图表预览功能</p>
                    <p>CSV数据已准备好，可以在JavaScript代码中使用Chart.js创建图表</p>
                    <button class="btn btn-primary btn-small" onclick="window.jsEditor?.insertCsvChartExample()">
                        插入CSV图表示例代码
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 格式化JSON显示
     * @param {Object|Array} data - JSON数据
     * @returns {string} 格式化的JSON字符串
     */
    formatJson(data) {
        const jsonStr = JSON.stringify(data, null, 2);
        return this.colorizeJson(jsonStr);
    }

    /**
     * 为JSON添加语法高亮
     * @param {string} jsonStr - JSON字符串
     * @returns {string} 带高亮的HTML
     */
    colorizeJson(jsonStr) {
        return jsonStr
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>')
            .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/: null/g, ': <span class="json-null">null</span>');
    }

    /**
     * 解析CSV数据
     * @param {string} csvText - CSV文本
     * @returns {Array} 解析后的数据
     */
    parseCsv(csvText) {
        const lines = csvText.trim().split('\n');
        const result = [];

        lines.forEach(line => {
            const values = this.parseCsvLine(line);
            result.push(values);
        });

        return result;
    }

    /**
     * 解析CSV行
     * @param {string} line - CSV行
     * @returns {Array} 解析后的值
     */
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * 格式化值显示
     * @param {*} value - 值
     * @returns {string} 格式化后的HTML
     */
    formatValue(value) {
        if (value === null) return '<span class="json-null">null</span>';
        if (typeof value === 'boolean') return `<span class="json-boolean">${value}</span>`;
        if (typeof value === 'number') return `<span class="json-number">${value}</span>`;
        if (typeof value === 'string') return `<span class="json-string">"${this.escapeHtml(value)}"</span>`;
        if (typeof value === 'object') return `<span class="json-string">${JSON.stringify(value)}</span>`;
        return this.escapeHtml(String(value));
    }

    /**
     * 转义HTML
     * @param {string} text - 文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 更新数据统计
     * @param {string} data - 数据
     * @param {string} fileType - 文件类型
     */
    updateStats(data, fileType) {
        const rowCountEl = document.getElementById('rowCount');
        const colCountEl = document.getElementById('colCount');
        const dataSizeEl = document.getElementById('dataSize');

        if (rowCountEl && colCountEl && dataSizeEl) {
            let rowCount = 0;
            let colCount = 0;

            if (fileType === 'json') {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (Array.isArray(parsed)) {
                        rowCount = parsed.length;
                        colCount = parsed.length > 0 ? Object.keys(parsed[0]).length : 0;
                    } else {
                        rowCount = 1;
                        colCount = Object.keys(parsed).length;
                    }
                } catch (error) {
                    rowCount = 0;
                    colCount = 0;
                }
            } else if (fileType === 'csv') {
                const parsed = this.parseCsv(data);
                rowCount = parsed.length > 0 ? parsed.length - 1 : 0; // 减去表头
                colCount = parsed.length > 0 ? parsed[0].length : 0;
            }

            const dataSize = new Blob([data]).size;
            const formattedSize = this.formatFileSize(dataSize);

            rowCountEl.textContent = rowCount;
            colCountEl.textContent = colCount;
            dataSizeEl.textContent = formattedSize;
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * 显示空状态
     */
    showEmptyState() {
        const content = document.getElementById('dataPreviewContent');
        if (content) {
            content.innerHTML = `
                <div class="data-empty-state">
                    <i class="fas fa-file-csv"></i>
                    <p>请上传CSV或JSON数据文件</p>
                    <p class="data-empty-hint">支持 .csv, .json 格式</p>
                </div>
            `;
        }
    }

    /**
     * 显示错误
     * @param {string} message - 错误消息
     */
    showError(message) {
        const content = document.getElementById('dataPreviewContent');
        if (content) {
            content.innerHTML = `
                <div class="data-empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>数据加载失败</p>
                    <p class="data-empty-hint">${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }

    /**
     * 刷新预览
     */
    refreshPreview() {
        if (this.currentData && this.currentFileName) {
            const fileType = this.currentFileName.endsWith('.json') ? 'json' : 'csv';
            this.previewData(this.currentData, this.currentFileName, fileType);
        }
    }
}

class JSEditor {
    constructor() {
        /**
         * 编辑器实例对象
         */
        this.editors = {};

        /**
         * 当前活跃的标签页
         */
        this.currentTab = 'html';

        /**
         * 自动保存定时器
         */
        this.autoSaveTimer = null;

        /**
         * 代码运行防抖定时器
         */
        this.runDebounceTimer = null;

        /**
         * 历史记录栈（用于撤销功能）
         */
        this.history = {
            stack: [],
            currentIndex: -1,
            maxHistorySize: 50
        };

        /**
         * 上传的文件和图片列表
         */
        this.uploadedFiles = {
            images: [],
            files: []
        };

        /**
         * 分隔条拖拽相关属性
         */
        this.resizeState = {
            isDragging: false,
            startX: 0,
            startWidth: 0,
            containerWidth: 0
        };

        /**
         * 拖拽节流定时器
         */
        this.resizeRefreshTimer = null;

        /**
         * 文件管理相关属性
         */
        this.fileSystem = {
            currentDialog: null,
            currentFolder: null,
            fileCounter: 1
        };

        /**
         * 数据预览器实例
         */
        this.dataPreviewer = null;

        /**
         * 文件浏览器实例
         */
        this.fileExplorer = null;

        /**
         * 初始化编辑器
         */
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        this.setupEditors();
        this.setupEventListeners();

        // 初始化数据预览器
        this.dataPreviewer = new DataPreviewer();

        // 先加载保存的代码，然后再初始化文件浏览器
        this.loadSavedCode();
        this.loadLayoutWidth(); // 加载保存的布局宽度

        // 初始化文件浏览器（在加载代码后初始化）
        this.fileExplorer = new FileExplorer(this);

        // 初始化AI助手
        this.aiAssistant = new AIAssistant(this);

        // 设置初始控制台状态
        const editorSection = document.querySelector('.editor-section');
        if (editorSection) {
            editorSection.classList.add('console-expanded');
        }

        // 加载默认数据文件 - 确保在文件浏览器初始化完成后加载
        setTimeout(() => {
            if (this.fileExplorer) {
                this.loadDefaultDataFiles();
                // 数据加载后再运行代码
                setTimeout(() => this.runCode(), 300);
            } else {
                console.log('文件浏览器尚未初始化，稍后重试');
                setTimeout(() => this.loadDefaultDataFiles(), 500);
            }
        }, 800);

        this.updateStatus('就绪');

        // 设置页面关闭前自动保存
        this.setupPageUnloadSave();

        // 延迟保存初始状态到历史记录
        setTimeout(() => {
            this.saveToHistory();
        }, 1000);
    }

    /**
     * 设置CodeMirror编辑器
     */
    setupEditors() {
        // 检查必要的DOM元素是否存在
        const requiredElements = ['html-editor', 'css-editor', 'js-editor'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            console.error('缺少必要的DOM元素:', missingElements);
            return;
        }

        /**
         * HTML编辑器配置
         */
        this.editors.html = CodeMirror.fromTextArea(document.getElementById('html-editor'), {
            mode: 'xml',
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-S": () => this.saveCode(),
                "F11": (cm) => cm.setOption("fullScreen", !cm.getOption("fullScreen"))
            }
        });

        /**
         * CSS编辑器配置
         */
        this.editors.css = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
            mode: 'css',
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-S": () => this.saveCode()
            }
        });

        /**
         * JavaScript编辑器配置
         */
        this.editors.js = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
            mode: 'javascript',
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            lint: true,
            gutters: ["CodeMirror-lint-markers"],
            indentUnit: 2,
            tabSize: 2,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-S": () => this.saveCode()
            }
        });

        // 数据编辑器
        this.editors.data = CodeMirror.fromTextArea(document.getElementById('data-editor'), {
            mode: 'javascript',
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            extraKeys: {
                "Ctrl-S": () => this.saveCode()
            }
        });

        // 监听编辑器变化事件
        Object.values(this.editors).forEach(editor => {
            editor.on('change', () => this.onEditorChange());
            editor.on('cursorActivity', () => this.updateCursorPosition());
        });
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        try {
            /**
             * 文件夹导航事件（替代原来的标签页切换）
             */
            const folderBtns = document.querySelectorAll('.folder-btn');
            if (folderBtns.length > 0) {
                folderBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const folder = e.currentTarget.dataset.folder;
                        if (folder) {
                            this.switchFolderEditor(folder);
                        }
                    });
                });
            }

            /**
             * 运行按钮事件
             */
            const runBtn = document.getElementById('runBtn');
            if (runBtn) runBtn.addEventListener('click', () => this.runCode());

            /**
             * 美化按钮事件
             */
            const beautifyBtn = document.getElementById('beautifyBtn');
            if (beautifyBtn) beautifyBtn.addEventListener('click', () => this.beautifyCode());

            /**
             * 清空按钮事件
             */
            const clearBtn = document.getElementById('clearBtn');
            if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllCode());

            /**
             * 恢复模板按钮事件
             */
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) resetBtn.addEventListener('click', () => this.resetToTemplate());

            /**
             * 保存按钮事件
             */
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveCode());

            /**
             * 导出按钮事件
             */
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportCode());

            /**
             * 文件上传事件
             */
            const fileUploadElement = document.getElementById('fileUpload');
            if (fileUploadElement) {
                fileUploadElement.addEventListener('change', (e) => this.handleFileUpload(e));
            }

            /**
             * 新建文件按钮事件
             */
            const newFileBtnElement = document.getElementById('newFileBtn');
            if (newFileBtnElement) {
                newFileBtnElement.addEventListener('click', () => {
                    this.clearAllCode();
                    this.updateStatus('已新建文件');
                });
            }

            /**
             * 删除文件按钮事件
             */
            const deleteFileBtnElement = document.getElementById('deleteFileBtn');
            if (deleteFileBtnElement) {
                deleteFileBtnElement.addEventListener('click', () => {
                    this.handleSmartDelete();
                });
            }

            /**
             * 清空控制台事件
             */
            const clearConsoleBtn = document.getElementById('clearConsole');
            if (clearConsoleBtn) {
                clearConsoleBtn.addEventListener('click', () => this.clearConsole());
            }

            /**
             * 切换控制台显示/隐藏事件
             */
            const toggleConsoleBtn = document.getElementById('toggleConsole');
            if (toggleConsoleBtn) {
                toggleConsoleBtn.addEventListener('click', () => this.toggleConsole());
            }

            /**
             * 恢复控制台显示事件
             */
            const restoreConsoleBtn = document.getElementById('restoreConsole');
            if (restoreConsoleBtn) {
                restoreConsoleBtn.addEventListener('click', () => this.restoreConsole());
            }

            /**
             * 刷新预览事件
             */
            const refreshPreviewBtn = document.getElementById('refreshPreview');
            if (refreshPreviewBtn) {
                refreshPreviewBtn.addEventListener('click', () => this.runCode());
            }

            /**
             * 全屏预览事件
             */
            const fullscreenPreviewBtn = document.getElementById('fullscreenPreview');
            if (fullscreenPreviewBtn) {
                fullscreenPreviewBtn.addEventListener('click', () => this.toggleFullscreen());
            }

            /**
             * 分隔条拖拽事件
             */
            this.setupResizeDivider();

            // 文件管理事件现在由FileExplorer类处理

            /**
             * 键盘快捷键事件
             */
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 's':
                            e.preventDefault();
                            this.saveCode();
                            break;
                        case 'Enter':
                            e.preventDefault();
                            this.runCode();
                            break;
                        case 'z':
                            e.preventDefault();
                            this.undo();
                            break;
                    }
                }
            });

            /**
             * 数据面板事件监听器
             */
            this.setupDataPanelEvents();

        } catch (error) {
            console.error('设置事件监听器时发生错误:', error);
        }
    }

    
    /**
     * 加载默认数据文件
     */
    loadDefaultDataFiles() {
        if (!this.fileExplorer || !this.fileExplorer.files.assets) {
            console.log('等待文件浏览器初始化...');
            // 延迟重试
            setTimeout(() => this.loadDefaultDataFiles(), 100);
            return;
        }

        const assetsFiles = this.fileExplorer.files.assets;

        // 优先加载JSON文件
        const jsonFile = assetsFiles.find(file => file.name === 'data.json');
        const csvFile = assetsFiles.find(file => file.name === 'data.csv');

        if (jsonFile) {
            this.fileExplorer.loadDataToEditor(jsonFile.content, 'json', jsonFile.name);
            this.logToConsole('info', '已加载默认JSON数据文件');
        } else if (csvFile) {
            this.fileExplorer.loadDataToEditor(csvFile.content, 'csv', csvFile.name);
            this.logToConsole('info', '已加载默认CSV数据文件');
        } else {
            console.log('未找到默认数据文件');
        }
    }

    /**
     * 切换文件夹对应的编辑器
     * @param {string} folder - 文件夹名称
     */
    switchFolderEditor(folder) {
        // 更新文件夹按钮状态
        document.querySelectorAll('.folder-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-folder="${folder}"]`).classList.add('active');

        // 根据文件夹类型切换到对应编辑器
        let targetTab = 'html'; // 默认
        switch (folder) {
            case 'html':
                targetTab = 'html';
                break;
            case 'css':
                targetTab = 'css';
                break;
            case 'javascript':
                targetTab = 'js';
                break;
            case 'assets':
                // 数据文件夹显示数据预览面板
                document.querySelectorAll('.editor-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                const dataPanel = document.getElementById('data-panel');
                if (dataPanel) {
                    dataPanel.classList.add('active');
                }
                this.currentTab = 'data';

                // 加载默认数据文件
                this.loadDefaultDataFiles();
                return; // 直接返回，不执行后续的编辑器逻辑
        }

        // 更新编辑器面板显示
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${targetTab}-panel`).classList.add('active');

        // 刷新当前编辑器
        if (this.editors[targetTab]) {
            setTimeout(() => this.editors[targetTab].refresh(), 100);
        }

        this.currentTab = targetTab;
    }

    /**
     * 切换标签页（保留用于向后兼容）
     * @param {string} tab - 标签页名称
     */
    switchTab(tab) {
        // 如果切换标签页，先自动保存当前编辑器的内容到当前文件
        if (this.currentTab && this.currentTab !== tab) {
            this.saveCurrentEditorContentToFile();
        }

        // 更新当前标签页
        this.currentTab = tab;

        // 更新标签页按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        // 更新编辑器面板显示
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tab}-panel`).classList.add('active');

        // 刷新当前编辑器
        if (this.editors[tab]) {
            setTimeout(() => this.editors[tab].refresh(), 100);
        }

        this.currentTab = tab;
    }

    /**
     * 编辑器内容变化时的处理
     */
    onEditorChange() {
        this.updateFileSize();
        this.updateSaveStatus('未保存');

        // 防抖运行代码
        clearTimeout(this.runDebounceTimer);
        this.runDebounceTimer = setTimeout(() => {
            this.runCode();
        }, 1000);

        // 自动保存
        this.setAutoSave();
    }

    /**
     * 运行代码
     */
    runCode() {
        try {
            const html = this.editors.html.getValue();
            const css = this.editors.css.getValue();
            const js = this.editors.js.getValue();
            const data = this.editors.data ? this.editors.data.getValue() : '';
            const d3Code = ''; // D3编辑器已被移除

            // 处理数据 - 解析JSON或CSV格式
            let processedData = '';
            if (data.trim()) {
                // 检查是否为JSON格式
                if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
                    processedData = data;
                } else {
                    // 解析CSV格式
                    processedData = this.parseCsvData(data);
                }
            }

            // 构建完整的HTML文档
            const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>预览</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
        }
        ${css}
    </style>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    ${html}
    <div id="d3-container"></div>
    <script>
        // 避免重复声明console重写代码
        if (!window.consoleRedirected) {
            window.consoleRedirected = true;

            // 重写console方法以输出到父窗口控制台
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn,
                info: console.info
            };

        function sendToParentConsole(type, ...args) {
            parent.postMessage({
                type: 'console',
                method: type,
                args: args.map(arg => {
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch (e) {
                            return String(arg);
                        }
                    }
                    return String(arg);
                })
            }, '*');
        }

        console.log = function(...args) {
            originalConsole.log.apply(console, args);
            sendToParentConsole('log', ...args);
        };

        console.error = function(...args) {
            originalConsole.error.apply(console, args);
            sendToParentConsole('error', ...args);
        };

        console.warn = function(...args) {
            originalConsole.warn.apply(console, args);
            sendToParentConsole('warning', ...args);
        };

        console.info = function(...args) {
            originalConsole.info.apply(console, args);
            sendToParentConsole('info', ...args);
        };

        // 捕获未处理的错误
        window.addEventListener('error', function(e) {
            sendToParentConsole('error', e.message, 'at', e.filename, ':', e.lineno);
        });

        } // 闭合if (!window.consoleRedirected)

        // 全局数据变量
        window.appData = null;
        try {
            if (${processedData.trim().length > 0}) {
                window.appData = ${processedData};
                console.log('数据已加载到 window.appData');
            }
        } catch (dataError) {
            console.error('数据解析错误:', dataError.message);
        }

        // 用户JavaScript代码 - 包装在IIFE中避免全局变量污染
        (function() {
            try {
                ${js}
            } catch (e) {
                console.error('用户代码执行错误:', e.message, e.stack);
            }
        })();

        // D3.js代码
        if (${d3Code.trim().length > 0}) {
            try {
                ${d3Code}
            } catch (d3Error) {
                console.error('D3.js执行错误:', d3Error.message);
            }
        }
    </script>
</body>
</html>`;

            // 更新iframe预览
            const preview = document.getElementById('preview');
            const previewDoc = preview.contentDocument || preview.contentWindow.document;
            previewDoc.open();
            previewDoc.write(fullHtml);
            previewDoc.close();

            this.updateStatus('代码运行成功');
            this.clearConsole();

        } catch (error) {
            this.updateStatus('运行错误');
            this.logToConsole('error', `运行错误: ${error.message}`);
        }
    }

    /**
     * 解析CSV数据为JavaScript对象
     * @param {string} csvText - CSV文本内容
     * @returns {string} JSON字符串格式的数据
     */
    parseCsvData(csvText) {
        try {
            const lines = csvText.trim().split('\n');
            if (lines.length < 2) return '[]';

            const headers = lines[0].split(',').map(h => h.trim());
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length === headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        const value = values[index];
                        // 尝试转换为数字
                        const numValue = parseFloat(value);
                        row[header] = isNaN(numValue) ? value : numValue;
                    });
                    data.push(row);
                }
            }

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('CSV解析错误:', error.message);
            return '[]';
        }
    }

    /**
     * 智能删除处理
     */
    handleSmartDelete() {
        // 如果有文件浏览器且有选中的文件，删除选中的文件
        if (this.fileExplorer && this.fileExplorer.selectedFile) {
            this.fileExplorer.deleteSelectedFile();
            return;
        }

        // 如果当前编辑器有内容，清空当前编辑器
        const currentEditor = this.editors[this.currentTab];
        if (currentEditor && currentEditor.getValue().trim() !== '') {
            this.clearCurrentEditor();
            return;
        }

        // 如果都没有，显示提示
        this.showTemporaryMessage('没有可删除的内容', 'info');
    }

    /**
     * 清空当前编辑器
     */
    clearCurrentEditor() {
        // 保存当前状态到历史记录
        this.saveToHistory();

        const currentEditor = this.editors[this.currentTab];
        const editorNames = {
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript'
        };

        if (currentEditor) {
            currentEditor.setValue('');
            this.clearConsole();
            this.runCode();

            const editorName = editorNames[this.currentTab] || '当前';
            this.showDeleteFeedback(`${editorName}编辑器内容已清空`);
            this.updateStatus(`${editorName}编辑器已清空`);
            this.logToConsole('info', `${editorName}编辑器内容已清空`);
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

        // 创建临时删除提示
        const feedback = document.createElement('div');
        feedback.className = 'delete-feedback';
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        // 添加样式
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // 添加到页面
        document.body.appendChild(feedback);

        // 显示动画
        setTimeout(() => {
            feedback.style.transform = 'translateX(0)';
        }, 100);

        // 3秒后移除
        setTimeout(() => {
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 显示临时消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (warning, info, error)
     */
    showTemporaryMessage(message, type = 'info') {
        const colors = {
            warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
            info: 'linear-gradient(135deg, #3498db, #2980b9)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)'
        };

        const icons = {
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            error: 'fas fa-times-circle'
        };

        // 创建临时消息
        const messageEl = document.createElement('div');
        messageEl.className = 'temp-message';
        messageEl.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;

        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // 添加到页面
        document.body.appendChild(messageEl);

        // 显示动画
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // 2秒后移除
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 2000);
    }

    /**
     * 清空所有代码
     */
    clearAllCode() {
        // 保存当前状态到历史记录
        this.saveToHistory();

        // 清空所有编辑器
        this.editors.html.setValue('');
        this.editors.css.setValue('');
        this.editors.js.setValue('');
        // D3编辑器已被移除
        this.clearConsole();
        this.runCode();
        this.updateStatus('代码已清空');
    }

    /**
     * 保存当前状态到历史记录
     */
    saveToHistory() {
        const currentState = {
            html: this.editors.html.getValue(),
            css: this.editors.css.getValue(),
            js: this.editors.js.getValue(),
            d3: '', // D3编辑器已被移除
            timestamp: Date.now()
        };

        // 如果当前不在历史记录的末尾，删除后续记录
        if (this.history.currentIndex < this.history.stack.length - 1) {
            this.history.stack = this.history.stack.slice(0, this.history.currentIndex + 1);
        }

        // 添加新状态
        this.history.stack.push(currentState);
        this.history.currentIndex++;

        // 限制历史记录大小
        if (this.history.stack.length > this.history.maxHistorySize) {
            this.history.stack.shift();
            this.history.currentIndex--;
        }
    }

    /**
     * 撤销操作 (Ctrl+Z)
     */
    undo() {
        if (this.history.currentIndex > 0) {
            this.history.currentIndex--;
            const state = this.history.stack[this.history.currentIndex];

            // 恢复编辑器内容
            this.editors.html.setValue(state.html);
            this.editors.css.setValue(state.css);
            this.editors.js.setValue(state.js);
            // D3编辑器已被移除

            this.runCode();
            this.updateStatus('已撤销到上一步操作');
            this.logToConsole('info', '已撤销到上一步操作');
        } else {
            this.updateStatus('没有可撤销的操作');
            this.logToConsole('warning', '没有可撤销的操作');
        }
    }

    /**
     * 检查是否可以撤销
     */
    canUndo() {
        return this.history.currentIndex > 0;
    }

    /**
     * 保存代码到本地存储 - 增强版本
     */
    saveCode() {
        // 保存当前编辑的文件内容
        this.saveCurrentFile();

        // 同时保存整体状态到localStorage（原有功能）
        const codeData = {
            html: this.editors.html.getValue(),
            css: this.editors.css.getValue(),
            js: this.editors.js.getValue(),
            d3: '', // D3编辑器已被移除
            timestamp: new Date().toISOString(),
            // 保存文件管理系统状态
            fileSystem: this.fileExplorer ? {
                currentFolder: this.fileExplorer.currentFolder,
                selectedFile: this.fileExplorer.selectedFile,
                files: this.fileExplorer.files
            } : null,
            // 保存当前活跃文件夹
            currentFolder: this.currentTab || 'html'
        };

        localStorage.setItem('jsEditorCode', JSON.stringify(codeData));
        this.updateStatus('代码已保存');
    }

    /**
     * 保存当前文件的内容到文件系统
     */
    saveCurrentFile() {
        if (!this.fileExplorer || !this.fileExplorer.selectedFile) {
            // 如果没有选中的文件，保存当前编辑器的内容
            this.saveCurrentEditorContent();
            return;
        }

        const selectedFile = this.fileExplorer.selectedFile;
        const currentTab = this.getCurrentTab();
        let content = '';
        let targetFolder = '';

        // 根据当前编辑器获取内容
        switch (currentTab) {
            case 'html':
                content = this.editors.html.getValue();
                targetFolder = 'html';
                break;
            case 'css':
                content = this.editors.css.getValue();
                targetFolder = 'css';
                break;
            case 'js':
                content = this.editors.js.getValue();
                targetFolder = 'javascript';
                break;
            case 'data':
                content = this.editors.data.getValue();
                targetFolder = 'assets';
                break;
        }

        try {
            // 更新文件内容
            if (selectedFile.type === targetFolder ||
                (selectedFile.type === 'json' && currentTab === 'data') ||
                (selectedFile.type === 'csv' && currentTab === 'data')) {

                selectedFile.content = content;

                // 更新文件系统中的文件内容
                const folderFiles = this.fileExplorer.files[targetFolder];
                if (folderFiles) {
                    const fileIndex = folderFiles.findIndex(f => f.name === selectedFile.name);
                    if (fileIndex > -1) {
                        folderFiles[fileIndex].content = content;
                    }
                }

                this.logToConsole('info', `文件 "${selectedFile.name}" 已保存`);
            } else {
                throw new Error('文件类型与当前编辑器不匹配');
            }
        } catch (error) {
            this.logToConsole('error', `保存文件失败: ${error.message}`);
        }
    }

    /**
     * 保存当前编辑器内容到对应的文件对象中
     */
    saveCurrentEditorContentToFile() {
        const currentTab = this.getCurrentTab();

        if (!this.fileExplorer || !this.fileExplorer.selectedFile) {
            return; // 没有选中的文件，不需要保存
        }

        const selectedFile = this.fileExplorer.selectedFile;
        let content = '';
        let targetFolder = '';

        // 根据当前编辑器获取内容
        switch (currentTab) {
            case 'html':
                content = this.editors.html.getValue();
                targetFolder = 'html';
                break;
            case 'css':
                content = this.editors.css.getValue();
                targetFolder = 'css';
                break;
            case 'js':
                content = this.editors.js.getValue();
                targetFolder = 'javascript';
                break;
            case 'data':
                content = this.editors.data.getValue();
                targetFolder = 'assets';
                break;
        }

        // 更新文件内容
        if (selectedFile.type === targetFolder ||
            (selectedFile.type === 'json' && currentTab === 'data') ||
            (selectedFile.type === 'csv' && currentTab === 'data')) {

            // 更新选中文件的内容
            selectedFile.content = content;

            // 更新文件系统中的文件内容
            const folderFiles = this.fileExplorer.files[targetFolder];
            if (folderFiles) {
                const fileIndex = folderFiles.findIndex(f => f.name === selectedFile.name);
                if (fileIndex > -1) {
                    folderFiles[fileIndex].content = content;
                }
            }

            this.logToConsole('info', `已自动保存文件内容: ${selectedFile.name}`);
        }
    }

    /**
     * 保存当前编辑器内容（当没有选中文件时）
     */
    saveCurrentEditorContent() {
        const currentTab = this.getCurrentTab();
        let message = '';

        switch (currentTab) {
            case 'html':
                message = 'HTML内容已保存到内存';
                break;
            case 'css':
                message = 'CSS内容已保存到内存';
                break;
            case 'js':
                message = 'JavaScript内容已保存到内存';
                break;
            case 'data':
                message = '数据内容已保存到内存';
                break;
        }

        this.logToConsole('info', message);
        this.showTemporaryMessage(message, 'info');
    }

    /**
     * 从本地存储加载代码 - 最终修复版本
     */
    loadSavedCode() {
        try {
            const savedCode = localStorage.getItem('jsEditorCode');
            if (savedCode) {
                const codeData = JSON.parse(savedCode);

                // 恢复当前活跃文件夹
                if (codeData.currentFolder) {
                    this.currentTab = codeData.currentFolder;
                }

                // 总是加载编辑器内容，因为这时FileExplorer还没有初始化
                this.editors.html.setValue(codeData.html || '');
                this.editors.css.setValue(codeData.css || '');
                this.editors.js.setValue(codeData.js || '');

                // 保存文件系统数据供FileExplorer初始化时使用
                this._savedFileSystemData = codeData.fileSystem;

                this.updateStatus('已加载保存的代码');
                console.log('Editor: 已从localStorage加载保存的代码');
            } else {
                this.loadDefaultCode();
                console.log('Editor: 没有找到保存的代码，使用默认代码');
            }
        } catch (error) {
            console.error('加载保存的代码失败:', error);
            this.loadDefaultCode();
        }
    }

    /**
     * 恢复文件系统状态
     */
    restoreFileSystemState(fileSystemData) {
        if (!this.fileExplorer || !fileSystemData) return;

        try {
            // 恢复文件数据
            this.fileExplorer.files = fileSystemData.files || this.fileExplorer.files;
            this.fileExplorer.currentFolder = fileSystemData.currentFolder || 'html';
            this.fileExplorer.selectedFile = fileSystemData.selectedFile;

            // 刷新文件列表显示
            this.fileExplorer.showFolder(this.fileExplorer.currentFolder);

            // 更新文件夹按钮状态
            this.updateFolderButtons(this.fileExplorer.currentFolder);

            // 如果有选中的文件，打开该文件
            if (fileSystemData.selectedFile) {
                const selectedFileName = fileSystemData.selectedFile.name;
                const folderFiles = this.fileExplorer.files[this.fileExplorer.currentFolder];
                const fileToOpen = folderFiles.find(f => f.name === selectedFileName);

                if (fileToOpen) {
                    // 延迟打开选中的文件，确保文件列表已经刷新
                    setTimeout(() => {
                        this.fileExplorer.openFile(fileToOpen);
                        // 恢复选中状态
                        const fileItem = document.querySelector(`[data-file="${selectedFileName}"]`);
                        if (fileItem) {
                            this.fileExplorer.selectFile(fileToOpen, fileItem);
                        }
                    }, 200);
                }
            }

            this.logToConsole('info', '文件系统状态已恢复');
        } catch (error) {
            console.error('恢复文件系统状态失败:', error);
            this.logToConsole('warning', '文件系统状态恢复失败，使用默认状态');
        }
    }

    /**
     * 加载默认代码示例
     */
    loadDefaultCode() {
        this.editors.html.setValue(`<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
</head>
<body>
    <h1>欢迎使用JavaScript在线编辑器</h1>
    <p>这是一个支持HTML、CSS、JavaScript和D3.js的在线编辑器。</p>
    <div id="chart"></div>
</body>
</html>`);

        this.editors.css.setValue(`body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 30px;
}

#chart {
    width: 100%;
    height: 400px;
    border: 1px solid #ddd;
    margin-top: 20px;
}`);

        this.editors.js.setValue(`// JavaScript代码示例
console.log('欢迎使用JavaScript在线编辑器！');

// 添加一些交互功能 - 使用延迟执行确保DOM已加载
setTimeout(function() {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.addEventListener('click', function() {
            this.style.color = 'hsl(' + Math.random() * 360 + ', 100%, 50%)';
            console.log('标题颜色已更改！');
        });
        console.log('标题点击事件已绑定');
    } else {
        console.log('未找到h1元素');
    }
}, 100);

// 显示当前时间
function updateTime() {
    const now = new Date();
    console.log('当前时间:', now.toLocaleString());
}

// 每隔5秒显示一次时间
setInterval(updateTime, 5000);

// 页面加载完成提示
console.log('JavaScript代码执行完成！');`);

        // D3编辑器已被移除
        this.updateStatus('已加载默认示例');
    }

    /**
     * 显示导出选项对话框
     */
    exportCode() {
        this.showExportDialog();
    }

    /**
     * 显示导出选项对话框
     */
    showExportDialog() {
        const overlay = document.getElementById('exportDialogOverlay');
        const dialog = document.getElementById('exportDialog');

        if (overlay && dialog) {
            overlay.classList.add('active');
            dialog.classList.add('active');
            this.setupExportDialogEvents();
        }
    }

    /**
     * 隐藏导出选项对话框
     */
    hideExportDialog() {
        const overlay = document.getElementById('exportDialogOverlay');
        const dialog = document.getElementById('exportDialog');

        if (overlay && dialog) {
            overlay.classList.remove('active');
            dialog.classList.remove('active');
            this.removeExportDialogEvents();
        }
    }

    /**
     * 设置导出对话框事件监听器
     */
    setupExportDialogEvents() {
        const exportSingleHtml = document.getElementById('exportSingleHtml');
        const exportZipFile = document.getElementById('exportZipFile');
        const exportDialogCancel = document.getElementById('exportDialogCancel');
        const exportDialogOverlay = document.getElementById('exportDialogOverlay');

        // 导出单个HTML文件
        if (exportSingleHtml) {
            this.exportSingleHtmlHandler = () => {
                this.exportAsSingleHtml();
                this.hideExportDialog();
            };
            exportSingleHtml.addEventListener('click', this.exportSingleHtmlHandler);
        }

        // 导出ZIP压缩包
        if (exportZipFile) {
            this.exportZipFileHandler = () => {
                this.exportAsZipFile();
                this.hideExportDialog();
            };
            exportZipFile.addEventListener('click', this.exportZipFileHandler);
        }

        // 取消按钮
        if (exportDialogCancel) {
            this.exportDialogCancelHandler = () => this.hideExportDialog();
            exportDialogCancel.addEventListener('click', this.exportDialogCancelHandler);
        }

        // 点击遮罩关闭
        if (exportDialogOverlay) {
            this.exportDialogOverlayHandler = () => this.hideExportDialog();
            exportDialogOverlay.addEventListener('click', this.exportDialogOverlayHandler);
        }
    }

    /**
     * 移除导出对话框事件监听器
     */
    removeExportDialogEvents() {
        const exportSingleHtml = document.getElementById('exportSingleHtml');
        const exportZipFile = document.getElementById('exportZipFile');
        const exportDialogCancel = document.getElementById('exportDialogCancel');
        const exportDialogOverlay = document.getElementById('exportDialogOverlay');

        if (exportSingleHtml && this.exportSingleHtmlHandler) {
            exportSingleHtml.removeEventListener('click', this.exportSingleHtmlHandler);
        }
        if (exportZipFile && this.exportZipFileHandler) {
            exportZipFile.removeEventListener('click', this.exportZipFileHandler);
        }
        if (exportDialogCancel && this.exportDialogCancelHandler) {
            exportDialogCancel.removeEventListener('click', this.exportDialogCancelHandler);
        }
        if (exportDialogOverlay && this.exportDialogOverlayHandler) {
            exportDialogOverlay.removeEventListener('click', this.exportDialogOverlayHandler);
        }
    }

    /**
     * 导出为单个HTML文件
     */
    exportAsSingleHtml() {
        try {
            const html = this.editors.html.getValue();
            const css = this.editors.css.getValue();
            const js = this.editors.js.getValue();

            const exportContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出的项目</title>
    <style>
        ${css}
    </style>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    ${html}
    <script>
        ${js}
    </script>
</body>
</html>`;

            // 创建下载链接
            const blob = new Blob([exportContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `js-editor-export-${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.updateStatus('单个HTML文件已导出');
            this.logToConsole('info', '单个HTML文件导出成功');
        } catch (error) {
            this.updateStatus('导出失败');
            this.logToConsole('error', `导出单个HTML文件失败: ${error.message}`);
        }
    }

    /**
     * 导出为ZIP压缩包
     */
    exportAsZipFile() {
        try {
            // 检查JSZip是否可用
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip库未加载，请检查网络连接');
            }

            // 创建ZIP实例
            const zip = new JSZip();
            const timestamp = Date.now();

            // 获取当前编辑器内容
            const html = this.editors.html.getValue();
            const css = this.editors.css.getValue();
            const js = this.editors.js.getValue();

            // 创建基础文件结构
            const projectFolder = zip.folder(`js-editor-project-${timestamp}`);

            // 添加主要文件
            projectFolder.file('index.html', this.generateHtmlFile(html, css, js));
            projectFolder.file('style.css', css);
            projectFolder.file('script.js', js);

            // 如果有文件浏览器数据，导出所有文件
            if (this.fileExplorer && this.fileExplorer.files) {
                this.addFilesToZip(zip, this.fileExplorer.files, `js-editor-project-${timestamp}`);
            }

            // 添加README文件
            projectFolder.file('README.md', this.generateReadmeFile());

            // 生成ZIP文件并下载
            zip.generateAsync({ type: 'blob' }).then((blob) => {
                // 使用FileSaver.js保存文件
                if (typeof saveAs !== 'undefined') {
                    saveAs(blob, `js-editor-project-${timestamp}.zip`);
                } else {
                    // 降级方案：使用普通下载
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `js-editor-project-${timestamp}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                this.updateStatus('ZIP压缩包已导出');
                this.logToConsole('info', 'ZIP压缩包导出成功');
            }).catch((error) => {
                throw new Error(`生成ZIP文件失败: ${error.message}`);
            });

        } catch (error) {
            this.updateStatus('导出失败');
            this.logToConsole('error', `导出ZIP压缩包失败: ${error.message}`);
        }
    }

    /**
     * 生成HTML文件内容
     * @param {string} html - HTML内容
     * @param {string} css - CSS内容
     * @param {string} js - JavaScript内容
     * @returns {string} 完整的HTML文件内容
     */
    generateHtmlFile(html, css, js) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript在线编辑器项目</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    ${html}
    <script src="script.js"></script>
</body>
</html>`;
    }

    /**
     * 生成README文件内容
     * @returns {string} README文件内容
     */
    generateReadmeFile() {
        return `# JavaScript在线编辑器项目

这是从JavaScript在线编辑器导出的项目。

## 项目结构

- \`index.html\` - 主HTML文件
- \`style.css\` - 样式文件
- \`script.js\` - JavaScript文件
- \`README.md\` - 项目说明文档

## 使用方法

1. 直接打开 \`index.html\` 文件即可在浏览器中查看项目效果
2. 所有代码都已经分离到独立的文件中，便于修改和维护
3. 支持D3.js数据可视化功能

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- D3.js v7

## 导出信息

- 导出时间: ${new Date().toLocaleString('zh-CN')}
- 导出工具: JavaScript在线编辑器

---

*此项目由JavaScript在线编辑器自动生成*
`;
    }

    /**
     * 将文件浏览器中的文件添加到ZIP包中
     * @param {JSZip} zip - ZIP实例
     * @param {Object} files - 文件对象
     * @param {string} basePath - 基础路径
     */
    addFilesToZip(zip, files, basePath) {
        Object.keys(files).forEach(folderName => {
            if (files[folderName] && files[folderName].length > 0) {
                const folder = zip.folder(`${basePath}/${folderName}`);
                files[folderName].forEach(file => {
                    if (file.content) {
                        folder.file(file.name, file.content);
                    }
                });
            }
        });
    }

    /**
     * 清空控制台
     */
    clearConsole() {
        const console = document.getElementById('console');
        console.innerHTML = '';
    }

    /**
     * 切换控制台显示/隐藏状态
     */
    toggleConsole() {
        console.log('toggleConsole called');
        const consoleContainer = document.querySelector('.console-container');
        const editorSection = document.querySelector('.editor-section');
        const editorContainer = document.querySelector('.editor-container');
        const toggleBtn = document.getElementById('toggleConsole');

        if (!consoleContainer || !editorSection || !editorContainer || !toggleBtn) {
            console.error('toggleConsole: Missing elements');
            return;
        }

        const toggleIcon = toggleBtn.querySelector('i');

        // 检查当前状态
        const isCollapsed = consoleContainer.classList.contains('collapsed');
        console.log('Console is collapsed:', isCollapsed);

        if (isCollapsed) {
            // 显示控制台
            consoleContainer.classList.remove('collapsed');
            editorSection.classList.remove('console-collapsed');
            editorSection.classList.add('console-expanded');
            toggleIcon.className = 'fas fa-chevron-left';
            console.log('Console expanded, editor section updated');
        } else {
            // 隐藏控制台
            consoleContainer.classList.add('collapsed');
            editorSection.classList.remove('console-expanded');
            editorSection.classList.add('console-collapsed');
            toggleIcon.className = 'fas fa-chevron-right';
            console.log('Console collapsed, editor section updated');
        }

        // 强制重新调整编辑器尺寸以适应新的容器大小
        this.forceEditorResize();
    }

    /**
     * 恢复控制台显示状态
     */
    restoreConsole() {
        console.log('restoreConsole called');
        const consoleContainer = document.querySelector('.console-container');
        const editorSection = document.querySelector('.editor-section');
        const editorContainer = document.querySelector('.editor-container');
        const toggleBtn = document.getElementById('toggleConsole');

        if (!consoleContainer || !editorSection || !editorContainer || !toggleBtn) {
            console.error('restoreConsole: Missing elements');
            return;
        }

        const toggleIcon = toggleBtn.querySelector('i');

        // 显示控制台
        consoleContainer.classList.remove('collapsed');
        editorSection.classList.remove('console-collapsed');
        editorSection.classList.add('console-expanded');
        toggleIcon.className = 'fas fa-chevron-left';
        console.log('Console restored, editor section updated');

        // 强制重新调整编辑器尺寸以适应新的容器大小
        this.forceEditorResize();
    }

    /**
     * 向控制台输出日志
     * @param {string} type - 日志类型 (log, error, warning, info)
     * @param {...any} args - 日志内容
     */
    logToConsole(type, ...args) {
        const console = document.getElementById('console');
        const message = args.join(' ');
        const logElement = document.createElement('div');
        logElement.className = type;
        logElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        console.appendChild(logElement);
        console.scrollTop = console.scrollHeight;
    }

    /**
     * 切换全屏预览
     */
    toggleFullscreen() {
        const preview = document.getElementById('preview');
        if (!document.fullscreenElement) {
            preview.requestFullscreen().catch(err => {
                console.error('无法进入全屏模式:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * 加载D3.js示例
     * @param {string} example - 示例名称
     */
    loadD3Example(example) {
        // 保存当前状态到历史记录
        this.saveToHistory();

        // 更新按钮状态
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-example="${example}"]`).classList.add('active');

        // 加载对应的示例代码
        if (window.d3Examples && window.d3Examples[example]) {
            // D3编辑器已被移除
            console.log(`D3示例已加载: ${example}`);
        }
    }

    /**
     * 设置自动保存 - 增强版本
     */
    setAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveCode();
        }, 2000); // 减少到2秒，更频繁保存
    }

    /**
     * 更新光标位置显示
     */
    updateCursorPosition() {
        const editor = this.editors[this.currentTab];
        if (editor) {
            const cursor = editor.getCursor();
            // 光标位置信息在控制台显示，不再显示在状态栏
            console.log(`光标位置: 行 ${cursor.line + 1}, 列 ${cursor.ch + 1}`);
        }
    }

    /**
     * 更新文件大小显示
     */
    updateFileSize() {
        let totalSize = 0;
        Object.values(this.editors).forEach(editor => {
            totalSize += editor.getValue().length;
        });

        let sizeText = '代码大小: 0 字节';
        if (totalSize > 0) {
            if (totalSize < 1024) {
                sizeText = `代码大小: ${totalSize} 字节`;
            } else if (totalSize < 1024 * 1024) {
                sizeText = `代码大小: ${(totalSize / 1024).toFixed(1)} KB`;
            } else {
                sizeText = `代码大小: ${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
            }
        }
        // 在控制台显示文件大小信息
        console.log(sizeText);
    }

    /**
     * 更新保存状态
     * @param {string} status - 保存状态
     */
    updateSaveStatus(status, type = 'success') {
        const saveStatusEl = document.getElementById('saveStatus');
        const saveStatusText = document.getElementById('saveStatusText');

        if (saveStatusEl && saveStatusText) {
            if (status) {
                // 设置状态文本
                saveStatusText.textContent = status;

                // 设置状态类型
                saveStatusEl.className = 'save-status';
                if (type === 'saving') {
                    saveStatusEl.classList.add('saving');
                } else if (type === 'error') {
                    saveStatusEl.classList.add('error');
                }

                // 显示状态指示器
                saveStatusEl.style.display = 'flex';

                // 触发显示动画
                setTimeout(() => {
                    saveStatusEl.classList.add('show');
                }, 10);

                // 在控制台显示保存状态
                this.logToConsole('info', `保存状态: ${status}`);
            } else {
                // 隐藏状态指示器
                saveStatusEl.classList.remove('show');
                setTimeout(() => {
                    if (!saveStatusEl.classList.contains('show')) {
                        saveStatusEl.style.display = 'none';
                    }
                }, 300);
            }
        }

        // 在保存按钮旁显示状态（兼容性）
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            // 移除之前的状态
            const existingStatus = saveBtn.querySelector('.save-status');
            if (existingStatus) {
                existingStatus.remove();
            }

            // 添加新状态
            if (status) {
                const statusSpan = document.createElement('span');
                statusSpan.className = 'save-status';
                statusSpan.textContent = ` (${status})`;
                statusSpan.style.fontSize = '12px';
                statusSpan.style.opacity = '0.8';
                saveBtn.appendChild(statusSpan);

                // 3秒后自动清除状态
                setTimeout(() => {
                    if (statusSpan.parentNode) {
                        statusSpan.remove();
                    }
                }, 3000);
            }
        }
    }

    /**
     * 设置页面卸载前的自动保存
     */
    setupPageUnloadSave() {
        // 页面关闭前立即保存
        window.addEventListener('beforeunload', (event) => {
            this.saveCode();
        });

        // 页面隐藏时保存（如切换标签页）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveCode();
            }
        });
    }

    /**
     * 美化当前代码
     */
    beautifyCode() {
        try {
            const currentTab = this.currentTab;
            const editor = this.editors[currentTab];

            if (!editor) {
                this.updateStatus('没有可美化的代码');
                return;
            }

            let beautifiedCode = '';
            const originalCode = editor.getValue();

            switch (currentTab) {
                case 'html':
                    beautifiedCode = html_beautify(originalCode, {
                        indent_size: 2,
                        indent_char: ' ',
                        max_preserve_newlines: 2,
                        preserve_newlines: true,
                        keep_array_indentation: false,
                        break_chained_methods: false,
                        indent_scripts: 'normal',
                        brace_style: 'expand',
                        space_before_conditional: true,
                        unescape_strings: false,
                        jslint_happy: false,
                        end_with_newline: true,
                        wrap_line_length: 0
                    });
                    break;
                case 'css':
                    beautifiedCode = css_beautify(originalCode, {
                        indent_size: 2,
                        indent_char: ' ',
                        selector_separator: ' ',
                        preserve_newlines: true,
                        max_preserve_newlines: 2
                    });
                    break;
                case 'js':
                case 'd3':
                    beautifiedCode = js_beautify(originalCode, {
                        indent_size: 2,
                        indent_char: ' ',
                        max_preserve_newlines: 2,
                        preserve_newlines: true,
                        keep_array_indentation: false,
                        break_chained_methods: false,
                        indent_scripts: 'normal',
                        brace_style: 'expand',
                        space_before_conditional: true,
                        unescape_strings: false,
                        jslint_happy: false,
                        end_with_newline: true,
                        wrap_line_length: 0
                    });
                    break;
            }

            editor.setValue(beautifiedCode);
            this.updateStatus(`代码已美化 (${currentTab.toUpperCase()})`);

        } catch (error) {
            this.updateStatus('美化代码失败: ' + error.message);
        }
    }

    /**
     * 恢复到数据可视化模板
     */
    resetToTemplate() {
        // 直接恢复模板，不显示确认对话框

        // 恢复HTML样例 - 使用数据可视化模板
        this.editors.html.setValue(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据可视化平台</title>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 数据可视化平台</h1>
            <p>基于实时数据的交互式图表展示</p>
        </header>

        <main>
            <section class="controls">
                <button id="showTableBtn">📋 数据表格</button>
                <button id="showBarChartBtn">📊 柱状图</button>
                <button id="showPieChartBtn">🥧 饼图</button>
                <button id="showLineChartBtn">📈 折线图</button>
                <button id="refreshDataBtn">🔄 刷新数据</button>
            </section>

            <section class="info-panel">
                <div id="dataInfo" class="loading-message">
                    数据加载中，请稍候...
                </div>
            </section>

            <section class="chart-area">
                <div id="chartContainer" class="chart-container">
                    <div class="loading-message">
                        正在初始化图表系统...
                    </div>
                </div>
                <div id="tableContainer" class="table-container" style="display: none;">
                    <div class="loading-message">
                        正在准备数据表格...
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>
</html>`);

            // 恢复CSS样例 - 使用数据可视化页面样式（无渐变）
            this.editors.css.setValue(`/* 数据可视化平台样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f5f5f5;
    color: #333;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 30px;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    color: #2c3e50;
}

header p {
    font-size: 1.1em;
    color: #7f8c8d;
}

.controls {
    text-align: center;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.controls button {
    background: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    margin: 5px 10px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.controls button:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.controls button:active {
    transform: translateY(0);
}

.controls button.active {
    background: #e74c3c;
}

.info-panel {
    margin-bottom: 30px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.chart-area {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    min-height: 400px;
}

.chart-container {
    width: 100%;
    height: 400px;
}

.table-container {
    width: 100%;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
}

th {
    background: #34495e;
    color: white;
    font-weight: 600;
}

tr:hover {
    background: #f8f9fa;
}

.error-message {
    text-align: center;
    padding: 40px;
    background: #ffebee;
    border-radius: 10px;
    color: #c62828;
    margin: 20px 0;
}

.loading-message {
    text-align: center;
    padding: 40px;
    background: #e3f2fd;
    border-radius: 10px;
    color: #1976d2;
    margin: 20px 0;
}

.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }

    .controls button {
        display: block;
        width: 100%;
        margin: 5px 0;
    }

    header h1 {
        font-size: 2em;
    }

    .chart-area {
        padding: 20px;
    }
}`);

            // 恢复JavaScript样例 - 使用数据可视化脚本
            this.editors.js.setValue(`/**
 * 数据可视化脚本
 * 专门用于从 window.appData 读取数据并绘制图表
 */

// 全局变量
let currentData = null;
let currentView = 'bar'; // 当前显示的视图类型

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    // 绑定按钮事件
    const buttons = [
        { id: 'showTableBtn', handler: showTable, view: 'table' },
        { id: 'showBarChartBtn', handler: drawBarChart, view: 'bar' },
        { id: 'showPieChartBtn', handler: drawPieChart, view: 'pie' },
        { id: 'showLineChartBtn', handler: drawLineChart, view: 'line' },
        { id: 'refreshDataBtn', handler: refreshData, view: 'bar' }
    ];

    buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', () => {
                setActiveButton(btn.id);
                btn.handler();
                currentView = btn.view;
            });
        }
    });

    // 延迟加载数据
    setTimeout(loadDataAndDraw, 200);
});

/**
 * 设置活动按钮状态
 */
function setActiveButton(activeId) {
    document.querySelectorAll('.controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(activeId)?.classList.add('active');
}

/**
 * 加载数据并绘制默认图表
 */
function loadDataAndDraw() {
    try {
        if (!window.appData) {
            setTimeout(loadDataAndDraw, 100);
            return;
        }

        currentData = processData(window.appData);

        if (currentData.length === 0) {
            showError("没有找到有效的数据，请检查数据格式");
            return;
        }

        updateInfoPanel();
        drawBarChart(); // 默认显示柱状图
        setActiveButton('showBarChartBtn');

    } catch (error) {
        showError("数据加载失败: " + error.message);
    }
}

/**
 * 处理数据
 */
function processData(data) {
    if (!data) return [];

    // 处理语言流行度数据
    if (data.languagePopularity && Array.isArray(data.languagePopularity)) {
        return data.languagePopularity.map(item => ({
            name: item.language || item.编程语言 || 'Unknown',
            value: parseFloat(item.percentage || item.流行度百分比 || 0),
            users: parseFloat(item.users || item.开发者数量 || 0),
            growth: parseFloat(item.growth || item.增长率 || 0),
            salary: parseFloat(item.salary || item.平均薪资 || 0)
        }));
    }

    // 处理数组格式数据
    if (Array.isArray(data)) {
        return data.map((item, index) => ({
            name: item.language || item.编程语言 || item.name || \`项目\${index + 1}\`,
            value: parseFloat(item.percentage || item.流行度百分比 || item.value || item.数值 || 0),
            users: parseFloat(item.users || item.开发者数量 || 0),
            growth: parseFloat(item.growth || item.增长率 || 0),
            salary: parseFloat(item.salary || item.平均薪资 || 0)
        }));
    }

    return [];
}

/**
 * 更新信息面板
 */
function updateInfoPanel() {
    const infoPanel = document.getElementById("dataInfo");
    if (!infoPanel || !currentData || currentData.length === 0) return;

    const totalItems = currentData.length;
    const totalValue = currentData.reduce((sum, item) => sum + item.value, 0);
    const avgGrowth = currentData.reduce((sum, item) => sum + item.growth, 0) / totalItems;
    const maxSalary = Math.max(...currentData.map(item => item.salary));

    infoPanel.className = 'fade-in';
    infoPanel.innerHTML = \`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; padding: 20px;">
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #3498db;">\${totalItems}</div>
                <div style="color: #666;">数据项</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #3498db;">\${totalValue.toFixed(1)}%</div>
                <div style="color: #666;">总值</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #3498db;">\${avgGrowth.toFixed(1)}%</div>
                <div style="color: #666;">平均增长</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #3498db;">$\${(maxSalary/1000).toFixed(0)}K</div>
                <div style="color: #666;">最高薪资</div>
            </div>
        </div>
    \`;
}

/**
 * 显示表格
 */
function showTable() {
    hideAllCharts();
    const tableContainer = document.getElementById("tableContainer");
    const chartContainer = document.getElementById("chartContainer");

    if (!tableContainer || !currentData || currentData.length === 0) return;

    // 创建表头
    const headers = ['名称', '流行度', '用户数', '增长率', '薪资'];
    const headerRow = headers.map(h => \`<th>\${h}</th>\`).join('');

    // 创建数据行
    const dataRows = currentData.map(item => {
        return \`<tr>
            <td><strong>\${item.name}</strong></td>
            <td>\${item.value.toFixed(1)}%</td>
            <td>\${(item.users/1000000).toFixed(1)}M</td>
            <td>\${item.growth.toFixed(1)}%</td>
            <td>$\${(item.salary/1000).toFixed(0)}K</td>
        </tr>\`;
    }).join('');

    tableContainer.innerHTML = \`
        <table class="fade-in">
            <thead><tr>\${headerRow}</tr></thead>
            <tbody>\${dataRows}</tbody>
        </table>
    \`;

    tableContainer.style.display = 'block';
    chartContainer.style.display = 'none';
}

/**
 * 绘制柱状图
 */
function drawBarChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    // 创建简单的HTML柱状图
    const chartHTML = \`
        <div class="fade-in" style="padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 30px; color: #333;">编程语言流行度分布</h3>
            <div style="display: flex; align-items: end; height: 300px; gap: 15px; padding: 0 20px;">
                \${currentData.map(item => \`
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; transition: transform 0.3s ease;">
                        <div style="width: 100%; background: #3498db;
                                    height: \${(item.value / Math.max(...currentData.map(d => d.value))) * 250}px;
                                    border-radius: 8px 8px 0 0; position: relative;
                                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                                    transition: all 0.3s ease;"
                                    onmouseover="this.style.transform='scaleY(1.05)'; this.style.boxShadow='0 6px 20px rgba(52, 152, 219, 0.4)'"
                                    onmouseout="this.style.transform='scaleY(1)'; this.style.boxShadow='0 4px 15px rgba(52, 152, 219, 0.3)'">
                            <span style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                                       font-size: 14px; font-weight: bold; color: #3498db;">\${item.value.toFixed(1)}%</span>
                        </div>
                        <div style="margin-top: 15px; font-size: 12px; text-align: center; word-break: break-all; color: #333;">
                            \${item.name}
                        </div>
                    </div>
                \`).join('')}
            </div>
        </div>
    \`;

    chartContainer.innerHTML = chartHTML;
    chartContainer.style.display = 'block';
}

/**
 * 绘制饼图
 */
function drawPieChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    const total = currentData.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];

    // 创建简单的HTML饼图
    const chartHTML = \`
        <div class="fade-in" style="padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 30px; color: #333;">编程语言流行度占比</h3>
            <div style="display: flex; gap: 40px; align-items: center; justify-content: center;">
                <div style="flex: 0 0 auto;">
                    <div style="width: 280px; height: 280px; border-radius: 50%; background: conic-gradient(
                        \${currentData.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const startAngle = currentData.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
                            return \`\${colors[index]} \${startAngle}deg \${startAngle + (item.value / total) * 360}deg\`;
                        }).join(', ')}); position: relative; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                   background: white; border-radius: 50%; width: 120px; height: 120px;
                                   display: flex; align-items: center; justify-content: center; font-weight: bold;
                                   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                            <div style="text-align: center;">
                                <div style="font-size: 18px; color: #3498db;">总计</div>
                                <div style="font-size: 16px; color: #333;">\${total.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="flex: 0 0 auto;">
                    \${currentData.map((item, index) => \`
                        <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 8px; border-radius: 8px; background: rgba(255, 255, 255, 0.8); transition: all 0.3s ease;"
                             onmouseover="this.style.background='rgba(52, 152, 219, 0.1)'; this.style.transform='translateX(5px)'"
                             onmouseout="this.style.background='rgba(255, 255, 255, 0.8)'; this.style.transform='translateX(0)'">
                            <div style="width: 20px; height: 20px; background: \${colors[index]};
                                       border-radius: 4px; margin-right: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"></div>
                            <span style="font-size: 14px; color: #333; font-weight: 500;">\${item.name}: \${item.value.toFixed(1)}%</span>
                        </div>
                    \`).join('')}
                </div>
            </div>
        </div>
    \`;

    chartContainer.innerHTML = chartHTML;
    chartContainer.style.display = 'block';
}

/**
 * 绘制折线图
 */
function drawLineChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    const maxValue = Math.max(...currentData.map(d => Math.abs(d.growth)));
    const scale = maxValue > 0 ? 100 / maxValue : 1;

    // 创建简单的HTML折线图
    const chartHTML = \`
        <div class="fade-in" style="padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 30px; color: #333;">编程语言增长率趋势</h3>
            <div style="height: 350px; position: relative; border-left: 2px solid #3498db; border-bottom: 2px solid #3498db; margin: 0 20px; background: rgba(255, 255, 255, 0.5); border-radius: 8px;">
                <!-- 零线 -->
                <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 2px dashed #999; z-index: 1;"></div>

                <!-- 网格线 -->
                \${[25, 75].map(pos => \`
                    <div style="position: absolute; left: 0; right: 0; top: \${pos}%; border-top: 1px dashed #ddd; z-index: 1;"></div>
                \`).join('')}

                <!-- 数据点和连线 -->
                <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                    <!-- 连线 -->
                    <polyline points="\${currentData.map((item, index) => {
                        const x = (index / (currentData.length - 1)) * 90 + 5;
                        const y = 50 - (item.growth * scale);
                        return \`\${x}%,\${y}%\`;
                    }).join(' ')}"
                    style="fill: none; stroke: #3498db; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;" />

                    <!-- 数据点 -->
                    \${currentData.map((item, index) => {
                        const x = (index / (currentData.length - 1)) * 90 + 5;
                        const y = 50 - (item.growth * scale);
                        return \`
                            <circle cx="\${x}%" cy="\${y}%" r="8" fill="#3498db" stroke="white" stroke-width="3"
                                    style="cursor: pointer; transition: all 0.3s ease;"
                                    onmouseover="this.setAttribute('r', '10'); this.style.fill='#2980b9'"
                                    onmouseout="this.setAttribute('r', '8'); this.style.fill='#3498db'">
                                <title>\${item.name}: \${item.growth.toFixed(1)}%</title>
                            </circle>
                            <text x="\${x}%" y="\${y - 5}%" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">
                                \${item.growth.toFixed(1)}%
                            </text>
                        \`;
                    }).join('')}

                    <!-- X轴标签 -->
                    \${currentData.map((item, index) => {
                        const x = (index / (currentData.length - 1)) * 90 + 5;
                        return \`
                            <text x="\${x}%" y="95%" text-anchor="middle" font-size="12" fill="#666">
                                \${item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                            </text>
                        \`;
                    }).join('')}

                    <!-- Y轴标签 -->
                    <text x="2%" y="25%" text-anchor="start" font-size="11" fill="#999">\${maxValue.toFixed(0)}%</text>
                    <text x="2%" y="50%" text-anchor="start" font-size="11" fill="#999">0%</text>
                    <text x="2%" y="75%" text-anchor="start" font-size="11" fill="#999">-\${maxValue.toFixed(0)}%</text>
                </svg>
            </div>
            <div style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">
                增长率 (%) - 零线以上为正增长，零线以下为负增长
            </div>
        </div>
    \`;

    chartContainer.innerHTML = chartHTML;
    chartContainer.style.display = 'block';
}

/**
 * 刷新数据
 */
function refreshData() {
    loadDataAndDraw();
}

/**
 * 隐藏所有图表
 */
function hideAllCharts() {
    const chartContainer = document.getElementById("chartContainer");
    const tableContainer = document.getElementById("tableContainer");

    if (chartContainer) chartContainer.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'none';
}

/**
 * 显示错误信息
 */
function showError(message) {
    const chartContainer = document.getElementById("chartContainer");
    if (chartContainer) {
        chartContainer.innerHTML = \`<div class="error-message fade-in">错误: \${message}</div>\`;
        chartContainer.style.display = 'block';
    }
}

// 数据可视化脚本加载完成`);

            // D3.js样例已移除

            // 清空上传的文件
            this.uploadedFiles.images = [];
            this.uploadedFiles.files = [];

            // 清空控制台
            this.clearConsole();

            // 加载默认数据文件以供可视化使用
            if (this.fileExplorer) {
                this.loadDefaultDataFiles();
                // 等待数据加载完成后再运行代码
                setTimeout(() => this.runCode(), 500);
            } else {
                // 如果文件浏览器未初始化，直接运行代码
                this.runCode();
            }

            this.updateStatus('已恢复到数据可视化模板');
    }

    /**
     * 处理文件上传
     * @param {Event} event - 文件上传事件
     */
    handleFileUpload(event) {
        const files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                const fileName = file.name.toLowerCase();

                // 检查是否为图片文件
                if (file.type.startsWith('image/')) {
                    // 图片文件处理 - 使用统一的文件上传逻辑
                    this.handleImageFileUpload(file, content, fileName);
                    return;
                }

                // 根据当前文件夹（编辑器）决定文件加载位置
                this.loadFileToCurrentFolder(file, content, fileName);

                // 自动运行代码
                this.runCode();
            };

            // 根据文件类型选择读取方式
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }

        // 重置文件输入
        event.target.value = '';
    }

    /**
     * 处理图片文件上传
     * @param {File} file - 图片文件
     * @param {string} content - 图片内容（base64）
     * @param {string} fileName - 文件名
     */
    handleImageFileUpload(file, content, fileName) {
        try {
            // 获取当前选中的文件夹
            const currentFolder = this.getCurrentFolder();

            // 保存图片信息到编辑器
            this.uploadedFiles.images = this.uploadedFiles.images || [];
            this.uploadedFiles.images.push({
                name: file.name,
                url: content,
                size: file.size,
                folder: currentFolder
            });

            // 如果存在文件浏览器，将图片添加到对应文件夹中
            if (this.fileExplorer && this.fileExplorer.files) {
                // 图片通常添加到assets文件夹
                const targetFolder = currentFolder === 'assets' ? 'assets' : 'assets';

                // 创建图片文件对象
                const imageFile = {
                    name: file.name,
                    type: 'image',
                    icon: 'fas fa-image',
                    content: content, // base64内容
                    size: file.size,
                    uploaded: true,
                    isImage: true
                };

                // 确保目标文件夹存在
                if (!this.fileExplorer.files[targetFolder]) {
                    this.fileExplorer.files[targetFolder] = [];
                }

                // 检查文件是否已存在
                const existingFileIndex = this.fileExplorer.files[targetFolder].findIndex(
                    f => f.name.toLowerCase() === file.name.toLowerCase()
                );

                if (existingFileIndex > -1) {
                    // 文件已存在，询问是否覆盖
                    const shouldReplace = confirm(`图片 "${file.name}" 已存在，是否要覆盖？`);
                    if (shouldReplace) {
                        this.fileExplorer.files[targetFolder][existingFileIndex] = imageFile;
                        this.logToConsole('info', `图片 "${file.name}" 已覆盖`);
                    } else {
                        this.logToConsole('info', `图片上传已取消: ${file.name}`);
                        return;
                    }
                } else {
                    // 添加新图片
                    this.fileExplorer.files[targetFolder].push(imageFile);
                    this.logToConsole('info', `图片 "${file.name}" 已添加到 ${targetFolder} 文件夹`);
                }

                // 刷新assets文件夹显示
                this.fileExplorer.showFolder(targetFolder);

                // 询问是否要在HTML中插入图片标签
                const shouldInsert = confirm(`是否要在HTML编辑器中插入图片 "${file.name}"？`);
                if (shouldInsert) {
                    this.insertImageToHTML(content, file.name);
                }

                this.updateStatus(`图片已上传: ${file.name}`);
            } else {
                // 降级方案：直接插入到HTML编辑器
                this.insertImageToHTML(content, file.name);
                this.updateStatus(`图片已上传: ${file.name}`);
            }

        } catch (error) {
            this.logToConsole('error', `图片上传失败: ${error.message}`);
            this.updateStatus('图片上传失败');
        }
    }

    /**
     * 将文件加载到当前文件夹（编辑器）
     * @param {File} file - 文件对象
     * @param {string} content - 文件内容
     * @param {string} fileName - 文件名
     */
    loadFileToCurrentFolder(file, content, fileName) {
        try {
            // 获取当前选中的文件夹
            const currentFolder = this.getCurrentFolder();

            // 如果存在文件浏览器，将文件添加到对应文件夹中
            if (this.fileExplorer && this.fileExplorer.files) {
                this.addFileToFileExplorer(file, content, fileName, currentFolder);
                this.logToConsole('info', `文件 "${file.name}" 已添加到 ${currentFolder} 文件夹`);
                this.updateStatus(`文件已上传: ${file.name}`);
            } else {
                // 降级方案：如果没有文件浏览器，使用原有逻辑
                this.loadFileToEditorFallback(file, content, fileName);
            }

            // 刷新当前文件夹显示
            if (this.fileExplorer) {
                this.fileExplorer.showFolder(currentFolder);
            }

        } catch (error) {
            this.logToConsole('error', `文件上传失败: ${error.message}`);
            this.updateStatus('文件上传失败');
        }
    }

    /**
     * 获取当前文件夹
     */
    getCurrentFolder() {
        const activeBtn = document.querySelector('.folder-btn.active[data-folder]');
        return activeBtn ? activeBtn.dataset.folder : 'html';
    }

    /**
     * 添加文件到文件浏览器
     * @param {File} file - 上传的文件
     * @param {string} content - 文件内容
     * @param {string} fileName - 文件名
     * @param {string} folder - 目标文件夹
     */
    addFileToFileExplorer(file, content, fileName, folder) {
        // 获取文件类型和图标
        const fileType = this.getFileType(fileName);
        const fileIcon = this.getFileIcon(fileType);

        // 创建文件对象
        const newFile = {
            name: file.name,
            type: fileType,
            icon: fileIcon,
            content: content,
            size: file.size,
            uploaded: true
        };

        // 确保目标文件夹存在
        if (!this.fileExplorer.files[folder]) {
            this.fileExplorer.files[folder] = [];
        }

        // 检查文件是否已存在
        const existingFileIndex = this.fileExplorer.files[folder].findIndex(
            f => f.name.toLowerCase() === file.name.toLowerCase()
        );

        if (existingFileIndex > -1) {
            // 文件已存在，询问是否覆盖
            const shouldReplace = confirm(`文件 "${file.name}" 已存在，是否要覆盖？`);
            if (shouldReplace) {
                this.fileExplorer.files[folder][existingFileIndex] = newFile;
                this.logToConsole('info', `文件 "${file.name}" 已覆盖`);
            } else {
                this.logToConsole('info', `文件上传已取消: ${file.name}`);
                return;
            }
        } else {
            // 添加新文件
            this.fileExplorer.files[folder].push(newFile);
            this.logToConsole('info', `文件 "${file.name}" 已添加`);
        }

        // 如果文件类型对应编辑器，询问是否要打开编辑
        if (['html', 'css', 'javascript'].includes(fileType)) {
            const shouldOpen = confirm(`是否要在编辑器中打开文件 "${file.name}"？`);
            if (shouldOpen) {
                this.openFileInEditor(fileType, content, newFile);
            }
        }
    }

    /**
     * 在编辑器中打开文件
     * @param {string} fileType - 文件类型
     * @param {string} content - 文件内容
     * @param {Object} file - 文件对象
     */
    openFileInEditor(fileType, content, file) {
        // 处理数据文件
        if (fileType === 'json' || fileType === 'csv') {
            // 切换到数据文件夹
            this.switchFolderEditor('assets');

            // 使用数据预览器预览数据
            if (this.dataPreviewer) {
                this.dataPreviewer.previewData(content, file.name, fileType);
            }

            this.logToConsole('info', `数据文件 "${file.name}" 已在预览面板中打开`);
            return;
        }

        // 根据文件类型切换到对应编辑器
        let targetTab = 'html';
        switch (fileType) {
            case 'css':
                targetTab = 'css';
                break;
            case 'javascript':
                targetTab = 'js';
                break;
            case 'html':
            default:
                targetTab = 'html';
                break;
        }

        // 切换到对应编辑器
        this.switchFolderEditor(this.getCurrentFolder());

        // 设置编辑器内容
        if (this.editors[targetTab]) {
            this.editors[targetTab].setValue(content);
        }

        this.logToConsole('info', `文件 "${file.name}" 已在编辑器中打开`);
    }

    /**
     * 降级方案：直接加载到编辑器（当文件浏览器不可用时）
     * @param {File} file - 上传的文件
     * @param {string} content - 文件内容
     * @param {string} fileName - 文件名
     */
    loadFileToEditorFallback(file, content, fileName) {
        // 根据文件扩展名决定加载到哪个编辑器
        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
            this.editors.html.setValue(content);
            this.switchFolderEditor('html');
            this.updateStatus(`已加载HTML文件: ${file.name}`);
        } else if (fileName.endsWith('.css')) {
            this.editors.css.setValue(content);
            this.switchFolderEditor('css');
            this.updateStatus(`已加载CSS文件: ${file.name}`);
        } else if (fileName.endsWith('.js')) {
            this.editors.js.setValue(content);
            this.switchFolderEditor('javascript');
            this.updateStatus(`已加载JavaScript文件: ${file.name}`);
        } else {
            // 其他文件类型加载到HTML编辑器作为文本
            this.editors.html.setValue(`<pre>${content}</pre>`);
            this.switchFolderEditor('html');
            this.updateStatus(`已加载文件: ${file.name}`);
        }
    }

    /**
     * 获取文件类型
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
            'csv': 'csv',
            'xml': 'xml',
            'txt': 'text',
            'md': 'text',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image'
        };
        return typeMap[extension] || 'text';
    }

    /**
     * 获取文件图标
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
     * 在HTML编辑器中插入图片
     * @param {string} imageSrc - 图片源（base64）
     * @param {string} fileName - 文件名
     */
    insertImageToHTML(imageSrc, fileName) {
        const currentHTML = this.editors.html.getValue();
        const imgTag = `<img src="${imageSrc}" alt="${fileName}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;

        if (currentHTML.trim() === '' || currentHTML.includes('欢迎使用JavaScript在线编辑器') && currentHTML.includes('<div id="chart"></div>')) {
            // 如果编辑器为空或只有默认内容，创建一个图片展示页面
            this.editors.html.setValue(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图片展示</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
        }
        img:hover {
            transform: scale(1.02);
        }
        .image-caption {
            margin-top: 15px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>图片展示</h1>
        ${imgTag}
        <p class="image-caption">${fileName}</p>
    </div>
</body>
</html>`);
        } else {
            // 在现有HTML中追加图片
            const bodyCloseIndex = currentHTML.lastIndexOf('</body>');
            if (bodyCloseIndex !== -1) {
                const newHTML = currentHTML.slice(0, bodyCloseIndex) +
                    `    <div style="margin: 20px 0; text-align: center;">
        <h3>${fileName}</h3>
        ${imgTag}
    </div>\n` +
                    currentHTML.slice(bodyCloseIndex);
                this.editors.html.setValue(newHTML);
            } else {
                // 如果没有找到body标签，直接追加到末尾
                this.editors.html.setValue(currentHTML + '\n' + imgTag);
            }
        }

        // 切换到HTML编辑器
        this.switchFolderEditor('html');
        this.logToConsole('info', `图片 "${fileName}" 已插入到HTML编辑器`);
    }

    /**
     * 加载文件到HTML编辑器
     */
    loadFileToHTMLEditor(file, content, fileName) {
        if (fileName.endsWith('.md')) {
            // Markdown文件转换为HTML
            const markdownAsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background-color: #f5f5f5;
        }
        .markdown-content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="markdown-content">
        <h1>${file.name}</h1>
        <pre>${content}</pre>
    </div>
</body>
</html>`;
            this.editors.html.setValue(markdownAsHtml);
        } else {
            this.editors.html.setValue(content);
        }
        this.switchTab('html');
        this.updateStatus(`已加载文件到HTML文件夹: ${file.name}`);
    }

    /**
     * 加载文件到CSS编辑器
     */
    loadFileToCSSEditor(file, content, fileName) {
        if (fileName.endsWith('.css')) {
            this.editors.css.setValue(content);
        } else {
            // 非CSS文件转换为CSS注释
            this.editors.css.setValue(`/* ${file.name} */\n/* 文件内容预览：\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''} */`);
        }
        this.switchTab('css');
        this.updateStatus(`已加载文件到CSS文件夹: ${file.name}`);
    }

    /**
     * 加载文件到JavaScript编辑器
     */
    loadFileToJSEditor(file, content, fileName) {
        if (fileName.endsWith('.js') || fileName.endsWith('.json')) {
            this.editors.js.setValue(content);
        } else {
            // 非JS文件转换为JavaScript字符串
            const escapedContent = content.replace(/`/g, '\\`').replace(/\${/g, '\\${');
            this.editors.js.setValue(`// ${file.name}\nconst fileContent = \`${escapedContent}\`;\nconsole.log('文件内容已加载:', '${file.name}');`);
        }
        this.switchTab('js');
        this.updateStatus(`已加载文件到JavaScript文件夹: ${file.name}`);
    }

    /**
     * 加载文件到资源文件夹
     */
    loadFileToAssets(file, content, fileName) {
        // 资源文件夹主要用于存储，切换到HTML编辑器显示预览
        this.editors.html.setValue(`<!DOCTYPE html>
<html>
<head>
    <title>资源预览 - ${file.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .preview {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .file-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="preview">
        <div class="file-info">
            <h2>📁 资源文件</h2>
            <p><strong>文件名:</strong> ${file.name}</p>
            <p><strong>文件大小:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>文件类型:</strong> ${file.type || '未知'}</p>
        </div>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">${content.substring(0, 1000)}${content.length > 1000 ? '\n\n... (内容已截断)' : ''}</pre>
    </div>
</body>
</html>`);
        this.switchTab('html');
        this.updateStatus(`已加载资源文件: ${file.name}`);
    }

    /**
     * 根据文件扩展名加载文件（默认行为）
     */
    loadFileByExtension(file, content, fileName) {
        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
            this.loadFileToHTMLEditor(file, content, fileName);
        } else if (fileName.endsWith('.css')) {
            this.loadFileToCSSEditor(file, content, fileName);
        } else if (fileName.endsWith('.js')) {
            this.loadFileToJSEditor(file, content, fileName);
        } else if (fileName.endsWith('.json')) {
            this.loadFileToJSEditor(file, content, fileName);
        } else if (fileName.endsWith('.md')) {
            this.loadFileToHTMLEditor(file, content, fileName);
        } else {
            // 文本文件加载到当前编辑器
            const currentEditor = this.editors[this.currentTab];
            if (currentEditor) {
                currentEditor.setValue(content);
                this.updateStatus(`已加载文本文件: ${file.name}`);
            }
        }
    }

    /**
     * 处理图片上传
     * @param {Event} event - 图片上传事件
     */
    handleImageUpload(event) {
        const files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // 检查是否为图片文件
            if (!file.type.startsWith('image/')) {
                this.updateStatus(`跳过非图片文件: ${file.name}`);
                continue;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const imageUrl = e.target.result;

                // 保存图片信息
                this.uploadedFiles.images.push({
                    name: file.name,
                    url: imageUrl,
                    size: file.size
                });

                // 在HTML编辑器中插入图片标签
                const currentHTML = this.editors.html.getValue();
                const imgTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto;">`;

                if (currentHTML.trim() === '') {
                    this.editors.html.setValue(`<!DOCTYPE html>
<html>
<head>
    <title>图片展示</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        img { margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <h1>上传的图片</h1>
    ${imgTag}
</body>
</html>`);
                } else {
                    // 在现有HTML中追加图片
                    const bodyCloseIndex = currentHTML.lastIndexOf('</body>');
                    if (bodyCloseIndex !== -1) {
                        const newHTML = currentHTML.slice(0, bodyCloseIndex) +
                            `    <div style="margin: 20px 0;">
        <h3>${file.name}</h3>
        ${imgTag}
    </div>\n` +
                            currentHTML.slice(bodyCloseIndex);
                        this.editors.html.setValue(newHTML);
                    } else {
                        // 如果没有找到body标签，直接追加到末尾
                        this.editors.html.setValue(currentHTML + '\n' + imgTag);
                    }
                }

                this.switchTab('html');
                this.updateStatus(`已上传图片: ${file.name}`);

                // 自动运行代码
                this.runCode();
            };

            reader.readAsDataURL(file);
        }

        // 重置文件输入
        event.target.value = '';
    }

    /**
     * 设置分隔条拖拽功能
     */
    setupResizeDivider() {
        const divider = document.getElementById('resizeDivider');
        const editorSection = document.querySelector('.editor-section');
        const mainContent = document.querySelector('.main-content');

        if (!divider || !editorSection || !mainContent) {
            console.error('分隔条拖拽初始化失败：缺少必要元素');
            return;
        }

        let isDragging = false;
        let startX = 0;
        let startWidth = 0;
        let containerWidth = 0;

        // 开始拖拽
        const startDrag = (e) => {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startWidth = editorSection.offsetWidth;
            containerWidth = mainContent.offsetWidth;

            divider.classList.add('active');
            document.body.classList.add('resizing');
            this.showWidthIndicator(startWidth);

            // 简化的全局事件处理
            const handleMove = (e) => {
                if (!isDragging) return;

                const currentX = e.clientX || (e.touches && e.touches[0].clientX);
                const deltaX = currentX - startX;
                let newWidth = startWidth + deltaX;

                // 限制宽度范围
                const minWidth = 200;
                const maxWidth = containerWidth - 200;
                newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

                // 应用新宽度
                const percent = (newWidth / containerWidth) * 100;
                editorSection.style.width = percent + '%';

                // 更新指示器
                this.updateWidthIndicator(newWidth, containerWidth);

                // 节流刷新编辑器
                clearTimeout(this.resizeRefreshTimer);
                this.resizeRefreshTimer = setTimeout(() => {
                    this.refreshEditors();
                }, 16); // ~60fps
            };

            const endDrag = () => {
                if (!isDragging) return;
                isDragging = false;
                divider.classList.remove('active');
                document.body.classList.remove('resizing');
                this.hideWidthIndicator();
                this.saveLayoutWidth();

                clearTimeout(this.resizeRefreshTimer);
                this.refreshEditors();

                // 移除事件监听
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', endDrag);
                document.removeEventListener('touchmove', handleMove);
                document.removeEventListener('touchend', endDrag);
            };

            // 添加事件监听
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchmove', handleMove, { passive: true });
            document.addEventListener('touchend', endDrag);
        };

        // 绑定事件
        divider.addEventListener('mousedown', startDrag);
        divider.addEventListener('touchstart', (e) => startDrag(e.touches[0]), { passive: true });
    }

    /**
     * 显示宽度指示器
     */
    showWidthIndicator(width) {
        // 移除已存在的指示器
        this.hideWidthIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'width-indicator';
        indicator.id = 'widthIndicator';
        document.body.appendChild(indicator);

        this.updateWidthIndicator(width, this.resizeState.containerWidth);
    }

    /**
     * 更新宽度指示器
     */
    updateWidthIndicator(editorWidth, totalWidth) {
        const indicator = document.getElementById('widthIndicator');
        if (!indicator) return;

        const editorPercent = Math.round((editorWidth / totalWidth) * 100);
        const previewPercent = Math.round(((totalWidth - editorWidth) / totalWidth) * 100);

        indicator.textContent = `编辑器: ${editorPercent}% | 预览: ${previewPercent}%`;
        indicator.classList.add('visible');
    }

    /**
     * 隐藏宽度指示器
     */
    hideWidthIndicator() {
        const indicator = document.getElementById('widthIndicator');
        if (indicator) {
            indicator.classList.remove('visible');
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 200);
        }
    }

    /**
     * 保存布局宽度到本地存储
     */
    saveLayoutWidth() {
        const editorSection = document.querySelector('.editor-section');
        if (editorSection) {
            const widthPercent = (editorSection.offsetWidth / document.querySelector('.main-content').offsetWidth) * 100;
            localStorage.setItem('editorWidthPercent', widthPercent.toString());
        }
    }

    /**
     * 从本地存储加载布局宽度
     */
    loadLayoutWidth() {
        const savedWidth = localStorage.getItem('editorWidthPercent');
        if (savedWidth) {
            const editorSection = document.querySelector('.editor-section');
            if (editorSection) {
                editorSection.style.width = savedWidth + '%';
            }
        }
    }

    /**
     * 刷新所有CodeMirror编辑器
     */
    refreshEditors() {
        if (this.editors && typeof this.editors === 'object') {
            Object.values(this.editors).forEach(editor => {
                if (editor && typeof editor.refresh === 'function') {
                    editor.refresh();
                }
            });
        }
    }

    /**
     * 更新状态信息
     * @param {string} message - 状态消息
     */
    updateStatus(message) {
        // 状态信息在控制台显示
        console.log(`状态: ${message}`);
    }

    /**
     * 强制重新调整所有编辑器尺寸以适应容器变化
     */
    forceEditorResize() {
        setTimeout(() => {
            Object.values(this.editors).forEach(editor => {
                if (editor) {
                    // 强制重新计算尺寸
                    editor.refresh();

                    // 延迟重新设置尺寸确保容器已调整
                    setTimeout(() => {
                        const container = editor.getWrapperElement().parentElement;
                        if (container) {
                            // 获取容器的实际高度
                            const containerHeight = container.clientHeight;
                            // 重新设置编辑器尺寸
                            editor.setSize(null, containerHeight);
                            // 再次刷新确保生效
                            editor.refresh();

                            // 强制更新CodeMirror的滚动条
                            const scroller = editor.getScrollerElement();
                            if (scroller) {
                                scroller.style.height = containerHeight + 'px';
                            }
                        }
                    }, 100);
                }
            });
        }, 50);
    }

    /**
     * 插入JSON图表示例代码
     */
    insertChartExample() {
        const exampleCode = `// D3.js 柱状图示例
const margin = {top: 20, right: 30, bottom: 40, left: 90};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// 创建SVG容器
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", \`translate(\${margin.left},\${margin.top})\`);

// 示例数据
const data = [
    {name: "产品A", value: 30},
    {name: "产品B", value: 80},
    {name: "产品C", value: 45},
    {name: "产品D", value: 60},
    {name: "产品E", value: 20}
];

// 设置比例尺
const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.name))
    .padding(0.1);

const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(data, d => d.value)]);

// 创建柱状图
svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.name))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value))
    .attr("fill", "#3498db");

// 添加X轴
svg.append("g")
    .attr("transform", \`translate(0,\${height})\`)
    .call(d3.axisBottom(x));

// 添加Y轴
svg.append("g")
    .call(d3.axisLeft(y));

// 添加标签
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("数值");

console.log("D3.js 柱状图已创建");`;

        // 切换到JavaScript编辑器
        this.switchFolderEditor('javascript');
        this.editors.js.setValue(exampleCode);
        this.logToConsole('info', '已插入D3.js图表示例代码');
    }

    /**
     * 插入CSV图表示例代码
     */
    insertCsvChartExample() {
        const exampleCode = `// Chart.js 图表示例（需要先引入Chart.js库）
// 在HTML中添加: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

const ctx = document.getElementById('chart').getContext('2d');

// 示例CSV数据处理
const csvData = \`月份,销售额,利润
1月,12000,3600
2月,15000,4500
3月,18000,5400
4月,16000,4800
5月,20000,6000
6月,22000,6600\`;

// 解析CSV数据
const lines = csvData.trim().split('\\n');
const headers = lines[0].split(',');
const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return {
        month: values[0],
        sales: parseInt(values[1]),
        profit: parseInt(values[2])
    };
});

// 创建图表
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data.map(d => d.month),
        datasets: [{
            label: '销售额',
            data: data.map(d => d.sales),
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
        }, {
            label: '利润',
            data: data.map(d => d.profit),
            backgroundColor: '#e74c3c',
            borderColor: '#c0392b',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '金额 (元)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: '月份'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: '月度销售数据分析'
            },
            legend: {
                display: true,
                position: 'top'
            }
        }
    }
});

console.log('Chart.js 图表已创建');`;

        // 切换到JavaScript编辑器
        this.switchFolderEditor('javascript');
        this.editors.js.setValue(exampleCode);
        this.logToConsole('info', '已插入Chart.js CSV图表示例代码');
    }

    /**
     * 启用CSV实时编辑
     * @param {string} csvData - CSV数据
     * @param {string} fileName - 文件名
     */
    enableCsvLiveEdit(csvData, fileName) {
        // 切换到数据文件夹
        this.switchFolderEditor('assets');

        // 创建可编辑的CSV表格
        const parsedData = this.dataPreviewer.parseCsv(csvData);
        let editableTable = '<div class="csv-editor-container">';
        editableTable += '<h4>实时编辑CSV数据 - ' + fileName + '</h4>';
        editableTable += '<div class="csv-edit-controls">';
        editableTable += '<button onclick="window.jsEditor.saveCsvChanges(\'' + fileName + '\')" class="btn btn-primary btn-small">保存更改</button>';
        editableTable += '<button onclick="window.jsEditor.resetCsvData(\'' + fileName + '\')" class="btn btn-secondary btn-small">重置</button>';
        editableTable += '</div>';
        editableTable += '<table class="csv-edit-table" contenteditable="true" id="csvEditTable">';

        // 创建表格
        for (let i = 0; i < parsedData.length; i++) {
            editableTable += '<tr>';
            for (let j = 0; j < parsedData[i].length; j++) {
                editableTable += '<td contenteditable="true" data-row="' + i + '" data-col="' + j + '">' +
                    this.dataPreviewer.escapeHtml(parsedData[i][j]) + '</td>';
            }
            editableTable += '</tr>';
        }

        editableTable += '</table>';
        editableTable += '<div class="csv-edit-info">';
        editableTable += '<p><small>💡 直接点击单元格进行编辑，按Tab键切换到下一个单元格</small></p>';
        editableTable += '</div>';
        editableTable += '</div>';

        // 更新数据预览内容
        const content = document.getElementById('dataPreviewContent');
        if (content) {
            content.innerHTML = editableTable;

            // 添加编辑事件监听器
            this.setupCsvEditListeners();

            // 保存原始数据
            this.originalCsvData = csvData;
            this.currentCsvFileName = fileName;
        }

        this.logToConsole('info', 'CSV实时编辑已启用 - ' + fileName);
    }

    /**
     * 设置CSV编辑事件监听器
     */
    setupCsvEditListeners() {
        const table = document.getElementById('csvEditTable');
        if (!table) return;

        // 单元格编辑事件
        table.addEventListener('input', (e) => {
            if (e.target.tagName === 'TD') {
                this.updateCsvPreview();
            }
        });

        // 键盘导航
        table.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'TD') {
                const cell = e.target;
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);

                switch (e.key) {
                    case 'Tab':
                        e.preventDefault();
                        this.navigateToCell(row, col, e.shiftKey);
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.navigateToCell(row + 1, col, false);
                        break;
                }
            }
        });
    }

    /**
     * 导航到指定单元格
     * @param {number} row - 行号
     * @param {number} col - 列号
     * @param {boolean} reverse - 是否反向导航
     */
    navigateToCell(row, col, reverse = false) {
        const table = document.getElementById('csvEditTable');
        if (!table) return;

        const cells = table.querySelectorAll('td');
        let targetCell = null;

        if (reverse) {
            // 向前导航
            for (let i = cells.length - 1; i >= 0; i--) {
                const cellRow = parseInt(cells[i].dataset.row);
                const cellCol = parseInt(cells[i].dataset.col);
                if (cellRow < row || (cellRow === row && cellCol < col)) {
                    targetCell = cells[i];
                    break;
                }
            }
        } else {
            // 向后导航
            for (let i = 0; i < cells.length; i++) {
                const cellRow = parseInt(cells[i].dataset.row);
                const cellCol = parseInt(cells[i].dataset.col);
                if (cellRow > row || (cellRow === row && cellCol > col)) {
                    targetCell = cells[i];
                    break;
                }
            }
        }

        if (targetCell) {
            targetCell.focus();
            // 选中全部文本
            const range = document.createRange();
            range.selectNodeContents(targetCell);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * 更新CSV预览
     */
    updateCsvPreview() {
        const table = document.getElementById('csvEditTable');
        if (!table) return;

        // 收集编辑后的数据
        const rows = [];
        const trs = table.querySelectorAll('tr');

        trs.forEach(tr => {
            const cells = tr.querySelectorAll('td');
            const rowData = [];
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            if (rowData.length > 0) {
                rows.push(rowData);
            }
        });

        // 转换为CSV格式
        const csvContent = rows.map(row =>
            row.map(cell => {
                // 如果包含逗号或引号，需要用引号包围
                if (cell.includes(',') || cell.includes('"')) {
                    return '"' + cell.replace(/"/g, '""') + '"';
                }
                return cell;
            }).join(',')
        ).join('\n');

        // 更新当前数据
        this.currentCsvData = csvContent;

        // 更新统计信息
        if (this.dataPreviewer) {
            this.dataPreviewer.updateStats(csvContent, 'csv');
        }
    }

    /**
     * 保存CSV更改
     * @param {string} fileName - 文件名
     */
    saveCsvChanges(fileName) {
        if (!this.currentCsvData) {
            this.logToConsole('error', '没有可保存的更改');
            return;
        }

        // 更新文件浏览器中的文件内容
        if (this.fileExplorer && this.fileExplorer.files && this.fileExplorer.files.assets) {
            const fileIndex = this.fileExplorer.files.assets.findIndex(
                f => f.name === fileName
            );

            if (fileIndex > -1) {
                this.fileExplorer.files.assets[fileIndex].content = this.currentCsvData;
                this.logToConsole('info', 'CSV文件已保存: ' + fileName);
                this.showTemporaryMessage('CSV文件已保存', 'success');
            }
        }
    }

    /**
     * 重置CSV数据
     * @param {string} fileName - 文件名
     */
    resetCsvData(fileName) {
        if (!this.originalCsvData) {
            this.logToConsole('error', '没有可重置的数据');
            return;
        }

        // 重新启用编辑
        this.enableCsvLiveEdit(this.originalCsvData, fileName);
        this.logToConsole('info', 'CSV数据已重置: ' + fileName);
    }
}

/**
 * 监听来自iframe的控制台消息
 */
window.addEventListener('message', function(event) {
    if (event.data.type === 'console') {
        const editor = window.jsEditor;
        if (editor) {
            editor.logToConsole(event.data.method, ...event.data.args);
        }
    }
});

/**
 * 页面加载完成后初始化编辑器
 */
document.addEventListener('DOMContentLoaded', function() {
    window.jsEditor = new JSEditor();

    // 初始化时更新文件大小
    setTimeout(() => {
        window.jsEditor.updateFileSize();
    }, 100);
});

/**
 * 页面卸载前保存代码
 */
window.addEventListener('beforeunload', function(event) {
    if (window.jsEditor) {
        window.jsEditor.saveCode();
    }
});
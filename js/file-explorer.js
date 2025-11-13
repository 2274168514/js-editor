/**
 * 文件浏览器功能
 * 处理文件夹导航和文件列表显示
 */

class FileExplorer {
    constructor(editor) {
        this.editor = editor;
        this.currentFolder = 'html';
        this.files = this.initializeFiles();
        this.selectedFile = null;
        this.init();
    }

    /**
     * 初始化文件系统
     */
    initializeFiles() {
        // 优先使用编辑器已加载的文件系统数据
        if (this.editor._savedFileSystemData && this.editor._savedFileSystemData.files) {
            console.log('FileExplorer: 使用编辑器已加载的文件系统数据');
            return this.editor._savedFileSystemData.files;
        }

        // 备用：从localStorage加载保存的文件系统
        const savedData = localStorage.getItem('jsEditorCode');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (parsedData.fileSystem && parsedData.fileSystem.files) {
                    console.log('FileExplorer: 从localStorage加载文件系统');
                    return parsedData.fileSystem.files;
                }
            } catch (error) {
                console.error('FileExplorer: 加载保存的文件系统失败:', error);
            }
        }

        // 如果没有保存的数据，使用默认文件
        console.log('FileExplorer: 使用默认文件系统');
        return {
            html: [
                { name: 'clock.html', type: 'html', icon: 'fab fa-html5', content: this.getVisualizationHtml() },
                { name: 'index.html', type: 'html', icon: 'fab fa-html5', content: this.getDefaultHtmlContent() }
            ],
            css: [
                { name: 'clock.css', type: 'css', icon: 'fab fa-css3-alt', content: this.getDefaultCssContent() },
                { name: 'style.css', type: 'css', icon: 'fab fa-css3-alt', content: this.getDefaultCssContent() }
            ],
            javascript: [
                { name: 'clock.js', type: 'javascript', icon: 'fab fa-js', content: this.getVisualizationJs() },
                { name: 'script.js', type: 'javascript', icon: 'fab fa-js', content: this.getDefaultJsContent() }
            ],
            assets: [
                { name: 'data.json', type: 'json', icon: 'fas fa-chart-line', content: this.getDefaultJsonContent() },
                { name: 'data.csv', type: 'csv', icon: 'fas fa-file-csv', content: this.getDefaultCsvContent() }
            ]
        };
    }

    /**
     * 初始化文件浏览器
     */
    init() {
        try {
            console.log('FileExplorer: 开始初始化...');

            // 检查必要的DOM元素
            const fileList = document.getElementById('fileList');
            if (!fileList) {
                console.error('FileExplorer: 未找到fileList元素');
                return;
            }

            console.log('FileExplorer: 设置事件监听器...');
            this.setupEventListeners();

            console.log('FileExplorer: 显示默认文件夹...');
            this.showFolder('html');

            // 恢复保存的状态
            if (this.editor._savedFileSystemData) {
                this.currentFolder = this.editor._savedFileSystemData.currentFolder || 'html';
                this.selectedFile = this.editor._savedFileSystemData.selectedFile;

                // 显示正确的文件夹
                this.showFolder(this.currentFolder);

                // 如果有选中的文件，重新打开它
                if (this.selectedFile) {
                    setTimeout(() => {
                        const folderFiles = this.files[this.currentFolder];
                        const fileToOpen = folderFiles.find(f => f.name === this.selectedFile.name);
                        if (fileToOpen) {
                            this.openFile(fileToOpen);
                            // 恢复选中状态
                            const fileItem = document.querySelector(`[data-file="${this.selectedFile.name}"]`);
                            if (fileItem) {
                                this.selectFile(fileToOpen, fileItem);
                            }
                        }
                    }, 200);
                }
            }

            // 更新文件夹按钮状态
            this.updateFolderButtons(this.currentFolder);

            console.log('FileExplorer: 初始化完成');
        } catch (error) {
            console.error('FileExplorer: 初始化过程中发生错误:', error);
        }
    }

    /**
     * 更新文件夹按钮状态
     */
    updateFolderButtons(activeFolder) {
        // 更新文件夹按钮的激活状态
        document.querySelectorAll('[data-folder]').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-folder="${activeFolder}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    /**
     * 获取默认HTML内容
     */
    getDefaultHtmlContent() {
        return this.getVisualizationTemplateContent();
    }

    /**
     * 获取可视化模板内容
     */
    getVisualizationTemplateContent() {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据可视化模板</title>
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

        header p {
            font-size: 1.1em;
            color: #666;
        }

        .controls {
            text-align: center;
            margin-bottom: 30px;
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .controls button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            margin: 5px 10px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .controls button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .controls button:active {
            transform: translateY(0);
        }

        .controls button.active {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .info-panel {
            margin-bottom: 30px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .chart-area {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        }
    </style>
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

    <!-- 简化的图表绘制脚本 -->
    <script>
        /**
         * 简化的图表绘制脚本
         * 专门用于从 window.appData 读取数据并绘制图表
         */

        // 全局变量
        let currentData = null;
        let currentView = 'bar'; // 当前显示的视图类型

        // 页面加载完成后执行
        document.addEventListener("DOMContentLoaded", function() {
            console.log("数据可视化模板加载完成");

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
                console.log("开始加载数据...");

                if (!window.appData) {
                    console.log("等待数据加载...");
                    setTimeout(loadDataAndDraw, 100);
                    return;
                }

                console.log("数据已加载:", window.appData);
                currentData = processData(window.appData);
                console.log("处理后的数据:", currentData);

                if (currentData.length === 0) {
                    showError("没有找到有效的数据，请检查数据格式");
                    return;
                }

                updateInfoPanel();
                drawBarChart(); // 默认显示柱状图
                setActiveButton('showBarChartBtn');

            } catch (error) {
                console.error("数据加载失败:", error);
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
                        <div style="font-size: 24px; font-weight: bold; color: #667eea;">\${totalItems}</div>
                        <div style="color: #666;">数据项</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #667eea;">\${totalValue.toFixed(1)}%</div>
                        <div style="color: #666;">总值</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #667eea;">\${avgGrowth.toFixed(1)}%</div>
                        <div style="color: #666;">平均增长</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #667eea;">$\${(maxSalary/1000).toFixed(0)}K</div>
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
                                <div style="width: 100%; background: linear-gradient(to top, #667eea, #764ba2);
                                            height: \${(item.value / Math.max(...currentData.map(d => d.value))) * 250}px;
                                            border-radius: 8px 8px 0 0; position: relative;
                                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                                            transition: all 0.3s ease;"
                                            onmouseover="this.style.transform='scaleY(1.05)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'"
                                            onmouseout="this.style.transform='scaleY(1)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.3)'">
                                    <span style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                                               font-size: 14px; font-weight: bold; color: #667eea;">\${item.value.toFixed(1)}%</span>
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
                                        <div style="font-size: 18px; color: #667eea;">总计</div>
                                        <div style="font-size: 16px; color: #333;">\${total.toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="flex: 0 0 auto;">
                            \${currentData.map((item, index) => \`
                                <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 8px; border-radius: 8px; background: rgba(255, 255, 255, 0.8); transition: all 0.3s ease;"
                                     onmouseover="this.style.background='rgba(102, 126, 234, 0.1)'; this.style.transform='translateX(5px)'"
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
                    <div style="height: 350px; position: relative; border-left: 2px solid #667eea; border-bottom: 2px solid #667eea; margin: 0 20px; background: rgba(255, 255, 255, 0.5); border-radius: 8px;">
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
                            style="fill: none; stroke: #667eea; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;" />

                            <!-- 数据点 -->
                            \${currentData.map((item, index) => {
                                const x = (index / (currentData.length - 1)) * 90 + 5;
                                const y = 50 - (item.growth * scale);
                                return \`
                                    <circle cx="\${x}%" cy="\${y}%" r="8" fill="#667eea" stroke="white" stroke-width="3"
                                            style="cursor: pointer; transition: all 0.3s ease;"
                                            onmouseover="this.setAttribute('r', '10'); this.style.fill='#764ba2'"
                                            onmouseout="this.setAttribute('r', '8'); this.style.fill='#667eea'">
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
            console.log("刷新数据...");
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
    </script>
</body>
</html>`;
    }

    /**
     * 获取高级时钟CSS样式
     */
    getDefaultCssContent() {
        return `/* 时钟组件专用样式 - 不影响其他元素 */
.clock-widget * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.clock-widget {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #1a1a2e;
    color: #eee;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.5s ease;
}

.clock-widget.light-theme {
    background: #f0f0f0;
    color: #333;
}

.clock-widget .clock-container {
    width: 100%;
    max-width: 800px;
    padding: 20px;
}

.clock-widget .clock-wrapper {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.clock-widget.light-theme .clock-wrapper {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.clock-widget .clock-header {
    text-align: center;
    margin-bottom: 40px;
}

.clock-widget .clock-header h1 {
    font-size: 2.5em;
    font-weight: 300;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #00d4ff, #090979, #00d4ff);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 3s ease infinite;
}

.clock-widget.light-theme .clock-header h1 {
    background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.clock-widget .clock-header p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1em;
    transition: color 0.3s ease;
}

.clock-widget.light-theme .clock-header p {
    color: rgba(0, 0, 0, 0.6);
}

.clock-widget .clock-display {
    margin-bottom: 40px;
}

.clock-widget .time-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    gap: 10px;
}

.clock-widget .time-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
}

.clock-widget .time-digit {
    font-size: 4em;
    font-weight: 200;
    font-family: 'Courier New', monospace;
    color: #00d4ff;
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    transition: all 0.3s ease;
    animation: pulse 2s ease infinite;
}

.clock-widget.light-theme .time-digit {
    color: #667eea;
    text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

.clock-widget .time-label {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: color 0.3s ease;
}

.clock-widget.light-theme .time-label {
    color: rgba(0, 0, 0, 0.5);
}

.clock-widget .time-separator {
    font-size: 3em;
    font-weight: 200;
    color: #00d4ff;
    margin: 0 5px;
    animation: blink 1s ease infinite;
}

.clock-widget.light-theme .time-separator {
    color: #667eea;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.clock-widget .date-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.clock-widget .date-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.clock-widget.light-theme .date-block {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.clock-widget .date-block:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.1);
}

.clock-widget.light-theme .date-block:hover {
    background: rgba(0, 0, 0, 0.1);
}

.clock-widget .date-digit {
    font-size: 1.5em;
    font-weight: 400;
    color: #fff;
    margin-bottom: 5px;
    transition: color 0.3s ease;
}

.clock-widget.light-theme .date-digit {
    color: #333;
}

.clock-widget .date-label {
    font-size: 0.8em;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: color 0.3s ease;
}

.clock-widget.light-theme .date-label {
    color: rgba(0, 0, 0, 0.4);
}

.clock-widget .clock-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.clock-widget .control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.clock-widget.light-theme .control-btn {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #333;
}

.clock-widget .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.clock-widget.light-theme .control-btn:hover {
    background: rgba(0, 0, 0, 0.1);
}

.clock-widget .control-btn.active {
    background: #00d4ff;
    border-color: #00d4ff;
    color: #1a1a2e;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.clock-widget.light-theme .control-btn.active {
    background: #667eea;
    border-color: #667eea;
    color: #fff;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.clock-widget .clock-status {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.clock-widget .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.clock-widget.light-theme .status-item {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.clock-widget .status-label {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.6);
    transition: color 0.3s ease;
}

.clock-widget.light-theme .status-label {
    color: rgba(0, 0, 0, 0.5);
}

.clock-widget .status-value {
    font-size: 0.9em;
    font-weight: 500;
    color: #00d4ff;
    transition: color 0.3s ease;
}

.clock-widget.light-theme .status-value {
    color: #667eea;
}

/* 毫秒显示样式 */
.clock-widget .milliseconds {
    font-size: 1.5em;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 10px;
    font-family: 'Courier New', monospace;
    transition: color 0.3s ease;
}

.clock-widget.light-theme .milliseconds {
    color: rgba(0, 0, 0, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .clock-widget .clock-wrapper {
        padding: 20px;
    }

    .clock-widget .clock-header h1 {
        font-size: 2em;
    }

    .clock-widget .time-digit {
        font-size: 3em;
    }

    .clock-widget .time-block {
        min-width: 80px;
    }

    .clock-widget .date-section {
        gap: 10px;
    }

    .clock-widget .date-block {
        min-width: 60px;
        padding: 8px;
    }

    .clock-widget .clock-controls {
        gap: 8px;
    }

    .clock-widget .control-btn {
        padding: 8px 16px;
        font-size: 0.8em;
    }
}

@media (max-width: 480px) {
    .clock-widget .time-section {
        flex-direction: column;
        gap: 20px;
    }

    .clock-widget .time-separator {
        transform: rotate(90deg);
        margin: 10px 0;
    }

    .clock-widget .date-section {
        flex-direction: column;
        align-items: center;
    }

    .clock-widget .clock-status {
        flex-direction: column;
        gap: 10px;
    }
}

`;
    }

    /**
     * 获取高级交互式时钟模板
     * 简洁优雅的数字时钟，带有动画效果和日期显示
     */
    getVisualizationHtml() {
        return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>高级交互式时钟</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="clock-container">\n    <div class="clock-wrapper">\n      <div class="clock-header">\n        <h1>高级数字时钟</h1>\n        <p>优雅的时间显示与交互体验</p>\n      </div>\n      \n      <div class="clock-display">\n        <div class="time-section">\n          <div class="time-block" id="hours">\n            <span class="time-digit">00</span>\n            <span class="time-label">时</span>\n          </div>\n          <div class="time-separator">:</div>\n          <div class="time-block" id="minutes">\n            <span class="time-digit">00</span>\n            <span class="time-label">分</span>\n          </div>\n          <div class="time-separator">:</div>\n          <div class="time-block" id="seconds">\n            <span class="time-digit">00</span>\n            <span class="time-label">秒</span>\n          </div>\n        </div>\n        \n        <div class="date-section">\n          <div class="date-block" id="year">\n            <span class="date-digit">2024</span>\n            <span class="date-label">年</span>\n          </div>\n          <div class="date-block" id="month">\n            <span class="date-digit">01</span>\n            <span class="date-label">月</span>\n          </div>\n          <div class="date-block" id="day">\n            <span class="date-digit">01</span>\n            <span class="date-label">日</span>\n          </div>\n          <div class="date-block" id="weekday">\n            <span class="date-digit">周一</span>\n            <span class="date-label">星期</span>\n          </div>\n        </div>\n      </div>\n      \n      <div class="clock-controls">\n        <button id="format12Btn" class="control-btn active">12小时制</button>\n        <button id="format24Btn" class="control-btn">24小时制</button>\n        <button id="showDateBtn" class="control-btn active">显示日期</button>\n  \n        <button id="themeToggleBtn" class="control-btn">切换主题</button>\n      </div>\n      \n      <div class="clock-status">\n        <div class="status-item">\n          <span class="status-label">时区:</span>\n          <span class="status-value" id="timezone">本地时间</span>\n        </div>\n        <div class="status-item">\n          <span class="status-label">格式:</span>\n          <span class="status-value" id="format">12小时制</span>\n        </div>\n      </div>\n    </div>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>';
    }

    /**
     * 获取高级时钟JavaScript代码
     * 实现时钟的所有交互功能
     */
    getVisualizationJs() {
        return `/**
 * 高级数字时钟交互脚本
 * 提供12/24小时制切换、日期显示、毫秒显示、主题切换等功能
 */

// 全局状态变量
let is24HourFormat = false;
let showDate = true;
let isLightTheme = false;
let clockInterval = null;
let currentDate = null; // 用于跟踪当前日期

// 星期映射
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeClock();
    bindEvents();
    startClock();
});

/**
 * 初始化时钟
 */
function initializeClock() {
    const now = new Date();

    // 更新时间
    updateTimeDisplay(now);

    // 更新日期（首次加载时）
    if (showDate) {
        updateDateDisplay(now);
        currentDate = new Date(now); // 保存初始日期
    }

    // 更新状态
    updateStatus();
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    // 12/24小时制切换
    const format12Btn = document.getElementById('format12Btn');
    const format24Btn = document.getElementById('format24Btn');

    if (format12Btn) {
        format12Btn.addEventListener('click', () => setTimeFormat(false));
    }
    if (format24Btn) {
        format24Btn.addEventListener('click', () => setTimeFormat(true));
    }

    // 日期显示切换
    const showDateBtn = document.getElementById('showDateBtn');
    if (showDateBtn) {
        showDateBtn.addEventListener('click', toggleDateDisplay);
    }

  
    // 主题切换
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

/**
 * 启动时钟
 */
function startClock() {
    // 清除可能存在的定时器
    if (clockInterval) {
        clearInterval(clockInterval);
    }

    // 立即更新一次
    updateClock();

    // 设置定时器，每秒更新一次
    clockInterval = setInterval(updateClock, 1000);
}

/**
 * 更新时钟显示
 */
function updateClock() {
    const now = new Date();

    // 更新时间（每秒都会执行）
    updateTimeDisplay(now);

    // 只有当日期发生变化或首次加载时才更新日期
    if (showDate) {
        if (!currentDate || hasDateChanged(now, currentDate)) {
            updateDateDisplay(now);
            currentDate = new Date(now); // 保存当前日期
        }
    }

    // 状态不需要每秒更新，但为了保持代码一致性，这里保留
    // updateStatus(); // 可以注释掉，因为状态基本不会变
}

/**
 * 检查日期是否发生变化
 * @param {Date} newDate 新的日期
 * @param {Date} oldDate 旧的日期
 * @returns {boolean} 日期是否发生变化
 */
function hasDateChanged(newDate, oldDate) {
    return newDate.getFullYear() !== oldDate.getFullYear() ||
           newDate.getMonth() !== oldDate.getMonth() ||
           newDate.getDate() !== oldDate.getDate() ||
           newDate.getDay() !== oldDate.getDay();
}

/**
 * 更新时间显示
 * @param {Date} date 当前日期时间
 */
function updateTimeDisplay(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 处理12小时制
    let period = '';
    if (!is24HourFormat) {
        period = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12; // 0转换为12
    }

    // 更新时间显示
    updateElement('hours', padZero(hours));
    updateElement('minutes', padZero(minutes));
    updateElement('seconds', padZero(seconds));
}

/**
 * 更新日期显示
 * @param {Date} date 当前日期时间
 */
function updateDateDisplay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = weekDays[date.getDay()];

    // 更新日期显示（使用不带动画的函数）
    updateDateElement('year', year);
    updateDateElement('month', padZero(month));
    updateDateElement('day', padZero(day));
    updateDateElement('weekday', weekDay);

    // 显示日期区域
    const dateSection = document.querySelector('.date-section');
    if (dateSection) {
        dateSection.style.display = 'flex';
    }
}

/**
 * 设置时间格式
 * @param {boolean} is24Hour 是否为24小时制
 */
function setTimeFormat(is24Hour) {
    is24HourFormat = is24Hour;

    // 更新按钮状态
    const format12Btn = document.getElementById('format12Btn');
    const format24Btn = document.getElementById('format24Btn');

    if (format12Btn && format24Btn) {
        if (is24Hour) {
            format12Btn.classList.remove('active');
            format24Btn.classList.add('active');
        } else {
            format12Btn.classList.add('active');
            format24Btn.classList.remove('active');
        }
    }

    updateClock();
}

/**
 * 切换日期显示
 */
function toggleDateDisplay() {
    showDate = !showDate;

    const showDateBtn = document.getElementById('showDateBtn');
    const dateSection = document.querySelector('.date-section');

    if (showDateBtn) {
        if (showDate) {
            showDateBtn.classList.add('active');
            showDateBtn.textContent = '隐藏日期';
            if (dateSection) dateSection.style.display = 'flex';
        } else {
            showDateBtn.classList.remove('active');
            showDateBtn.textContent = '显示日期';
            if (dateSection) dateSection.style.display = 'none';
        }
    }
}


/**
 * 切换主题
 */
function toggleTheme() {
    isLightTheme = !isLightTheme;

    const body = document.body;
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    if (body) {
        if (isLightTheme) {
            body.classList.add('light-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '暗色主题';
        } else {
            body.classList.remove('light-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '亮色主题';
        }
    }
}

/**
 * 更新状态显示
 */
function updateStatus() {
    // 更新时区显示
    const timezoneElement = document.getElementById('timezone');
    if (timezoneElement) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        timezoneElement.textContent = timezone;
    }

    // 更新格式显示
    const formatElement = document.getElementById('format');
    if (formatElement) {
        formatElement.textContent = is24HourFormat ? '24小时制' : '12小时制';
    }
}

/**
 * 更新时间元素内容（带动画）
 * @param {string} id 元素ID
 * @param {string} value 新值
 */
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        const digitElement = element.querySelector('.time-digit');
        if (digitElement) {
            // 添加更新动画（仅时间元素）
            digitElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                digitElement.style.transform = 'scale(1)';
            }, 100);
            digitElement.textContent = value;
        }
    }
}

/**
 * 更新日期元素内容（不带动画）
 * @param {string} id 元素ID
 * @param {string} value 新值
 */
function updateDateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        const digitElement = element.querySelector('.date-digit');
        if (digitElement) {
            digitElement.textContent = value;
        }
    }
}


/**
 * 数字补零
 * @param {number} num 数字
 * @param {number} length 长度
 * @returns {string} 补零后的字符串
 */
function padZero(num, length = 2) {
    return num.toString().padStart(length, '0');
}

// 页面卸载时清理定时器
window.addEventListener('beforeunload', function() {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
});`;
    }

    /**
     * 获取默认JavaScript内容
     */
    getDefaultJsContent() {
        return `/**
 * 高级数字时钟交互脚本
 * 提供12/24小时制切换、日期显示、主题切换等功能
 */

// 全局状态变量
let is24HourFormat = false;
let showDate = true;
let isLightTheme = false;
let clockInterval = null;
let currentDate = null; // 用于跟踪当前日期

// 星期映射
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeClock();
    bindEvents();
    startClock();
});

/**
 * 初始化时钟
 */
function loadData() {
    try {
        console.log("正在检查 window.appData...");
        console.log("window.appData:", window.appData);

        if (!window.appData) {
            console.log("等待数据加载...");
            setTimeout(loadData, 100);
            return;
        }

        console.log("数据已加载:", window.appData);
        console.log("数据类型:", typeof window.appData);
        console.log("是否为数组:", Array.isArray(window.appData));

        currentData = processAppData(window.appData);
        console.log("处理后的数据:", currentData);

        updateDataInfo();
        showBarChart(); // 默认显示柱状图
    } catch (error) {
        console.error("数据加载失败:", error);
        showError("数据加载失败: " + error.message);
    }
}

/**
 * 处理应用数据
 */
function processAppData(data) {
    if (!data) return [];

    console.log("处理原始数据:", data);

    // 如果是语言流行度数据
    if (data.languagePopularity && Array.isArray(data.languagePopularity)) {
        console.log("检测到语言流行度数据");
        return data.languagePopularity.map(item => ({
            name: item.language,
            value: parseFloat(item.percentage) || 0,
            users: parseFloat(item.users) || 0,
            growth: parseFloat(item.growth) || 0,
            salary: parseFloat(item.salary) || 0
        }));
    }

    // 如果是数组格式的数据
    if (Array.isArray(data)) {
        console.log("检测到数组数据");
        return data.map((item, index) => {
            // 尝试各种可能的字段名
            const name = item.language || item.name || item.编程语言 || item.月份 || \`项目\${index + 1}\`;
            const value = parseFloat(item.percentage || item.流行度百分比 || item.value || item.数值 || 0);
            const users = parseFloat(item.users || item.开发者数量 || item.用户数 || 0);
            const growth = parseFloat(item.growth || item.增长率 || item.增长 || 0);
            const salary = parseFloat(item.salary || item.平均薪资 || item.薪资 || 0);

            return {
                name,
                value,
                users,
                growth,
                salary
            };
        });
    }

    console.log("未识别的数据格式");
    return [];
}

/**
 * 更新数据信息面板
 */
function updateDataInfo() {
    const infoPanel = document.getElementById("dataInfo");
    if (!infoPanel || !currentData || currentData.length === 0) return;

    const totalItems = currentData.length;
    const totalValue = currentData.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
    const avgGrowth = currentData.reduce((sum, item) => sum + parseFloat(item.growth || 0), 0) / totalItems;
    const maxSalary = Math.max(...currentData.map(item => parseFloat(item.salary || 0)));

    infoPanel.innerHTML = \`
        <div class="info-grid">
            <div class="info-item">
                <strong>数据项:</strong> \${totalItems}
            </div>
            <div class="info-item">
                <strong>总值:</strong> \${totalValue.toFixed(1)}%
            </div>
            <div class="info-item">
                <strong>平均增长:</strong> \${avgGrowth.toFixed(1)}%
            </div>
            <div class="info-item">
                <strong>最高薪资:</strong> $\${(maxSalary/1000).toFixed(0)}K
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
    const dataTable = document.getElementById("dataTable");

    if (!tableContainer || !dataTable || !currentData || currentData.length === 0) return;

    // 创建表头
    const headers = Object.keys(currentData[0]);
    const headerRow = headers.map(header => \`<th>\${getChineseHeader(header)}</th>\`).join('');

    // 创建数据行
    const dataRows = currentData.map(item => {
        const cells = headers.map(header => {
            let value = item[header];
            if (typeof value === 'number') {
                if (header === 'value') value = value.toFixed(1) + '%';
                else if (header === 'users') value = (value / 1000000).toFixed(1) + 'M';
                else if (header === 'salary') value = '$' + (value / 1000).toFixed(0) + 'K';
                else if (header === 'growth') value = value.toFixed(1) + '%';
            }
            return \`<td>\${value}</td>\`;
        }).join('');
        return \`<tr>\${cells}</tr>\`;
    }).join('');

    dataTable.innerHTML = \`
        <thead><tr>\${headerRow}</tr></thead>
        <tbody>\${dataRows}</tbody>
    \`;
    tableContainer.style.display = 'block';
}

/**
 * 显示柱状图
 */
function showBarChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    const ctx = document.getElementById("myChart").getContext('2d');
    destroyCurrentChart();

    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: currentData.map(item => item.name),
            datasets: [{
                label: '流行度 (%)',
                data: currentData.map(item => item.value),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ],
                borderColor: '#333',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '编程语言流行度分布'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '流行度 (%)'
                    }
                }
            }
        }
    });

    chartContainer.style.display = 'block';
}

/**
 * 显示饼图
 */
function showPieChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    const ctx = document.getElementById("myChart").getContext('2d');
    destroyCurrentChart();

    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: currentData.map(item => item.name),
            datasets: [{
                data: currentData.map(item => item.value),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '编程语言流行度占比'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });

    chartContainer.style.display = 'block';
}

/**
 * 显示折线图
 */
function showLineChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    const ctx = document.getElementById("myChart").getContext('2d');
    destroyCurrentChart();

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map(item => item.name),
            datasets: [{
                label: '增长率 (%)',
                data: currentData.map(item => item.growth),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '编程语言增长率趋势'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '增长率 (%)'
                    }
                }
            }
        }
    });

    chartContainer.style.display = 'block';
}

/**
 * 刷新数据
 */
function refreshData() {
    console.log("刷新数据...");
    loadData();
}

/**
 * 隐藏所有图表
 */
function hideAllCharts() {
    document.getElementById("chartContainer").style.display = 'none';
    document.getElementById("tableContainer").style.display = 'none';
}

/**
 * 销毁当前图表
 */
function destroyCurrentChart() {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    const infoPanel = document.getElementById("dataInfo");
    if (infoPanel) {
        infoPanel.innerHTML = \`<div class="error">\${message}</div>\`;
    }
}

/**
 * 获取中文表头
 */
function getChineseHeader(key) {
    const headers = {
        'name': '名称',
        'value': '数值',
        'users': '用户数',
        'growth': '增长率',
        'salary': '薪资'
    };
    return headers[key] || key;
}`;
    }

    /**
     * 获取默认JSON内容
     * 提供丰富的示例数据，支持多种可视化图表
     */
    getDefaultJsonContent() {
        return JSON.stringify({
            "metadata": {
                "title": "编程语言流行度调查",
                "description": "2024年开发者调查数据",
                "source": "开发者调查报告",
                "lastUpdated": "2024-11-13"
            },
            "categories": {
                "languages": ["JavaScript", "Python", "Java", "TypeScript", "C++", "Go", "Rust", "PHP"],
                "regions": ["亚洲", "欧洲", "北美", "南美", "非洲", "大洋洲"]
            },
            "languagePopularity": [
                {"language": "JavaScript", "percentage": 28.5, "users": 15600000, "growth": 2.3, "difficulty": "中等", "salary": 85000},
                {"language": "Python", "percentage": 22.1, "users": 12100000, "growth": 5.7, "difficulty": "简单", "salary": 92000},
                {"language": "Java", "percentage": 15.8, "users": 8650000, "growth": -1.2, "difficulty": "中等", "salary": 88000},
                {"language": "TypeScript", "percentage": 12.3, "users": 6730000, "growth": 8.9, "difficulty": "中等", "salary": 95000},
                {"language": "C++", "percentage": 8.7, "users": 4760000, "growth": 0.5, "difficulty": "困难", "salary": 91000},
                {"language": "Go", "percentage": 5.2, "users": 2840000, "growth": 6.8, "difficulty": "中等", "salary": 98000},
                {"language": "Rust", "percentage": 3.1, "users": 1690000, "growth": 12.4, "difficulty": "困难", "salary": 105000},
                {"language": "PHP", "percentage": 4.3, "users": 2350000, "growth": -2.1, "difficulty": "简单", "salary": 72000}
            ],
            "regionalData": [
                {"region": "亚洲", "developers": 12000000, "avgSalary": 65000, "topLanguage": "JavaScript"},
                {"region": "欧洲", "developers": 8500000, "avgSalary": 78000, "topLanguage": "Python"},
                {"region": "北美", "developers": 15000000, "avgSalary": 110000, "topLanguage": "TypeScript"},
                {"region": "南美", "developers": 3200000, "avgSalary": 48000, "topLanguage": "JavaScript"},
                {"region": "非洲", "developers": 1800000, "avgSalary": 35000, "topLanguage": "Python"},
                {"region": "大洋洲", "developers": 2100000, "avgSalary": 89000, "topLanguage": "Java"}
            ],
            "timeline": [
                {"year": 2019, "totalDevelopers": 18500000, "newLanguages": 5},
                {"year": 2020, "totalDevelopers": 21200000, "newLanguages": 7},
                {"year": 2021, "totalDevelopers": 24500000, "newLanguages": 9},
                {"year": 2022, "totalDevelopers": 27800000, "newLanguages": 12},
                {"year": 2023, "totalDevelopers": 31200000, "newLanguages": 15},
                {"year": 2024, "totalDevelopers": 35600000, "newLanguages": 18}
            ],
            "frameworks": {
                "frontend": [
                    {"name": "React", "popularity": 40.2, "company": "Meta", "learningCurve": 3},
                    {"name": "Vue.js", "popularity": 28.7, "company": "Evan You", "learningCurve": 2},
                    {"name": "Angular", "popularity": 15.3, "company": "Google", "learningCurve": 4},
                    {"name": "Svelte", "popularity": 8.9, "company": "Rich Harris", "learningCurve": 1},
                    {"name": "Next.js", "popularity": 6.9, "company": "Vercel", "learningCurve": 3}
                ],
                "backend": [
                    {"name": "Node.js", "popularity": 35.8, "company": "OpenJS", "learningCurve": 2},
                    {"name": "Django", "popularity": 22.4, "company": "DSF", "learningCurve": 3},
                    {"name": "Spring", "popularity": 18.6, "company": "VMware", "learningCurve": 4},
                    {"name": "Express", "popularity": 12.3, "company": "OpenJS", "learningCurve": 1},
                    {"name": "Laravel", "popularity": 10.9, "company": "Taylor Otwell", "learningCurve": 2}
                ]
            },
            "insights": {
                "totalDevelopers": 35600000,
                "fastestGrowing": "Rust (12.4%)",
                "highestPaying": "Rust ($105,000)",
                "mostPopular": "JavaScript (28.5%)",
                "emergingTrend": "TypeScript增长迅速"
            }
        }, null, 2);
    }

    /**
     * 获取默认CSV内容
     * 提供多维度数据，支持各种图表类型
     */
    getDefaultCsvContent() {
        return `编程语言,流行度百分比,开发者数量,增长率,难度级别,平均薪资,公司需求
JavaScript,28.5,15600000,2.3,中等,85000,高
Python,22.1,12100000,5.7,简单,92000,高
Java,15.8,8650000,-1.2,中等,88000,中
TypeScript,12.3,6730000,8.9,中等,95000,高
C++,8.7,4760000,0.5,困难,91000,中
Go,5.2,2840000,6.8,中等,98000,中
Rust,3.1,1690000,12.4,困难,105000,低
PHP,4.3,2350000,-2.1,简单,72000,中`;
    }

    /**
     * 将默认文件加载到编辑器中
     */
    loadFilesToEditors() {
        // 检查编辑器是否已经有内容，如果有就不覆盖
        const htmlContent = this.editor.editors.html.getValue();
        const cssContent = this.editor.editors.css.getValue();
        const jsContent = this.editor.editors.js.getValue();

        // 只有当编辑器为空时才加载默认文件
        if (!htmlContent || htmlContent.trim() === '') {
            const htmlFile = this.files.html[0];
            if (htmlFile && htmlFile.content) {
                this.editor.editors.html.setValue(htmlFile.content);
                console.log('FileExplorer: 已加载HTML默认文件');
            }
        }

        if (!cssContent || cssContent.trim() === '') {
            const cssFile = this.files.css[0];
            if (cssFile && cssFile.content) {
                this.editor.editors.css.setValue(cssFile.content);
                console.log('FileExplorer: 已加载CSS默认文件');
            }
        }

        if (!jsContent || jsContent.trim() === '') {
            const jsFile = this.files.javascript[0];
            if (jsFile && jsFile.content) {
                this.editor.editors.js.setValue(jsFile.content);
                console.log('FileExplorer: 已加载JavaScript默认文件');
            }
        }

        this.editor.logToConsole('info', '编辑器初始化完成');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        try {
            // 文件夹导航按钮事件
            const folderBtns = document.querySelectorAll('.folder-btn');
            if (folderBtns.length > 0) {
                folderBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const folder = e.currentTarget.dataset.folder;
                        if (folder) {
                            this.switchFolder(folder);
                        }
                    });
                });
            }
        } catch (error) {
            console.error('文件浏览器设置事件监听器时发生错误:', error);
        }
    }

    /**
     * 切换文件夹
     */
    switchFolder(folder) {
        // 更新导航按钮状态
        document.querySelectorAll('.folder-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-folder="' + folder + '"]').classList.add('active');

        // 显示文件列表
        this.showFolder(folder);
    }

    /**
     * 显示文件夹内容
     */
    showFolder(folder) {
        try {
            console.log('FileExplorer: 显示文件夹 ' + folder);

            this.currentFolder = folder;
            const fileList = document.getElementById('fileList');

            if (!fileList) {
                console.error('FileExplorer: 未找到fileList元素');
                return;
            }

            const files = this.files[folder] || [];
            console.log('FileExplorer: 找到 ' + files.length + ' 个文件');

            // 清空文件列表
            fileList.innerHTML = '';

            // 添加文件项
            files.forEach((file, index) => {
                console.log('FileExplorer: 创建文件项 ' + file.name + ' (' + (index + 1) + '/' + files.length + ')');
                const fileItem = this.createFileItem(file);
                if (fileItem) {
                    fileList.appendChild(fileItem);
                }
            });

            // 如果没有文件，显示提示
            if (files.length === 0) {
                console.log('FileExplorer: 文件夹 ' + folder + ' 为空');
                fileList.innerHTML = '<div class="empty-folder"><i class="fas fa-folder-open"></i><span>此文件夹为空</span></div>';
            }

            console.log('FileExplorer: 文件夹 ' + folder + ' 显示完成');
        } catch (error) {
            console.error('FileExplorer: 显示文件夹 ' + folder + ' 时发生错误:', error);
        }
    }

    /**
     * 添加文件到指定文件夹
     * @param {string} folder - 文件夹名称
     * @param {Object} file - 文件对象
     */
    addFileToFolder(folder, file) {
        try {
            console.log('FileExplorer: 添加文件到文件夹 ' + folder + ' - ' + file.name);

            // 确保文件夹存在
            if (!this.files[folder]) {
                this.files[folder] = [];
                console.log('FileExplorer: 创建新文件夹 ' + folder);
            }

            // 添加文件到文件夹
            this.files[folder].push(file);
            console.log('FileExplorer: 文件 ' + file.name + ' 已添加到 ' + folder + ' 文件夹');

            // 如果当前显示的是该文件夹，刷新列表
            if (this.currentFolder === folder) {
                console.log('FileExplorer: 刷新当前文件夹显示');
                this.showFolder(folder);
            }

            // 触发自动保存
            if (this.editor && this.editor.setAutoSave) {
                this.editor.setAutoSave();
            }

            console.log('FileExplorer: 文件添加完成');
        } catch (error) {
            console.error('FileExplorer: 添加文件到文件夹时发生错误:', error);
        }
    }

    /**
     * 创建文件项元素
     */
    createFileItem(file) {
        try {
            console.log('FileExplorer: 创建文件项 - 名称: ' + file.name + ', 类型: ' + file.type);

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.file = file.name;
            fileItem.dataset.type = file.type;

            // 验证文件对象
            if (!file.name || !file.icon) {
                console.warn('FileExplorer: 文件对象缺少必要属性', file);
                return null;
            }

            fileItem.innerHTML = '<i class="' + file.icon + '"></i><span class="file-name">' + file.name + '</span>';

            // 绑定文件项事件 - 单击直接打开文件
            fileItem.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('FileExplorer: 点击文件 ' + file.name);
                this.openFile(file);
                this.selectFile(file, fileItem);
            });

            console.log('FileExplorer: 文件项 ' + file.name + ' 创建成功');
            return fileItem;
        } catch (error) {
            console.error('FileExplorer: 创建文件项 ' + file.name + ' 时发生错误:', error);
            return null;
        }
    }

    /**
     * 打开文件
     */
    openFile(file) {
        // 先保存当前正在编辑的文件内容
        if (this.selectedFile && this.selectedFile !== file) {
            this.saveCurrentFileContent();
        }

        // 根据文件类型切换到对应的编辑器
        let targetTab = 'html';
        let content = '';

        switch (file.type) {
            case 'html':
                targetTab = 'html';
                content = file.content || '<!-- ' + file.name + ' -->\n\n';
                break;
            case 'css':
                targetTab = 'css';
                content = file.content || '/* ' + file.name + ' */\n\n';
                break;
            case 'javascript':
                targetTab = 'js';
                content = file.content || '// ' + file.name + '\n\n';
                break;
            case 'json':
            case 'csv':
                // 切换到数据面板
                this.editor.switchTab('data');
                // 加载数据到编辑器
                this.loadDataToEditor(file.content, file.type, file.name);
                this.selectedFile = file;
                this.editor.logToConsole('info', '已打开数据文件: ' + file.name + ' (' + file.type + ')');
                return;
            case 'text':
                targetTab = 'html';
                content = '<pre>' + (file.content || '') + '</pre>';
                break;
            default:
                this.editor.logToConsole('info', '打开文件: ' + file.name + ' (' + file.type + ')');
                return;
        }

        // 切换到对应的编辑器
        this.editor.switchTab(targetTab);

        // 设置编辑器内容
        const editor = this.editor.editors[targetTab];
        if (editor) {
            editor.setValue(content);
        }

        this.selectedFile = file;
        this.editor.logToConsole('info', '已打开文件: ' + file.name);
    }

    /**
     * 加载数据到数据编辑器
     * @param {string} content - 数据内容
     * @param {string} fileType - 文件类型 (json/csv)
     * @param {string} fileName - 文件名
     */
    loadDataToEditor(content, fileType, fileName) {
        const dataEditor = this.editor.editors.data;

        if (!dataEditor) {
            console.error('数据编辑器未初始化');
            return;
        }

        // 加载数据内容
        dataEditor.setValue(content || '');

        // 触发数据预览更新
        if (this.editor.dataPreviewer) {
            this.editor.dataPreviewer.previewData(content, fileName, fileType);
        }

        this.editor.logToConsole('info', `已加载数据文件: ${fileName}`);

        // 立即触发预览刷新，确保数据在右侧显示
        setTimeout(() => {
            this.editor.runCode();
        }, 100);

        // 添加数据变化监听器（如果还没有的话）
        if (!dataEditor.hasAttribute('data-listener-added')) {
            dataEditor.on('change', () => {
                const currentContent = dataEditor.getValue();
                if (this.editor.dataPreviewer) {
                    this.editor.dataPreviewer.previewData(currentContent, fileName, fileType);
                }
                // 编辑数据时也触发预览刷新
                setTimeout(() => {
                    this.editor.runCode();
                }, 100);
            });
            dataEditor.setAttribute('data-listener-added', 'true');
        }
    }

    /**
     * 选择文件
     */
    selectFile(file, fileItem) {
        // 移除其他文件的选中状态
        document.querySelectorAll('.file-item.selected').forEach(item => {
            item.classList.remove('selected');
        });

        // 选中当前文件
        fileItem.classList.add('selected');
        this.selectedFile = file;

        this.editor.logToConsole('info', '已选择文件: ' + file.name);
    }

    /**
     * 保存当前文件内容
     */
    saveCurrentFileContent() {
        if (!this.selectedFile || !this.editor) {
            return;
        }

        const selectedFile = this.selectedFile;
        let content = '';
        let targetFolder = '';

        // 根据文件类型获取当前编辑器的内容
        switch (selectedFile.type) {
            case 'html':
                if (this.editor.editors.html) {
                    content = this.editor.editors.html.getValue();
                    targetFolder = 'html';
                }
                break;
            case 'css':
                if (this.editor.editors.css) {
                    content = this.editor.editors.css.getValue();
                    targetFolder = 'css';
                }
                break;
            case 'javascript':
                if (this.editor.editors.js) {
                    content = this.editor.editors.js.getValue();
                    targetFolder = 'javascript';
                }
                break;
            case 'json':
            case 'csv':
                if (this.editor.editors.data) {
                    content = this.editor.editors.data.getValue();
                    targetFolder = 'assets';
                }
                break;
        }

        // 更新文件内容
        if (content && targetFolder) {
            // 更新选中文件的内容
            selectedFile.content = content;

            // 更新文件系统中的文件内容
            const folderFiles = this.files[targetFolder];
            if (folderFiles) {
                const fileIndex = folderFiles.findIndex(f => f.name === selectedFile.name);
                if (fileIndex > -1) {
                    folderFiles[fileIndex].content = content;
                }
            }
        }
    }
}

// 页面加载完成后初始化文件浏览器
document.addEventListener('DOMContentLoaded', function() {
    console.log('FileExplorer: DOM加载完成，开始初始化检查...');

    function initializeFileExplorer(retryCount) {
        retryCount = retryCount || 0;
        console.log('FileExplorer: 尝试初始化，重试次数 ' + retryCount);

        // 检查FileExplorer类是否已定义
        if (typeof FileExplorer === 'undefined') {
            console.error('FileExplorer: FileExplorer类未定义，请检查文件加载');
            return;
        }

        if (window.jsEditor && window.jsEditor.editors) {
            try {
                console.log('FileExplorer: 主编辑器已就绪，正在初始化文件浏览器...');

                // 避免重复初始化
                if (window.jsEditor.fileExplorer) {
                    console.log('FileExplorer: 文件浏览器已经初始化，跳过');
                    return;
                }

                window.jsEditor.fileExplorer = new FileExplorer(window.jsEditor);
                console.log('FileExplorer: 文件浏览器初始化完成');

                // 验证初始化是否成功
                setTimeout(function() {
                    if (window.jsEditor.fileExplorer && window.jsEditor.fileExplorer.files) {
                        console.log('FileExplorer: 验证成功，文件浏览器正常运行');
                        console.log('FileExplorer: 可用文件夹:', Object.keys(window.jsEditor.fileExplorer.files));
                    } else {
                        console.error('FileExplorer: 验证失败，文件浏览器初始化有问题');
                    }
                }, 500);

            } catch (error) {
                console.error('FileExplorer: 文件浏览器初始化失败:', error);
                if (retryCount < 5) {
                    console.log('FileExplorer: 将在200ms后重试 ' + (retryCount + 1) + '/5');
                    setTimeout(function() {
                        initializeFileExplorer(retryCount + 1);
                    }, 200);
                }
            }
        } else if (retryCount < 15) {
            console.log('FileExplorer: 等待主编辑器初始化... 重试 ' + (retryCount + 1) + '/15');
            setTimeout(function() {
                initializeFileExplorer(retryCount + 1);
            }, 200);
        } else {
            console.error('FileExplorer: 主编辑器初始化超时，文件浏览器无法初始化');
        }
    }

    // 延迟启动初始化
    setTimeout(function() {
        initializeFileExplorer();
    }, 500);
});

// 提供手动初始化函数，以防自动初始化失败
window.initializeFileExplorer = function() {
    console.log('FileExplorer: 手动初始化文件浏览器...');
    if (window.jsEditor && typeof FileExplorer !== 'undefined') {
        try {
            window.jsEditor.fileExplorer = new FileExplorer(window.jsEditor);
            console.log('FileExplorer: 手动初始化完成');
            return true;
        } catch (error) {
            console.error('FileExplorer: 手动初始化失败:', error);
            return false;
        }
    }
    console.error('FileExplorer: 手动初始化失败，缺少必要的依赖');
    return false;
};

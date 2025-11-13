/**
 * 简化的图表绘制脚本
 * 专门用于从 data.json 和 data.csv 读取数据并绘制图表
 */

// 全局变量
let currentData = null;

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    console.log("图表绘制脚本加载完成");

    // 绑定按钮事件
    const buttons = [
        { id: 'showTableBtn', handler: showTable },
        { id: 'showBarChartBtn', handler: drawBarChart },
        { id: 'showPieChartBtn', handler: drawPieChart },
        { id: 'showLineChartBtn', handler: drawLineChart },
        { id: 'refreshDataBtn', handler: refreshData }
    ];

    buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.handler);
        }
    });

    // 延迟加载数据
    setTimeout(loadDataAndDraw, 200);
});

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

        updateInfoPanel();
        drawBarChart(); // 默认显示柱状图

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
            name: item.language || 'Unknown',
            value: parseFloat(item.percentage) || 0,
            users: parseFloat(item.users) || 0,
            growth: parseFloat(item.growth) || 0,
            salary: parseFloat(item.salary) || 0
        }));
    }

    // 处理数组格式数据
    if (Array.isArray(data)) {
        return data.map((item, index) => ({
            name: item.language || item.name || `项目${index + 1}`,
            value: parseFloat(item.percentage || item.value || 0),
            users: parseFloat(item.users || 0),
            growth: parseFloat(item.growth || 0),
            salary: parseFloat(item.salary || 0)
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

    infoPanel.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div><strong>数据项:</strong> ${totalItems}</div>
            <div><strong>总值:</strong> ${totalValue.toFixed(1)}%</div>
            <div><strong>平均增长:</strong> ${avgGrowth.toFixed(1)}%</div>
            <div><strong>最高薪资:</strong> $${(maxSalary/1000).toFixed(0)}K</div>
        </div>
    `;
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
    const headers = ['名称', '流行度', '用户数', '增长率', '薪资'];
    const headerRow = headers.map(h => `<th>${h}</th>`).join('');

    // 创建数据行
    const dataRows = currentData.map(item => {
        return `<tr>
            <td>${item.name}</td>
            <td>${item.value.toFixed(1)}%</td>
            <td>${(item.users/1000000).toFixed(1)}M</td>
            <td>${item.growth.toFixed(1)}%</td>
            <td>$${(item.salary/1000).toFixed(0)}K</td>
        </tr>`;
    }).join('');

    dataTable.innerHTML = `
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${dataRows}</tbody>
    `;

    tableContainer.style.display = 'block';
}

/**
 * 绘制柱状图
 */
function drawBarChart() {
    hideAllCharts();
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer || !currentData || currentData.length === 0) return;

    // 清空容器
    chartContainer.innerHTML = '';

    // 创建简单的HTML柱状图
    const chartHTML = `
        <div style="padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 20px;">编程语言流行度分布</h3>
            <div style="display: flex; align-items: end; height: 300px; gap: 10px; padding: 0 20px;">
                ${currentData.map(item => `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 100%; background: linear-gradient(to top, #4CAF50, #81C784);
                                    height: ${(item.value / Math.max(...currentData.map(d => d.value))) * 250}px;
                                    border-radius: 4px 4px 0 0; position: relative;">
                            <span style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%);
                                       font-size: 12px; font-weight: bold;">${item.value.toFixed(1)}%</span>
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; text-align: center; word-break: break-all;">
                            ${item.name}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

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
    const chartHTML = `
        <div style="padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 20px;">编程语言流行度占比</h3>
            <div style="display: flex; gap: 30px; align-items: center;">
                <div style="flex: 1;">
                    <div style="width: 250px; height: 250px; border-radius: 50%; background: conic-gradient(
                        ${currentData.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const startAngle = currentData.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
                            return `${colors[index]} 0deg ${startAngle + (item.value / total) * 360}deg`;
                        }).join(', ')
                    }); position: relative;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                   background: white; border-radius: 50%; width: 100px; height: 100px;
                                   display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            总计: ${total.toFixed(1)}%
                        </div>
                    </div>
                </div>
                <div style="flex: 1;">
                    ${currentData.map((item, index) => `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 20px; height: 20px; background: ${colors[index]};
                                       border-radius: 3px; margin-right: 10px;"></div>
                            <span style="font-size: 14px;">${item.name}: ${item.value.toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

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
    const scale = 100 / maxValue;

    // 创建简单的HTML折线图
    const chartHTML = `
        <div style="padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 20px;">编程语言增长率趋势</h3>
            <div style="height: 300px; position: relative; border-left: 2px solid #ccc; border-bottom: 2px solid #ccc; margin: 0 20px;">
                <!-- 零线 -->
                <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dashed #999; z-index: 1;"></div>

                <!-- 数据点和连线 -->
                <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                    <!-- 连线 -->
                    <polyline points="${currentData.map((item, index) => {
                        const x = (index / (currentData.length - 1)) * 90 + 5;
                        const y = 50 - (item.growth * scale);
                        return `${x}%,${y}%`;
                    }).join(' ')}"
                    style="fill: none; stroke: #2196F3; stroke-width: 3;" />

                    <!-- 数据点 -->
                    ${currentData.map((item, index) => {
                        const x = (index / (currentData.length - 1)) * 90 + 5;
                        const y = 50 - (item.growth * scale);
                        return `
                            <circle cx="${x}%" cy="${y}%" r="6" fill="#2196F3" stroke="white" stroke-width="2">
                                <title>${item.name}: ${item.growth.toFixed(1)}%</title>
                            </circle>
                            <text x="${x}%" y="${y - 3}%" text-anchor="middle" font-size="10" fill="#333">
                                ${item.growth.toFixed(1)}%
                            </text>
                        `;
                    }).join('')}

                    <!-- X轴标签 -->
                    ${currentData.map((item, index) => {
                        const x = (index / (currentData.length - 1)) * 90 + 5;
                        return `
                            <text x="${x}%" y="95%" text-anchor="middle" font-size="11" fill="#666">
                                ${item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
                            </text>
                        `;
                    }).join('')}
                </svg>
            </div>
            <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #666;">
                增长率 (%) - 零线以上为正增长，零线以下为负增长
            </div>
        </div>
    `;

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
    const infoPanel = document.getElementById("dataInfo");
    if (infoPanel) {
        infoPanel.innerHTML = `<div style="padding: 15px; background: #ffebee; border-left: 4px solid #f44336; color: #c62828;">错误: ${message}</div>`;
    }
}
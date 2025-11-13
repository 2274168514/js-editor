/**
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
});
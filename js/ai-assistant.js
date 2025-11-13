/**
 * AI编程助手模块
 * 集成智谱清言API进行代码生成
 */

class AIAssistant {
    constructor(editor) {
        this.editor = editor;
        this.apiKey = '2cc28d1191594edcb718f4bb53c7f0f1.bt9k6pqPtOinYRUj';
        this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.currentGeneratedCode = '';

        // 性能优化相关
        this.promptCache = {}; // 简单缓存
        this.cacheMaxSize = 50; // 最大缓存数量
        this.requestQueue = []; // 请求队列
        this.isProcessing = false; // 防止重复调用

        this.init();
    }

    /**
     * 初始化AI助手
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // AI助手按钮
        const aiBtn = document.getElementById('aiAssistantBtn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.showDialog());
        }

        // 关闭按钮
        const closeBtn = document.getElementById('aiCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideDialog());
        }

        // 遮罩层点击关闭
        const overlay = document.getElementById('aiDialogOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.hideDialog());
        }

        // 生成代码按钮
        const generateBtn = document.getElementById('aiGenerateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateCode());
        }

        // 回车键生成
        const promptTextarea = document.getElementById('aiPrompt');
        if (promptTextarea) {
            promptTextarea.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.generateCode();
                }
            });
        }
    }

    /**
     * 显示AI对话框 - 优化版本，使用纯色设计和动画效果
     */
    showDialog() {
        const overlay = document.getElementById('aiDialogOverlay');
        const dialog = document.getElementById('aiDialog');

        // 显示纯色遮盖层，使用深色主题
        if (overlay) {
            overlay.classList.add('active');
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
            overlay.style.backdropFilter = 'none';
            overlay.style.transition = 'opacity 0.3s ease';
        }

        // 显示居中弹窗，添加淡入动画
        if (dialog) {
            dialog.classList.add('active');
            dialog.style.position = 'fixed';
            dialog.style.top = '50%';
            dialog.style.left = '50%';
            dialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
            dialog.style.opacity = '0';
            dialog.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';

            // 触发动画
            setTimeout(() => {
                dialog.style.transform = 'translate(-50%, -50%) scale(1)';
                dialog.style.opacity = '1';
            }, 50);
        }

        // 清空之前的内容
        this.clearDialog();

        // 聚焦到输入框，延迟到动画完成后
        setTimeout(() => {
            const promptTextarea = document.getElementById('aiPrompt');
            if (promptTextarea) {
                promptTextarea.focus();
                promptTextarea.select();
            }
        }, 200);
    }

    /**
     * 隐藏AI对话框 - 带动画效果
     */
    hideDialog() {
        const overlay = document.getElementById('aiDialogOverlay');
        const dialog = document.getElementById('aiDialog');

        // 添加淡出动画
        if (dialog) {
            dialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
            dialog.style.opacity = '0';

            setTimeout(() => {
                dialog.classList.remove('active');
                dialog.style.transform = '';
                dialog.style.opacity = '';
                dialog.style.transition = '';
            }, 250);
        }

        // 隐藏遮盖层
        if (overlay) {
            overlay.style.opacity = '0';

            setTimeout(() => {
                overlay.classList.remove('active');
                overlay.style.backgroundColor = '';
                overlay.style.backdropFilter = '';
                overlay.style.transition = '';
                overlay.style.opacity = '';
            }, 250);
        }
    }

    /**
     * 清空对话框内容
     */
    clearDialog() {
        const promptTextarea = document.getElementById('aiPrompt');
        const loadingDiv = document.getElementById('aiLoading');
        const statusText = document.getElementById('aiStatusText');

        if (promptTextarea) promptTextarea.value = '';
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (statusText) statusText.textContent = '就绪';

        this.currentGeneratedCode = '';
    }

    /**
     * 生成代码
     */
    async generateCode() {
        // 防止重复调用
        if (this.isProcessing) {
            console.log('AI正在处理中，请稍候...');
            return;
        }

        const promptTextarea = document.getElementById('aiPrompt');
        const targetFolder = document.getElementById('aiTargetFolder');
        const loadingDiv = document.getElementById('aiLoading');
        const statusText = document.getElementById('aiStatusText');
        const generateBtn = document.getElementById('aiGenerateBtn');

        const prompt = promptTextarea ? promptTextarea.value.trim() : '';
        const folder = targetFolder ? targetFolder.value : 'html';

        if (!prompt) {
            this.editor.logToConsole('warning', '请描述你想要创建的功能');
            return;
        }

        // 设置处理状态
        this.isProcessing = true;

        // 显示加载状态
        if (loadingDiv) loadingDiv.style.display = 'flex';
        if (statusText) statusText.textContent = 'AI正在思考...';
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        }

        try {
            const code = await this.callAPI(prompt, folder);
            this.currentGeneratedCode = code;

            // 直接应用代码到项目
            this.applyCodeToProject(code, folder);

            this.editor.logToConsole('info', `AI代码生成完成，已自动添加到${folder}文件夹`);

            if (statusText) statusText.textContent = '生成完成';
        } catch (error) {
            this.editor.logToConsole('error', `AI代码生成失败: ${error.message}`);

            if (statusText) {
                statusText.textContent = '生成失败';
                statusText.style.color = '#f48771';
            }
        } finally {
            // 清除处理状态
            this.isProcessing = false;

            // 隐藏加载状态
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> 生成代码';
            }

            // 恢复状态文本颜色
            setTimeout(() => {
                if (statusText) {
                    statusText.style.color = '';
                    statusText.textContent = '就绪';
                }
            }, 3000);
        }
    }

    /**
     * 调用智谱清言API - 优化版本
     */
    async callAPI(prompt, targetFolder) {
        // 快速缓存常用提示词模板
        const cacheKey = `${targetFolder}_${prompt.slice(0, 50)}`;
        if (this.promptCache && this.promptCache[cacheKey]) {
            return this.promptCache[cacheKey];
        }

        const systemPrompt = this.createOptimizedSystemPrompt(targetFolder);

        // 优化的请求参数 - 更快的响应
        const requestBody = {
            model: 'glm-4-flash',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: this.optimizePrompt(prompt)
                }
            ],
            temperature: 0.3, // 降低随机性，提高一致性
            max_tokens: 3000, // 减少token数量提高速度
            stream: false // 禁用流式传输，简化处理
        };

        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
                // 启用keep-alive以复用连接
                keepalive: true
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || data.error.type || 'API返回错误');
            }

            const result = data.choices[0].message.content;

            // 缓存结果
            if (!this.promptCache) this.promptCache = {};
            this.promptCache[cacheKey] = result;

            return result;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('请求超时，请稍后重试');
            }
            throw error;
        }
    }

    /**
     * 创建优化的系统提示词
     */
    createOptimizedSystemPrompt(targetFolder) {
        // 预定义的提示词模板，减少动态生成时间
        const promptTemplates = {
            html: `你是一个代码生成器。只输出纯净的HTML代码，不要任何解释、介绍或说明文字。
要求：
- 使用语义化HTML5标签
- 包含响应式meta标签
- 提供完整的结构
- 只添加必要的内联样式
- 不要包含任何markdown代码块标记

直接输出HTML代码，从<!DOCTYPE html>开始，以</html>结束。`,

            css: `你是一个CSS代码生成器。只输出纯净的CSS代码，不要任何解释、介绍或说明文字。
要求：
- 使用现代CSS3特性
- 优先使用Flexbox/Grid布局
- 包含响应式设计
- 添加动画和过渡效果
- 不要包含任何markdown代码块标记

直接输出CSS代码，从选择器开始。`,

            javascript: `你是一个JavaScript代码生成器。只输出纯净的JavaScript代码，不要任何解释、介绍或说明文字。
要求：
- 使用ES6+现代语法
- 包含DOM操作和事件处理
- 添加异步编程(async/await)
- 包含错误处理
- 模块化结构
- 不要包含任何markdown代码块标记

直接输出JavaScript代码，假设HTML元素已存在。`
        };

        return promptTemplates[targetFolder] || promptTemplates.html;
    }

    /**
     * 优化用户输入的提示词
     */
    optimizePrompt(prompt) {
        // 移除冗余词汇和礼貌用语
        const redundants = ['请帮我', '我想', '我需要', '能否', '可以', '请', '请帮我生成', '请创建', '请实现'];
        let optimized = prompt;

        redundants.forEach(word => {
            optimized = optimized.replace(new RegExp(word, 'gi'), '');
        });

        // 确保请求是直接的描述，不添加引导性文字
        if (optimized.length < 5) {
            optimized += '功能实现';
        }

        // 移除可能引导AI添加解释的词汇
        const avoidWords = ['解释', '说明', '介绍', '展示', '演示', '示例'];
        avoidWords.forEach(word => {
            optimized = optimized.replace(new RegExp(word, 'gi'), '');
        });

        return optimized.trim();
    }

    
    /**
     * 将代码应用到项目中
     */
    applyCodeToProject(code, targetFolder) {
        switch (targetFolder) {
            case 'html':
                this.applyHtmlCode(code);
                break;
            case 'css':
                this.applyCssCode(code);
                break;
            case 'javascript':
                this.applyJavaScriptCode(code);
                break;
            default:
                // 默认生成HTML文件
                this.applyHtmlCode(code);
                break;
        }
    }

    /**
     * 应用HTML代码 - 优化版本
     */
    applyHtmlCode(code) {
        const cleanCode = this.cleanCode(code, 'html');
        const fileName = this.generateFileName('html');

        const newFile = {
            name: fileName,
            type: 'html',
            icon: 'fab fa-html5',
            content: cleanCode
        };

        // 批量处理优化
        this.editor.fileExplorer.addFileToFolder('html', newFile);
        this.scheduleFileOpen(newFile, 50);
    }

    /**
     * 应用CSS代码 - 优化版本
     */
    applyCssCode(code) {
        const cleanCode = this.cleanCode(code, 'css');
        const fileName = this.generateFileName('css');

        const newFile = {
            name: fileName,
            type: 'css',
            icon: 'fab fa-css3-alt',
            content: cleanCode
        };

        this.editor.fileExplorer.addFileToFolder('css', newFile);
        this.scheduleFileOpen(newFile, 50);
    }

    /**
     * 应用JavaScript代码 - 优化版本
     */
    applyJavaScriptCode(code) {
        const cleanCode = this.cleanCode(code, 'javascript');
        const fileName = this.generateFileName('javascript');

        const newFile = {
            name: fileName,
            type: 'javascript',
            icon: 'fab fa-js',
            content: cleanCode
        };

        this.editor.fileExplorer.addFileToFolder('javascript', newFile);
        this.scheduleFileOpen(newFile, 50);
    }

    /**
     * 生成文件名
     */
    generateFileName(type) {
        // 使用性能计数器确保唯一性
        const timestamp = Date.now();
        const performanceNow = performance.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const uniqueId = Math.random().toString(36).substring(2, 4);

        // 组合多个随机源确保唯一性
        return `ai_${type}_${timestamp}_${Math.floor(performanceNow)}_${randomId}_${uniqueId}`;
    }

    /**
     * 调度文件打开，避免阻塞
     */
    scheduleFileOpen(file, delay = 50) {
        setTimeout(() => {
            this.editor.fileExplorer.openFile(file);
        }, delay);
    }

    
    /**
     * 获取文件图标
     */
    getFileIcon(type) {
        switch (type) {
            case 'html': return 'fab fa-html5';
            case 'css': return 'fab fa-css3-alt';
            case 'javascript': return 'fab fa-js';
            default: return 'fas fa-file';
        }
    }

    /**
     * 清理代码，移除markdown标记和多余内容 - 优化版本
     */
    cleanCode(code, type) {
        if (!code) return '';

        // 一次性替换所有常见的markdown标记
        let cleanCode = code
            .replace(/```[\w]*\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/`([^`]+)`/g, '$1') // 内联代码标记
            .replace(/^\s*[\*\-\+]\s*/gm, '') // markdown列表
            .replace(/^\s*\d+\.\s*/gm, ''); // 有序列表

        // 根据类型进行特定清理
        switch (type) {
            case 'html':
                cleanCode = cleanCode
                    .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                break;
            case 'css':
                cleanCode = cleanCode
                    .replace(/\/\*[\s\S]*?\*\//g, '') // CSS注释
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                break;
            case 'javascript':
                cleanCode = cleanCode
                    .replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释
                    .replace(/\/\/.*$/gm, '') // 单行注释
                    .replace(/console\.log\s*\([^)]*\);?/g, ''); // 移除调试日志
                break;
        }

        // 清理空白行和多余空白
        cleanCode = cleanCode
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        return cleanCode;
    }
}

// 页面加载完成后初始化AI助手
document.addEventListener('DOMContentLoaded', function() {
    // 等待主编辑器初始化完成
    setTimeout(() => {
        if (window.jsEditor) {
            window.jsEditor.aiAssistant = new AIAssistant(window.jsEditor);
        }
    }, 1000);
});
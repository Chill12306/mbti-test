/**
 * 像素农场 MBTI 测试 - 主逻辑文件
 * 包含：游戏状态管理、界面渲染、交互逻辑
 */

const app = {
    // ========== 游戏状态 ==========
    state: {
        qIndex: 0,
        scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
        finished: false
    },

    // ========== DOM 元素缓存 ==========
    elements: {
        screen: null,
        saveBtn: null,
        body: null
    },

    // ========== 计分映射 ==========
    scoreMap: {
        'EI': { pos: 'E', neg: 'I' },
        'SN': { pos: 'S', neg: 'N' },
        'TF': { pos: 'T', neg: 'F' },
        'JP': { pos: 'J', neg: 'P' }
    },

    // ========== 初始化 ==========
    init() {
        // 缓存 DOM 元素
        this.elements.screen = document.getElementById('main-screen');
        this.elements.saveBtn = document.getElementById('save-slot-btn');
        this.elements.body = document.body;
        
        // 检查是否有存档
        const saved = localStorage.getItem('rpg_mbti_save');
        if (saved) {
            this.elements.saveBtn.style.display = 'block';
        }
        
        // 开始游戏
        this.renderQuestion();
    },

    // ========== 渲染题目 ==========
    renderQuestion() {
        // 检查是否完成
        if (this.state.qIndex >= GAME_DATA.questions.length) {
            this.finishGame();
            return;
        }

        const q = GAME_DATA.questions[this.state.qIndex];
        const progress = ((this.state.qIndex) / GAME_DATA.questions.length) * 100;
        const dimName = GAME_DATA.dimensionNames[q.dim];

        const html = `
            <div class="quest-title fade-in">Quest ${this.state.qIndex + 1}/20</div>
            <div class="question-text fade-in">"${q.text}"</div>
            <div class="options-list">
                ${q.opts.map((opt, i) => `
                    <button class="wood-btn fade-in" onclick="app.handleChoice(${opt.s}, '${q.dim}')" style="animation-delay: ${i * 0.1}s">
                        ▸ ${opt.t}
                    </button>
                `).join('')}
            </div>
            <div class="progress-container">
                <div class="progress-label">
                    <span>QUEST PROG. [${dimName}]</span>
                    <span>${Math.floor(progress)}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        this.elements.screen.innerHTML = html;
    },

    // ========== 处理选择 ==========
    handleChoice(score, dim) {
        const mapping = this.scoreMap[dim];
        
        // 计分
        if (score > 0) {
            this.state.scores[mapping.pos]++;
        } else {
            this.state.scores[mapping.neg]++;
        }

        // 进入下一题
        this.state.qIndex++;
        this.saveGame();
        this.renderQuestion();
    },

    // ========== 完成游戏 ==========
    finishGame() {
        this.state.finished = true;
        this.saveGame();

        // 计算 MBTI 类型
        const type = 
            (this.state.scores.E >= this.state.scores.I ? 'E' : 'I') +
            (this.state.scores.S >= this.state.scores.N ? 'S' : 'N') +
            (this.state.scores.T >= this.state.scores.F ? 'T' : 'F') +
            (this.state.scores.J >= this.state.scores.P ? 'J' : 'P');
        
        const data = GAME_DATA.mbtiTypes[type];

        // 切换背景
        this.elements.body.className = 'bg-harvest';
        this.createFallingLeaves();

        // 渲染结果
        const html = `
            <div class="result-card">
                <div class="result-icon">🏆</div>
                <div style="font-size: 2rem; color: var(--c-wheat); margin-bottom: 10px;">QUEST CLEAR!</div>
                <div class="result-type">${type}</div>
                <div class="result-role">${data.role}</div>
                <div class="result-desc-box">
                    <p style="margin: 0;">${data.desc}</p>
                </div>
                <button class="wood-btn" style="width: 100%; text-align: center;" onclick="app.resetGame()">
                    🔄 NEW GAME +
                </button>
            </div>
        `;
        this.elements.screen.innerHTML = html;
    },

    // ========== 创建落叶动画 ==========
    createFallingLeaves() {
        // 清除旧叶子
        document.querySelectorAll('.falling-leaf').forEach(e => e.remove());
        
        // 创建新叶子
        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'falling-leaf';
            leaf.style.left = Math.random() * 100 + 'vw';
            leaf.style.animationDuration = (Math.random() * 3 + 2) + 's';
            leaf.style.animationDelay = (Math.random() * 2) + 's';
            leaf.style.background = Math.random() > 0.5 ? 'var(--c-wheat)' : 'var(--c-orange)';
            this.elements.body.appendChild(leaf);
        }
    },

    // ========== 保存游戏 ==========
    saveGame() {
        localStorage.setItem('rpg_mbti_save', JSON.stringify(this.state));
    },

    // ========== 加载存档 ==========
    loadSavedGame() {
        const saved = localStorage.getItem('rpg_mbti_save');
        if (saved) {
            this.state = JSON.parse(saved);
            if (this.state.finished) {
                this.finishGame();
            } else {
                this.renderQuestion();
            }
        }
    },

    // ========== 重置游戏 ==========
    resetGame() {
        localStorage.removeItem('rpg_mbti_save');
        this.state = {
            qIndex: 0,
            scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
            finished: false
        };
        this.elements.saveBtn.style.display = 'none';
        this.elements.body.className = 'bg-cottage';
        document.querySelectorAll('.falling-leaf').forEach(e => e.remove());
        this.renderQuestion();
    }
};

// ========== 启动游戏 ==========
app.init();

/**
 * 季节管理模块
 * 负责日期获取、季节判断和季节配置
 */

const SeasonManager = {
    // 季节配置
    seasons: {
        spring: {
            name: '春',
            nameEn: 'Spring',
            months: [3, 4, 5],
            colors: {
                sky: ['#fce7f3', '#fbcfe8', '#f9a8d4'],
                ground: '#4ade80',
                accent: '#ffb7c5'
            },
            plants: ['cherry', 'tulip', 'willow'],
            particles: 'petals',
            description: '万物复苏'
        },
        summer: {
            name: '夏',
            nameEn: 'Summer',
            months: [6, 7, 8],
            colors: {
                sky: ['#064e3b', '#065f46', '#047857'],
                ground: '#166534',
                accent: '#fbbf24'
            },
            plants: ['sunflower', 'lotus', 'bamboo'],
            particles: 'fireflies',
            description: '生机盎然'
        },
        autumn: {
            name: '秋',
            nameEn: 'Autumn',
            months: [9, 10, 11],
            colors: {
                sky: ['#431407', '#7c2d12', '#c2410c'],
                ground: '#78350f',
                accent: '#f97316'
            },
            plants: ['maple', 'ginkgo', 'chrysanthemum'],
            particles: 'leaves',
            description: '金风送爽'
        },
        winter: {
            name: '冬',
            nameEn: 'Winter',
            months: [12, 1, 2],
            colors: {
                sky: ['#0f172a', '#1e293b', '#334155'],
                ground: '#e2e8f0',
                accent: '#e0f2fe'
            },
            plants: ['pine', 'plum', 'holly'],
            particles: 'snow',
            description: '银装素裹'
        }
    },

    currentSeason: null,
    currentDate: null,

    // 初始化
    init() {
        this.currentDate = new Date();
        this.currentSeason = this.detectSeason();
        this.updateDisplay();
        return this.currentSeason;
    },

    // 检测当前季节
    detectSeason() {
        const month = this.currentDate.getMonth() + 1;
        
        for (const [key, season] of Object.entries(this.seasons)) {
            if (season.months.includes(month)) {
                return key;
            }
        }
        return 'spring';
    },

    // 获取当前季节配置
    getConfig() {
        return this.seasons[this.currentSeason];
    },

    // 更新UI显示
    updateDisplay() {
        const config = this.getConfig();
        const dateStr = this.formatDate();
        
        document.getElementById('dateDisplay').textContent = dateStr;
        document.getElementById('seasonDisplay').textContent = 
            `${config.name} · ${config.description}`;
    },

    // 格式化日期
    formatDate() {
        const year = this.currentDate.getFullYear();
        const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.currentDate.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    },

    // 手动设置季节（用于测试）
    setSeason(seasonKey) {
        if (this.seasons[seasonKey]) {
            this.currentSeason = seasonKey;
            this.updateDisplay();
            return true;
        }
        return false;
    }
};

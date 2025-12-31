/**
 * 主入口模块
 * 初始化所有系统并协调它们的工作
 */

const App = {
    // 初始化应用
    async init() {
        console.log('🌱 四季之声 - 初始化中...');
        
        // 1. 初始化季节管理器
        SeasonManager.init();
        const seasonConfig = SeasonManager.getConfig();
        console.log(`📅 当前季节: ${seasonConfig.name} (${seasonConfig.nameEn})`);
        
        // 2. 初始化背景系统
        BackgroundSystem.init(seasonConfig);
        BackgroundSystem.start();
        console.log('🎨 背景系统已启动');
        
        // 3. 初始化植物系统
        PlantSystem.init(seasonConfig);
        PlantSystem.start();
        console.log('🌿 植物系统已启动');
        
        // 4. 初始化音频系统
        await AudioManager.init();
        
        // 设置音频回调
        AudioManager.onVolumeChange = (volume) => {
            PlantSystem.setVolume(volume);
        };
        
        AudioManager.onFrequencyChange = (frequencies) => {
            PlantSystem.setFrequencies(frequencies);
        };
        
        console.log('🎤 音频系统已就绪');
        
        // 5. 添加键盘快捷键（用于测试季节切换）
        this.setupKeyboardShortcuts();
        
        console.log('✨ 初始化完成！');
    },
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 数字键 1-4 切换季节（用于测试）
            const seasonKeys = {
                '1': 'spring',
                '2': 'summer',
                '3': 'autumn',
                '4': 'winter'
            };
            
            if (seasonKeys[e.key]) {
                this.changeSeason(seasonKeys[e.key]);
            }
        });
    },
    
    // 切换季节
    changeSeason(seasonKey) {
        if (SeasonManager.setSeason(seasonKey)) {
            const newConfig = SeasonManager.getConfig();
            
            // 停止当前动画
            BackgroundSystem.stop();
            PlantSystem.stop();
            
            // 重新初始化
            BackgroundSystem.init(newConfig);
            BackgroundSystem.start();
            
            PlantSystem.init(newConfig);
            PlantSystem.start();
            
            console.log(`🔄 季节已切换至: ${newConfig.name}`);
        }
    }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

/**
 * 音频采集模块
 * 使用 Web Audio API 采集麦克风音频并分析频率
 */

const AudioManager = {
    audioContext: null,
    analyser: null,
    microphone: null,
    dataArray: null,
    isActive: false,
    volume: 0,
    frequencies: [],
    smoothVolume: 0,
    sensitivity: 1.0,  // 灵敏度倍率
    
    // 回调函数
    onVolumeChange: null,
    onFrequencyChange: null,

    // 初始化
    async init() {
        this.setupUI();
    },

    // 设置UI事件
    setupUI() {
        const btn = document.getElementById('startAudio');
        const slider = document.getElementById('sensitivitySlider');
        const sliderGroup = document.getElementById('sliderGroup');
        const valueDisplay = document.getElementById('sensitivityValue');
        
        btn.addEventListener('click', () => this.toggle());
        
        // 灵敏度滑块事件
        slider.addEventListener('input', (e) => {
            this.sensitivity = parseFloat(e.target.value);
            valueDisplay.textContent = `${this.sensitivity.toFixed(1)}x`;
        });
    },

    // 切换音频采集
    async toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            await this.start();
        }
    },

    // 开始采集
    async start() {
        try {
            // 请求麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            
            // 配置分析器
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // 连接麦克风到分析器
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            // 创建数据数组
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.isActive = true;
            this.updateUI(true);
            this.analyze();
            
            // 隐藏提示文字
            document.getElementById('hintText').style.opacity = '0';
            
        } catch (error) {
            console.error('无法访问麦克风:', error);
            alert('无法访问麦克风，请确保已授予权限');
        }
    },

    // 停止采集
    stop() {
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.isActive = false;
        this.volume = 0;
        this.smoothVolume = 0;
        this.updateUI(false);
        this.updateVolumeMeter(0);
    },

    // 分析音频数据
    analyze() {
        if (!this.isActive) return;

        this.analyser.getByteFrequencyData(this.dataArray);
        
        // 计算平均音量
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        // 应用灵敏度倍率
        this.volume = Math.min(1, (sum / this.dataArray.length / 255) * this.sensitivity);
        
        // 平滑处理
        this.smoothVolume += (this.volume - this.smoothVolume) * 0.1;
        
        // 提取频率段（也应用灵敏度）
        this.frequencies = this.extractFrequencyBands();
        
        // 更新音量条
        this.updateVolumeMeter(this.smoothVolume);
        
        // 触发回调
        if (this.onVolumeChange) {
            this.onVolumeChange(this.smoothVolume);
        }
        if (this.onFrequencyChange) {
            this.onFrequencyChange(this.frequencies);
        }

        requestAnimationFrame(() => this.analyze());
    },

    // 提取频率段
    extractFrequencyBands() {
        const bands = {
            bass: 0,      // 低频 (20-250Hz)
            mid: 0,       // 中频 (250-2000Hz)
            treble: 0     // 高频 (2000-20000Hz)
        };
        
        const binCount = this.dataArray.length;
        const bassEnd = Math.floor(binCount * 0.1);
        const midEnd = Math.floor(binCount * 0.5);
        
        let bassSum = 0, midSum = 0, trebleSum = 0;
        
        for (let i = 0; i < binCount; i++) {
            if (i < bassEnd) {
                bassSum += this.dataArray[i];
            } else if (i < midEnd) {
                midSum += this.dataArray[i];
            } else {
                trebleSum += this.dataArray[i];
            }
        }
        
        // 应用灵敏度倍率
        bands.bass = Math.min(1, (bassSum / bassEnd / 255) * this.sensitivity);
        bands.mid = Math.min(1, (midSum / (midEnd - bassEnd) / 255) * this.sensitivity);
        bands.treble = Math.min(1, (trebleSum / (binCount - midEnd) / 255) * this.sensitivity);
        
        return bands;
    },

    // 更新UI状态
    updateUI(active) {
        const btn = document.getElementById('startAudio');
        const meter = document.getElementById('volumeMeter');
        const sliderGroup = document.getElementById('sliderGroup');
        const btnText = btn.querySelector('.btn-text');
        
        if (active) {
            btn.classList.add('active');
            meter.classList.add('active');
            sliderGroup.classList.add('active');
            btnText.textContent = '关闭声音感应';
        } else {
            btn.classList.remove('active');
            meter.classList.remove('active');
            sliderGroup.classList.remove('active');
            btnText.textContent = '开启声音感应';
        }
    },

    // 更新音量条
    updateVolumeMeter(volume) {
        const bar = document.querySelector('.volume-bar');
        bar.style.width = `${volume * 100}%`;
    },

    // 获取当前音量
    getVolume() {
        return this.smoothVolume;
    },

    // 获取频率数据
    getFrequencies() {
        return this.frequencies;
    }
};

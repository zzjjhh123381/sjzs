/**
 * 动态背景模块
 * 根据季节生成不同的粒子效果
 */

const BackgroundSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    seasonConfig: null,
    animationId: null,

    // 初始化
    init(seasonConfig) {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.seasonConfig = seasonConfig;
        this.resize();
        this.createParticles();
        
        window.addEventListener('resize', () => this.resize());
    },

    // 调整画布大小
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // 创建粒子
    createParticles() {
        this.particles = [];
        const count = this.getParticleCount();
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    },

    // 获取粒子数量
    getParticleCount() {
        const type = this.seasonConfig.particles;
        const counts = {
            petals: 60,
            fireflies: 40,
            leaves: 50,
            snow: 100
        };
        return counts[type] || 50;
    },

    // 创建单个粒子
    createParticle(fromTop = false) {
        const type = this.seasonConfig.particles;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const base = {
            x: Math.random() * w,
            y: fromTop ? -20 : Math.random() * h,
            size: 0,
            speedX: 0,
            speedY: 0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0,
            opacity: 0,
            color: ''
        };

        switch (type) {
            case 'petals': // 春天樱花瓣
                return {
                    ...base,
                    size: 8 + Math.random() * 12,
                    speedX: -0.5 + Math.random() * 1,
                    speedY: 1 + Math.random() * 2,
                    rotationSpeed: 0.02 + Math.random() * 0.04,
                    opacity: 0.6 + Math.random() * 0.4,
                    color: `hsl(${340 + Math.random() * 20}, 80%, ${75 + Math.random() * 15}%)`
                };

            case 'fireflies': // 夏天萤火虫
                return {
                    ...base,
                    y: h * 0.5 + Math.random() * h * 0.5,
                    size: 3 + Math.random() * 4,
                    speedX: -0.3 + Math.random() * 0.6,
                    speedY: -0.2 + Math.random() * 0.4,
                    opacity: Math.random(),
                    pulseSpeed: 0.02 + Math.random() * 0.03,
                    pulsePhase: Math.random() * Math.PI * 2,
                    color: `hsl(${60 + Math.random() * 30}, 100%, 70%)`
                };

            case 'leaves': // 秋天落叶
                return {
                    ...base,
                    size: 15 + Math.random() * 20,
                    speedX: -1 + Math.random() * 2,
                    speedY: 2 + Math.random() * 3,
                    rotationSpeed: 0.03 + Math.random() * 0.05,
                    swayAmplitude: 30 + Math.random() * 50,
                    swaySpeed: 0.02 + Math.random() * 0.02,
                    swayPhase: Math.random() * Math.PI * 2,
                    opacity: 0.7 + Math.random() * 0.3,
                    color: `hsl(${20 + Math.random() * 30}, ${70 + Math.random() * 20}%, ${45 + Math.random() * 20}%)`
                };

            case 'snow': // 冬天雪花
                return {
                    ...base,
                    size: 2 + Math.random() * 6,
                    speedX: -0.5 + Math.random() * 1,
                    speedY: 1 + Math.random() * 2,
                    opacity: 0.5 + Math.random() * 0.5,
                    wobbleAmplitude: 0.5 + Math.random() * 1,
                    wobbleSpeed: 0.02 + Math.random() * 0.02,
                    wobblePhase: Math.random() * Math.PI * 2,
                    color: '#ffffff'
                };
        }
        return base;
    },

    // 更新粒子
    update() {
        const type = this.seasonConfig.particles;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.particles.forEach((p, index) => {
            switch (type) {
                case 'petals':
                    p.x += p.speedX;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed;
                    break;

                case 'fireflies':
                    p.x += p.speedX + Math.sin(Date.now() * 0.001 + index) * 0.5;
                    p.y += p.speedY + Math.cos(Date.now() * 0.001 + index) * 0.3;
                    p.pulsePhase += p.pulseSpeed;
                    p.opacity = 0.3 + Math.sin(p.pulsePhase) * 0.7;
                    
                    // 边界反弹
                    if (p.x < 0 || p.x > w) p.speedX *= -1;
                    if (p.y < h * 0.4 || p.y > h) p.speedY *= -1;
                    break;

                case 'leaves':
                    p.swayPhase += p.swaySpeed;
                    p.x += p.speedX + Math.sin(p.swayPhase) * 2;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed;
                    break;

                case 'snow':
                    p.wobblePhase += p.wobbleSpeed;
                    p.x += p.speedX + Math.sin(p.wobblePhase) * p.wobbleAmplitude;
                    p.y += p.speedY;
                    break;
            }

            // 重置超出边界的粒子
            if (type !== 'fireflies') {
                if (p.y > h + 50 || p.x < -50 || p.x > w + 50) {
                    Object.assign(p, this.createParticle(true));
                    p.x = Math.random() * w;
                }
            }
        });
    },

    // 绘制背景渐变
    drawBackground() {
        const colors = this.seasonConfig.colors.sky;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // 绘制粒子
    drawParticles() {
        const type = this.seasonConfig.particles;

        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.opacity;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);

            switch (type) {
                case 'petals':
                    this.drawPetal(p);
                    break;
                case 'fireflies':
                    this.drawFirefly(p);
                    break;
                case 'leaves':
                    this.drawLeaf(p);
                    break;
                case 'snow':
                    this.drawSnowflake(p);
                    break;
            }

            this.ctx.restore();
        });
    },

    // 绘制樱花瓣
    drawPetal(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        this.ctx.fill();
    },

    // 绘制萤火虫
    drawFirefly(p) {
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.3, `hsla(60, 100%, 70%, ${p.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
        this.ctx.fill();
    },

    // 绘制落叶
    drawLeaf(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size * 0.5);
        this.ctx.quadraticCurveTo(p.size * 0.5, 0, 0, p.size * 0.5);
        this.ctx.quadraticCurveTo(-p.size * 0.5, 0, 0, -p.size * 0.5);
        this.ctx.fill();
        
        // 叶脉
        this.ctx.strokeStyle = `rgba(0,0,0,0.2)`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size * 0.4);
        this.ctx.lineTo(0, p.size * 0.4);
        this.ctx.stroke();
    },

    // 绘制雪花
    drawSnowflake(p) {
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
    },

    // 渲染循环
    render() {
        this.drawBackground();
        this.update();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.render());
    },

    // 开始动画
    start() {
        this.render();
    },

    // 停止动画
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
};

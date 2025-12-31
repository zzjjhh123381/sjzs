/**
 * 植物生成模块
 * 使用分形算法生成程序化植物
 */

const PlantSystem = {
    canvas: null,
    ctx: null,
    plants: [],
    seasonConfig: null,
    volume: 0,
    frequencies: { bass: 0, mid: 0, treble: 0 },
    animationId: null,
    groundY: 0,

    // 植物类型配置
    plantTypes: {
        // 春天植物
        cherry: {
            name: '樱花树',
            trunkColor: '#5d4037',
            leafColor: ['#ffb7c5', '#ffc1cc', '#ff9eb5', '#ffd1dc'],
            maxHeight: 300,
            branchAngle: 25,
            branchRatio: 0.7,
            leafSize: 12,
            leafDensity: 0.8
        },
        tulip: {
            name: '郁金香',
            trunkColor: '#2e7d32',
            leafColor: ['#e91e63', '#f44336', '#ff9800', '#ffeb3b'],
            maxHeight: 120,
            branchAngle: 5,
            branchRatio: 0.9,
            leafSize: 20,
            leafDensity: 0.3,
            isFlower: true
        },
        willow: {
            name: '柳树',
            trunkColor: '#5d4037',
            leafColor: ['#81c784', '#a5d6a7', '#c8e6c9'],
            maxHeight: 280,
            branchAngle: 35,
            branchRatio: 0.75,
            leafSize: 4,
            leafDensity: 1.2,
            drooping: true
        },
        // 夏天植物
        sunflower: {
            name: '向日葵',
            trunkColor: '#558b2f',
            leafColor: ['#fdd835', '#ffeb3b', '#fff176'],
            centerColor: '#5d4037',
            maxHeight: 200,
            branchAngle: 8,
            branchRatio: 0.95,
            leafSize: 35,
            leafDensity: 0.2,
            isFlower: true
        },
        lotus: {
            name: '荷花',
            trunkColor: '#66bb6a',
            leafColor: ['#f8bbd9', '#f48fb1', '#ec407a'],
            maxHeight: 150,
            branchAngle: 10,
            branchRatio: 0.9,
            leafSize: 25,
            leafDensity: 0.3,
            isFlower: true
        },
        bamboo: {
            name: '竹子',
            trunkColor: '#7cb342',
            leafColor: ['#8bc34a', '#9ccc65', '#aed581'],
            maxHeight: 350,
            branchAngle: 45,
            branchRatio: 0.85,
            leafSize: 15,
            leafDensity: 0.5,
            segmented: true
        },
        // 秋天植物
        maple: {
            name: '枫树',
            trunkColor: '#4e342e',
            leafColor: ['#ff5722', '#ff7043', '#e64a19', '#d84315', '#bf360c'],
            maxHeight: 280,
            branchAngle: 30,
            branchRatio: 0.68,
            leafSize: 15,
            leafDensity: 0.9
        },
        ginkgo: {
            name: '银杏',
            trunkColor: '#5d4037',
            leafColor: ['#ffc107', '#ffca28', '#ffd54f', '#ffe082'],
            maxHeight: 260,
            branchAngle: 25,
            branchRatio: 0.72,
            leafSize: 14,
            leafDensity: 0.85,
            fanLeaf: true
        },
        chrysanthemum: {
            name: '菊花',
            trunkColor: '#558b2f',
            leafColor: ['#ff9800', '#ffc107', '#ffeb3b', '#fff9c4'],
            maxHeight: 100,
            branchAngle: 15,
            branchRatio: 0.9,
            leafSize: 18,
            leafDensity: 0.4,
            isFlower: true
        },
        // 冬天植物
        pine: {
            name: '松树',
            trunkColor: '#4e342e',
            leafColor: ['#1b5e20', '#2e7d32', '#388e3c'],
            maxHeight: 320,
            branchAngle: 35,
            branchRatio: 0.7,
            leafSize: 20,
            leafDensity: 0.7,
            conifer: true
        },
        plum: {
            name: '梅花',
            trunkColor: '#3e2723',
            leafColor: ['#f8bbd9', '#f48fb1', '#ec407a', '#ffffff'],
            maxHeight: 200,
            branchAngle: 40,
            branchRatio: 0.65,
            leafSize: 10,
            leafDensity: 0.5,
            isFlower: true
        },
        holly: {
            name: '冬青',
            trunkColor: '#33691e',
            leafColor: ['#1b5e20', '#2e7d32'],
            berryColor: '#c62828',
            maxHeight: 180,
            branchAngle: 30,
            branchRatio: 0.75,
            leafSize: 8,
            leafDensity: 0.6
        }
    },

    // 初始化
    init(seasonConfig) {
        this.canvas = document.getElementById('plantCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.seasonConfig = seasonConfig;
        this.resize();
        this.createPlants();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.createPlants();
        });
    },

    // 调整画布大小
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.groundY = this.canvas.height * 0.85;
    },

    // 创建植物
    createPlants() {
        this.plants = [];
        const plantNames = this.seasonConfig.plants;
        const spacing = this.canvas.width / (plantNames.length + 1);
        
        plantNames.forEach((name, index) => {
            const config = this.plantTypes[name];
            if (config) {
                const plant = {
                    type: name,
                    config: config,
                    x: spacing * (index + 1),
                    y: this.groundY,
                    growth: 0.1,
                    targetGrowth: 0.1,
                    branches: [],
                    // 预生成树结构的随机种子
                    seed: Math.random() * 10000,
                    // 预生成叶子数据
                    leafData: this.generateLeafData(config)
                };
                this.plants.push(plant);
            }
        });
    },

    // 预生成叶子数据，避免每帧随机导致闪烁
    generateLeafData(config) {
        const leafGroups = [];
        // 为每个可能的分支节点预生成叶子
        for (let depth = 0; depth < 8; depth++) {
            const nodesAtDepth = Math.pow(2, depth);
            for (let node = 0; node < nodesAtDepth; node++) {
                const leaves = [];
                // 大幅增加叶子数量
                const leafCount = 15 + Math.floor(Math.random() * 20);
                for (let i = 0; i < leafCount; i++) {
                    leaves.push({
                        offsetX: (Math.random() - 0.5) * 6,
                        offsetY: (Math.random() - 0.5) * 5,
                        sizeFactor: 0.4 + Math.random() * 0.6,
                        rotation: Math.random() * Math.PI * 2,
                        colorIndex: Math.floor(Math.random() * config.leafColor.length)
                    });
                }
                leafGroups.push(leaves);
            }
        }
        return leafGroups;
    },

    // 更新音量
    setVolume(volume) {
        this.volume = volume;
        // 根据音量设置目标生长值
        this.plants.forEach(plant => {
            plant.targetGrowth = 0.1 + volume * 0.9;
        });
    },

    // 更新频率
    setFrequencies(frequencies) {
        this.frequencies = frequencies;
    },

    // 更新植物状态
    update() {
        this.plants.forEach(plant => {
            // 平滑过渡生长值
            plant.growth += (plant.targetGrowth - plant.growth) * 0.05;
        });
    },

    // 绘制地面
    drawGround() {
        const gradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.canvas.height);
        gradient.addColorStop(0, this.seasonConfig.colors.ground);
        gradient.addColorStop(1, this.darkenColor(this.seasonConfig.colors.ground, 30));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        
        // 绘制起伏的地面
        for (let x = 0; x <= this.canvas.width; x += 50) {
            const y = this.groundY + Math.sin(x * 0.01) * 10;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
    },

    // 绘制单棵植物
    drawPlant(plant) {
        const config = plant.config;
        const height = config.maxHeight * plant.growth;
        const thickness = 8 + plant.growth * 12;
        
        this.ctx.save();
        this.ctx.translate(plant.x, plant.y);
        
        if (config.isFlower) {
            this.drawFlower(plant, height, thickness);
        } else if (config.conifer) {
            this.drawConifer(plant, height, thickness);
        } else if (config.segmented) {
            this.drawBamboo(plant, height, thickness);
        } else {
            this.drawTree(plant, height, thickness, 0, 5);
        }
        
        this.ctx.restore();
    },

    // 绘制树（分形）- 使用确定性随机
    drawTree(plant, length, thickness, angle, depth, nodeIndex = 0) {
        if (depth === 0 || length < 5) return;
        
        const config = plant.config;
        const ctx = this.ctx;
        
        ctx.save();
        ctx.rotate(angle * Math.PI / 180);
        
        // 绘制树干/树枝
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -length);
        ctx.strokeStyle = config.trunkColor;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.translate(0, -length);
        
        // 在更多层级绘制叶子，让树冠更茂盛
        if (depth <= 4 && plant.growth > 0.2) {
            this.drawLeaves(plant, config.leafSize * plant.growth * (1 + (4 - depth) * 0.3), nodeIndex);
        }
        
        // 递归绘制分支
        const newLength = length * config.branchRatio;
        const newThickness = thickness * 0.7;
        const angleVar = config.branchAngle + this.frequencies.mid * 10;
        
        // 左分支
        this.drawTree(plant, newLength, newThickness, -angleVar, depth - 1, nodeIndex * 2);
        // 右分支
        this.drawTree(plant, newLength, newThickness, angleVar, depth - 1, nodeIndex * 2 + 1);
        
        // 额外中间分支让树更茂盛
        if (depth >= 3 && plant.growth > 0.5) {
            this.drawTree(plant, newLength * 0.8, newThickness * 0.6, 0, depth - 2, nodeIndex * 2 + 50);
        }
        
        ctx.restore();
    },

    // 绘制叶子 - 使用预生成数据避免闪烁
    drawLeaves(plant, size, nodeIndex) {
        const config = plant.config;
        const ctx = this.ctx;
        
        // 获取预生成的叶子数据
        const leafGroup = plant.leafData[nodeIndex % plant.leafData.length];
        // 根据生长值显示更多叶子
        const visibleCount = Math.floor(leafGroup.length * Math.min(1, plant.growth * 1.5));
        
        for (let i = 0; i < visibleCount; i++) {
            const leaf = leafGroup[i];
            const color = config.leafColor[leaf.colorIndex];
            const leafSize = size * leaf.sizeFactor;
            
            ctx.save();
            ctx.translate(leaf.offsetX * size * 0.8, leaf.offsetY * size * 0.8);
            ctx.rotate(leaf.rotation);
            
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.85;
            
            if (config.fanLeaf) {
                // 扇形叶（银杏）
                ctx.beginPath();
                ctx.arc(0, 0, leafSize, -Math.PI * 0.7, Math.PI * 0.7);
                ctx.lineTo(0, leafSize * 0.5);
                ctx.closePath();
                ctx.fill();
            } else {
                // 普通叶子 - 更自然的形状
                ctx.beginPath();
                ctx.moveTo(0, -leafSize);
                ctx.quadraticCurveTo(leafSize * 0.5, -leafSize * 0.5, leafSize * 0.3, 0);
                ctx.quadraticCurveTo(leafSize * 0.1, leafSize * 0.3, 0, leafSize * 0.5);
                ctx.quadraticCurveTo(-leafSize * 0.1, leafSize * 0.3, -leafSize * 0.3, 0);
                ctx.quadraticCurveTo(-leafSize * 0.5, -leafSize * 0.5, 0, -leafSize);
                ctx.fill();
            }
            
            ctx.restore();
        }
    },

    // 绘制花朵
    drawFlower(plant, height, thickness) {
        const config = plant.config;
        const ctx = this.ctx;
        
        // 茎
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            thickness * Math.sin(Date.now() * 0.001) * plant.growth,
            -height * 0.5,
            0,
            -height
        );
        ctx.strokeStyle = config.trunkColor;
        ctx.lineWidth = thickness * 0.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // 花朵
        ctx.save();
        ctx.translate(0, -height);
        
        const petalCount = 8 + Math.floor(plant.growth * 8);
        const petalSize = config.leafSize * plant.growth;
        
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const color = config.leafColor[i % config.leafColor.length];
            
            ctx.save();
            ctx.rotate(angle);
            ctx.translate(0, -petalSize * 0.5);
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, -petalSize * 0.5, petalSize * 0.4, petalSize, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // 花心
        if (config.centerColor) {
            ctx.fillStyle = config.centerColor;
            ctx.beginPath();
            ctx.arc(0, 0, petalSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },

    // 绘制针叶树
    drawConifer(plant, height, thickness) {
        const config = plant.config;
        const ctx = this.ctx;
        
        // 树干
        ctx.fillStyle = config.trunkColor;
        ctx.fillRect(-thickness * 0.5, -height * 0.3, thickness, height * 0.3);
        
        // 树冠层
        const layers = 4 + Math.floor(plant.growth * 3);
        const layerHeight = height * 0.8 / layers;
        
        for (let i = 0; i < layers; i++) {
            const y = -height * 0.3 - i * layerHeight;
            const width = (layers - i) * 25 * plant.growth;
            const color = config.leafColor[i % config.leafColor.length];
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, y - layerHeight * 1.2);
            ctx.lineTo(-width, y);
            ctx.lineTo(width, y);
            ctx.closePath();
            ctx.fill();
        }
    },

    // 绘制竹子
    drawBamboo(plant, height, thickness) {
        const config = plant.config;
        const ctx = this.ctx;
        
        const segments = 5 + Math.floor(plant.growth * 5);
        const segmentHeight = height / segments;
        
        for (let i = 0; i < segments; i++) {
            const y = -i * segmentHeight;
            const segThickness = thickness * (1 - i * 0.05);
            
            // 竹节
            ctx.fillStyle = config.trunkColor;
            ctx.fillRect(-segThickness * 0.5, y - segmentHeight, segThickness, segmentHeight - 2);
            
            // 节点
            ctx.fillStyle = this.darkenColor(config.trunkColor, 20);
            ctx.fillRect(-segThickness * 0.6, y - 4, segThickness * 1.2, 4);
            
            // 叶子
            if (i > 1 && Math.random() < config.leafDensity) {
                this.drawBambooLeaves(plant, y - segmentHeight * 0.5, segThickness);
            }
        }
    },

    // 绘制竹叶
    drawBambooLeaves(plant, y, thickness) {
        const config = plant.config;
        const ctx = this.ctx;
        const side = Math.random() > 0.5 ? 1 : -1;
        
        ctx.save();
        ctx.translate(thickness * 0.5 * side, y);
        
        for (let i = 0; i < 3; i++) {
            const angle = (side * 30 + (i - 1) * 15) * Math.PI / 180;
            const leafLength = config.leafSize * plant.growth;
            const color = config.leafColor[i % config.leafColor.length];
            
            ctx.save();
            ctx.rotate(angle);
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leafLength * 0.5, -3, leafLength, 0);
            ctx.quadraticCurveTo(leafLength * 0.5, 3, 0, 0);
            ctx.fill();
            
            ctx.restore();
        }
        
        ctx.restore();
    },

    // 颜色加深
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },

    // 渲染
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
        this.drawGround();
        this.plants.forEach(plant => this.drawPlant(plant));
        this.animationId = requestAnimationFrame(() => this.render());
    },

    // 开始
    start() {
        this.render();
    },

    // 停止
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
};

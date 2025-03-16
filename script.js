// 全局变量
let currentDistribution = null;
let distributionChart = null;
let simulationChart = null;
let isCumulative = false;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图标
    lucide.createIcons();
    
    // 为分布按钮添加事件监听器
    const distributionButtons = document.querySelectorAll('.distribution-btn');
    distributionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const distName = this.getAttribute('data-dist');
            loadDistribution(distName);
            
            // 更新按钮样式
            distributionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 初始化图表
    initCharts();
    
    // 设置计算器类型切换事件
    document.getElementById('prob-calc-type').addEventListener('change', toggleCalculatorInputs);
    
    // 设置计算按钮事件
    document.getElementById('calc-probability').addEventListener('click', calculateProbability);
    document.getElementById('calc-probability-range').addEventListener('click', calculateProbabilityRange);
    
    // 设置累积分布切换
    document.getElementById('toggle-cumulative').addEventListener('click', toggleCumulativeDistribution);
    
    // 设置样本生成按钮事件
    document.getElementById('generate-samples').addEventListener('click', generateSamples);
    
    // 样本大小滑块事件
    document.getElementById('sample-size').addEventListener('input', function() {
        document.getElementById('sample-size-value').textContent = this.value;
    });
    
    // 主题切换
    document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
    
    // 模态框事件
    document.getElementById('show-help').addEventListener('click', function() {
        document.getElementById('help-modal').classList.remove('hidden');
    });
    
    document.getElementById('close-help').addEventListener('click', function() {
        document.getElementById('help-modal').classList.add('hidden');
    });
    
    // 默认加载正态分布
    loadDistribution('normal');
    document.querySelector('[data-dist="normal"]').classList.add('active');
});

// 初始化图表
function initCharts() {
    // 分布图表
    const ctx = document.getElementById('distribution-chart').getContext('2d');
    distributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '分布函数',
                data: [],
                borderColor: 'rgba(0, 0, 0, 0.8)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const x = context.label;
                            const y = context.raw;
                            return isCumulative 
                                ? `P(X ≤ ${x}) = ${y.toFixed(4)}` 
                                : `${currentDistribution.type === 'discrete' ? 'P(X = ' : 'f('}${x}${currentDistribution.type === 'discrete' ? ')' : ')'} = ${y.toFixed(4)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                ticks: {
                    callback: function(value, index, ticks) {
                            // 在category轴上，通过this.getLabelForValue(value)获得对应的标签值
                            const label = this.getLabelForValue(value);
                        return parseFloat(label).toFixed(2);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '概率密度/质量'
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            animation: {
                duration: 500
            }
        }
    });
    
    // 模拟图表
    const simCtx = document.getElementById('simulation-chart').getContext('2d');
    simulationChart = new Chart(simCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: '随机样本',
                    data: [],
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderColor: 'rgba(0, 0, 0, 0.8)',
                    borderWidth: 1
                },
                {
                    label: '密度线',
                    data: [],
                    type: 'line',
                    borderColor: 'rgba(220, 38, 38, 0.8)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    },
                ticks: {
                    callback: function(value, index, ticks) {
                            // 在category轴上，通过this.getLabelForValue(value)获得对应的标签值
                            const label = this.getLabelForValue(value);
                        return parseFloat(label).toFixed(2);
                        }
                    }

                },
                y: {
                    title: {
                        display: true,
                        text: '频率/概率'
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 500
            }
        }
    });
}

// 加载指定分布
function loadDistribution(distName) {
    // 隐藏欢迎界面，显示分布内容
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('distribution-content').classList.remove('hidden');
    
    // 根据分布类型准备数据
    const dist = Distributions[distName];
    if (!dist) return;
    
    // 确定分布类型(离散/连续)
    const isDiscrete = ['bernoulli', 'binomial', 'poisson', 'geometric'].includes(distName);
    
    // 设置当前分布信息
    currentDistribution = {
        name: distName,
        type: isDiscrete ? 'discrete' : 'continuous',
        dist: dist
    };
    
    // 更新UI
    updateDistributionUI(distName, dist);
    
    // 创建参数控制器
    createParameterControls(dist.params);
    
    // 首次更新图表
    updateDistributionVisuals();
    
    // 重置计算器
    resetCalculator();
}

// 更新分布UI
function updateDistributionUI(distName, dist) {
    // 设置标题和描述
    document.getElementById('dist-title').textContent = getDistributionTitle(distName);
    document.getElementById('dist-description').textContent = dist.description;
    
    // 设置图表类型标签
    document.getElementById('chart-type-label').textContent = 
        currentDistribution.type === 'discrete' ? 
        '概率质量函数 (PMF)' : '概率密度函数 (PDF)';
    
    // 更新累积分布按钮文本
    document.getElementById('toggle-cumulative').textContent = 
        isCumulative ? '切换到密度函数' : '切换到累积分布';
    
    // 更新数学公式，使用 MathJax 定界符包裹，并触发渲染
    const formulaContainer = document.getElementById('formula-container');
    formulaContainer.innerHTML = `<div class="font-geist-mono text-center py-2">\\[${dist.formula}\\]</div>`;
    MathJax.typeset();
    
    // 更新参数描述
    const paramDescContainer = document.getElementById('parameter-descriptions');
    paramDescContainer.innerHTML = '';
    dist.params.forEach(param => {
        const li = document.createElement('li');
        li.textContent = `${param.name}: ${param.description}`;
        paramDescContainer.appendChild(li);
    });
    
    // 更新应用场景
    const applicationsContainer = document.getElementById('applications-list');
    applicationsContainer.innerHTML = '';
    dist.applications.forEach(app => {
        const li = document.createElement('li');
        li.textContent = app;
        applicationsContainer.appendChild(li);
    });
}

// 获取分布的中文标题
function getDistributionTitle(distName) {
    const titles = {
        'bernoulli': '伯努利分布 (Bernoulli Distribution)',
        'binomial': '二项分布 (Binomial Distribution)',
        'poisson': '泊松分布 (Poisson Distribution)',
        'geometric': '几何分布 (Geometric Distribution)',
        'normal': '正态分布 (Normal Distribution)',
        'uniform': '均匀分布 (Uniform Distribution)',
        'exponential': '指数分布 (Exponential Distribution)',
        'gamma': '伽马分布 (Gamma Distribution)',
        't': "t 分布 (Student's t Distribution)",
        'f': 'F 分布 (F Distribution)',
        'chiSquare': '卡方分布 (Chi-Square Distribution)'
    };
    
    return titles[distName] || '未知分布';
}

// 创建参数控制器
function createParameterControls(params) {
    const container = document.getElementById('params-container');
    container.innerHTML = '';
    
    params.forEach(param => {
        const controlGroup = document.createElement('div');
        
        // 参数标签
        const label = document.createElement('div');
        label.className = 'flex justify-between items-center mb-2';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-sm text-gray-700';
        nameSpan.textContent = `${param.name}: ${param.description}`;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'text-sm font-medium font-geist-mono';
        valueSpan.id = `${param.name}-value`;
        
        label.appendChild(nameSpan);
        label.appendChild(valueSpan);
        
        // 参数滑块
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `slider-${param.name}`;
        slider.className = 'w-full';
        
        // 设置滑块范围和默认值
        if (param.range) {
            const [min, max] = param.range;
            slider.min = min;
            // 处理无穷大情况
            slider.max = max === Infinity ? 100 : max;
            
            // 设置默认值
            const defaultValue = getDefaultParamValue(param);
            slider.value = defaultValue;
            valueSpan.textContent = defaultValue;
        }
        
        // 设置步长
        slider.step = param.integer ? 1 : 0.05;
        
        // 添加事件监听
        slider.addEventListener('input', function() {
            valueSpan.textContent = this.value;
            updateDistributionVisuals();
        });
        
        controlGroup.appendChild(label);
        controlGroup.appendChild(slider);
        container.appendChild(controlGroup);
    });
}

// 获取参数默认值
function getDefaultParamValue(param) {
    // 根据不同参数类型设置默认值
    const defaults = {
        'p': 0.5,
        'n': 10,
        'lambda': 3,
        'mu': 0,
        'sigma': 1,
        'a': 0,
        'b': 1,
        'k': 2,
        'theta': 1
    };
    
    return defaults[param.name] || (param.range ? (param.range[0] + param.range[1]) / 2 : 0);
}

// 获取当前参数值
function getCurrentParams() {
    const params = {};
    currentDistribution.dist.params.forEach(param => {
        const slider = document.getElementById(`slider-${param.name}`);
        params[param.name] = parseFloat(slider.value);
    });
    return params;
}

// 更新分布可视化
function updateDistributionVisuals() {
    const params = getCurrentParams();
    
    // 根据分布类型生成数据点
    let chartData;
    if (currentDistribution.type === 'discrete') {
        chartData = generateDiscreteData(params);
    } else {
        chartData = generateContinuousData(params);
    }
    
    // 更新图表
    updateChart(chartData.x, chartData.y);
    
    // 更新统计量
    updateStatistics(params);
}

// 生成离散分布数据
function generateDiscreteData(params) {
    const dist = currentDistribution.dist;
    const support = dist.support(...Object.values(params));
    
    let x = support;
    let y;
    
    if (isCumulative) {
        y = x.map(val => dist.cdf(val, ...Object.values(params)));
    } else {
        y = x.map(val => dist.pmf(val, ...Object.values(params)));
    }
    
    return { x, y };
}

// 生成连续分布数据
function generateContinuousData(params) {
    const dist = currentDistribution.dist;
    const [min, max] = dist.support(...Object.values(params));
    
    // 确定点的数量
    const numPoints = 200;
    const step = (max - min) / (numPoints - 1);
    
    // 生成x值
    const x = Array.from({ length: numPoints }, (_, i) => min + i * step);
    
    let y;
    if (isCumulative) {
        y = x.map(val => dist.cdf(val, ...Object.values(params)));
    } else {
        y = x.map(val => dist.pdf(val, ...Object.values(params)));
    }
    
    return { x, y };
}

// 更新图表
function updateChart(x, y) {
    const chartType = currentDistribution.type === 'discrete' && !isCumulative ? 'bar' : 'line';
    const fillMode = isCumulative;
    
    distributionChart.data.labels = x;
    distributionChart.data.datasets[0].data = y;
    distributionChart.data.datasets[0].type = chartType;
    
    if (chartType === 'line') {
        distributionChart.data.datasets[0].pointRadius = 0;
    } else {
        distributionChart.data.datasets[0].pointRadius = undefined;
    }
    
    distributionChart.data.datasets[0].fill = fillMode;
    
    // 设置图表y轴标签
    distributionChart.options.scales.y.title.text = isCumulative ? 
        '累积概率' : (currentDistribution.type === 'discrete' ? '概率质量' : '概率密度');
    
    distributionChart.update();
}

// 更新统计量
function updateStatistics(params) {
    const dist = currentDistribution.dist;
    const values = Object.values(params);
    
    // 计算统计量
    const mean = dist.mean(...values);
    const variance = dist.variance(...values);
    const stdDev = Math.sqrt(variance);
    const median = dist.median(...values);
    
    // 更新UI
    document.getElementById('expected-value').textContent = mean.toFixed(4);
    document.getElementById('variance-value').textContent = variance.toFixed(4);
    document.getElementById('std-dev-value').textContent = stdDev.toFixed(4);
    document.getElementById('median-value').textContent = median.toFixed(4);
}

// 切换累积分布显示
function toggleCumulativeDistribution() {
    isCumulative = !isCumulative;
    
    // 更新按钮文本
    document.getElementById('toggle-cumulative').textContent = 
        isCumulative ? '切换到密度函数' : '切换到累积分布';
    
    // 更新图表类型标签
    document.getElementById('chart-type-label').textContent = 
        currentDistribution.type === 'discrete' ? 
            (isCumulative ? '累积分布函数 (CDF)' : '概率质量函数 (PMF)') : 
            (isCumulative ? '累积分布函数 (CDF)' : '概率密度函数 (PDF)');
    
    // 重新绘制图表
    updateDistributionVisuals();
}

// 切换计算器输入
function toggleCalculatorInputs() {
    const calcType = document.getElementById('prob-calc-type').value;
    
    if (calcType === 'between') {
        document.getElementById('single-value-input').classList.add('hidden');
        document.getElementById('range-value-input').classList.remove('hidden');
    } else {
        document.getElementById('single-value-input').classList.remove('hidden');
        document.getElementById('range-value-input').classList.add('hidden');
    }
}

// 重置计算器
function resetCalculator() {
    document.getElementById('prob-calc-type').value = 'eq';
    document.getElementById('single-value-input').classList.remove('hidden');
    document.getElementById('range-value-input').classList.add('hidden');
    document.getElementById('probability-result').classList.add('hidden');
    
    // 根据当前分布类型设置默认值
    const dist = currentDistribution.dist;
    const params = getCurrentParams();
    const values = Object.values(params);
    
    const defaultX = currentDistribution.type === 'discrete' ? 
        Math.round(dist.mean(...values)) : 
        dist.mean(...values);
    
    document.getElementById('prob-calc-x').value = defaultX;
    
    if (currentDistribution.type === 'continuous') {
        const [min, max] = dist.support(...values);
        document.getElementById('prob-calc-a').value = min;
        document.getElementById('prob-calc-b').value = max;
    } else {
        const support = dist.support(...values);
        document.getElementById('prob-calc-a').value = support[0];
        document.getElementById('prob-calc-b').value = support[Math.min(support.length - 1, 2)];
    }
}

// 计算单值概率
function calculateProbability() {
    const dist = currentDistribution.dist;
    const params = getCurrentParams();
    const x = parseFloat(document.getElementById('prob-calc-x').value);
    const calcType = document.getElementById('prob-calc-type').value;
    
    let probability;
    let label;
    
    if (currentDistribution.type === 'discrete') {
        if (calcType === 'eq') {
            probability = dist.pmf(x, ...Object.values(params));
            label = `P(X = ${x}) = `;
        } else if (calcType === 'le') {
            probability = dist.cdf(x, ...Object.values(params));
            label = `P(X ≤ ${x}) = `;
        } else if (calcType === 'ge') {
            probability = 1 - dist.cdf(x - 1, ...Object.values(params));
            label = `P(X ≥ ${x}) = `;
        }
    } else {
        if (calcType === 'eq') {
            probability = 0; // 连续分布点概率为0
            label = `P(X = ${x}) = `;
        } else if (calcType === 'le') {
            probability = dist.cdf(x, ...Object.values(params));
            label = `P(X ≤ ${x}) = `;
        } else if (calcType === 'ge') {
            probability = 1 - dist.cdf(x, ...Object.values(params));
            label = `P(X ≥ ${x}) = `;
        }
    }
    
    // 显示结果
    document.getElementById('probability-result').classList.remove('hidden');
    document.getElementById('prob-result-value').innerHTML = `${label}<strong>${probability.toFixed(6)}</strong>`;
}

// 计算区间概率
function calculateProbabilityRange() {
    const dist = currentDistribution.dist;
    const params = getCurrentParams();
    const a = parseFloat(document.getElementById('prob-calc-a').value);
    const b = parseFloat(document.getElementById('prob-calc-b').value);
    
    let probability;
    
    if (currentDistribution.type === 'discrete') {
        probability = dist.cdf(b, ...Object.values(params)) - dist.cdf(a - 1, ...Object.values(params));
    } else {
        probability = dist.cdf(b, ...Object.values(params)) - dist.cdf(a, ...Object.values(params));
    }
    
    // 显示结果
    document.getElementById('probability-result').classList.remove('hidden');
    document.getElementById('prob-result-value').innerHTML = `P(${a} ≤ X ≤ ${b}) = <strong>${probability.toFixed(6)}</strong>`;
}

// 生成随机样本
function generateSamples() {
    const dist = currentDistribution.dist;
    const params = getCurrentParams();
    const sampleSize = parseInt(document.getElementById('sample-size').value);
    
    // 生成样本
    const samples = Array.from({ length: sampleSize }, () => dist.random(...Object.values(params)));
    
    // 计算样本统计量
    const sampleMean = samples.reduce((sum, val) => sum + val, 0) / sampleSize;
    const sampleVariance = samples.reduce((sum, val) => sum + Math.pow(val - sampleMean, 2), 0) / sampleSize;
    const sampleStdDev = Math.sqrt(sampleVariance);
    
    // 更新统计量显示
    document.getElementById('sample-mean').textContent = sampleMean.toFixed(4);
    document.getElementById('sample-std').textContent = sampleStdDev.toFixed(4);
    
    // 创建直方图数据
    let bins, frequencies, theoreticalValues;
    
    if (currentDistribution.type === 'discrete') {
        // 离散分布使用计数直方图
        const support = dist.support(...Object.values(params));
        const minVal = Math.min(...support, ...samples);
        const maxVal = Math.max(...support, ...samples);
        
        // 创建bins(每个可能的离散值一个bin)
        bins = Array.from({ length: maxVal - minVal + 1 }, (_, i) => minVal + i);
        
        // 计算频率
        const counts = new Array(bins.length).fill(0);
        samples.forEach(sample => {
            const binIndex = Math.round(sample) - minVal;
            if (binIndex >= 0 && binIndex < counts.length) {
                counts[binIndex]++;
            }
        });
        
        frequencies = counts.map(count => count / sampleSize);
        
        // 计算理论PMF
        theoreticalValues = bins.map(val => dist.pmf(val, ...Object.values(params)));
    } else {
        // 连续分布使用等宽直方图
        const [min, max] = dist.support(...Object.values(params));
        const adjustedMin = Math.min(min, ...samples);
        const adjustedMax = Math.max(max, ...samples);
        
        // 确定bin数量(Sturges公式)
        const numBins = Math.max(5, Math.ceil(1 + 3.322 * Math.log10(sampleSize)));
        const binWidth = (adjustedMax - adjustedMin) / numBins;
        
        // 创建bins
        bins = Array.from({ length: numBins }, (_, i) => adjustedMin + i * binWidth);
        
        // 计算频率
        const counts = new Array(numBins).fill(0);
        samples.forEach(sample => {
            const binIndex = Math.min(numBins - 1, Math.max(0, Math.floor((sample - adjustedMin) / binWidth)));
            counts[binIndex]++;
        });
        
        frequencies = counts.map(count => count / (sampleSize * binWidth));
        
        // 计算理论PDF
        const pdfPoints = Array.from({ length: numBins }, (_, i) => adjustedMin + (i + 0.5) * binWidth);
        theoreticalValues = pdfPoints.map(val => dist.pdf(val, ...Object.values(params)));
    }
    
    // 更新模拟图表
    simulationChart.data.labels = bins;
    simulationChart.data.datasets[0].data = frequencies;
    simulationChart.data.datasets[1].data = theoreticalValues;
    
    simulationChart.options.scales.y.title.text = currentDistribution.type === 'discrete' ? '频率/概率' : '频率密度/概率密度';
    
    simulationChart.update();
}


// 切换主题
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // 更新图表样式
    const isDarkMode = document.body.classList.contains('dark-mode');
    const iconName = isDarkMode ? 'sun' : 'moon';
    
    // 更新主题切换按钮图标
    document.querySelector('#toggle-theme i').setAttribute('data-lucide', iconName);
    lucide.createIcons();
    
    // 更新图表颜色
    const textColor = isDarkMode ? '#f9fafb' : '#1f2937';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    // 分布图表
    distributionChart.options.scales.x.ticks.color = textColor;
    distributionChart.options.scales.y.ticks.color = textColor;
    distributionChart.options.scales.x.title.color = textColor;
    distributionChart.options.scales.y.title.color = textColor;
    distributionChart.options.scales.x.grid.color = gridColor;
    distributionChart.options.scales.y.grid.color = gridColor;
    
    // 模拟图表
    simulationChart.options.scales.x.ticks.color = textColor;
    simulationChart.options.scales.y.ticks.color = textColor;
    simulationChart.options.scales.x.title.color = textColor;
    simulationChart.options.scales.y.title.color = textColor;
    simulationChart.options.scales.x.grid.color = gridColor;
    simulationChart.options.scales.y.grid.color = gridColor;
    
    // 更新图表
    distributionChart.update();
    simulationChart.update();
}

// 防止缩放
window.addEventListener("wheel", (e) => {
    const isPinching = e.ctrlKey;
    if (isPinching) e.preventDefault();
}, { passive: false });

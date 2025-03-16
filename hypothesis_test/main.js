document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const testTypeRadios = document.querySelectorAll('input[name="testType"]');
    const testMethodRadios = document.querySelectorAll('input[name="testMethod"]');
    const alphaSlider = document.getElementById('alphaSlider');
    const alphaValue = document.getElementById('alphaValue');
    const sampleMeanSlider = document.getElementById('sampleMeanSlider');
    const sampleMeanValue = document.getElementById('sampleMeanValue');
    const testResult = document.getElementById('testResult');
    const explanation = document.getElementById('explanation');
    
    // 初始化可视化
    const visualization = new TestVisualization('visualization');
    
    // 当前检验参数
    let currentParams = {
        testType: 'left',
        testMethod: 'critical',
        alpha: 0.05,
        sampleMean: 0
    };
    
    // 根据当前参数更新检验结果和可视化
    function updateTest() {
        // 更新可视化
        visualization.update(currentParams);
        
        // 更新检验结果和解释
        updateResults();
    }
    
    // 更新检验结果和解释
    function updateResults() {
        const { testType, alpha, sampleMean, testMethod } = currentParams;
        
        // 获取临界值
        const criticalValues = Normal.getCriticalValue(alpha, testType);
        
        // 获取p值
        const pValue = Normal.getPValue(sampleMean, testType);
        
        // 判断检验结果
        let rejected = false;
        let resultHTML = '';
        let explanationHTML = '';
        
        if (testType === 'left') {
            rejected = sampleMean <= criticalValues;
            
            if (testMethod === 'critical') {
                resultHTML = `
                    <p>原假设 (H₀): μ ≥ μ₀ = 0</p>
                    <p>备择假设 (H₁): μ < μ₀ = 0</p>
                    <p>临界值: ${criticalValues.toFixed(3)}</p>
                    <p>样本均值: ${sampleMean.toFixed(3)}</p>
                    <p class="font-semibold mt-2">结论: ${rejected ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>左侧检验的判断依据：</p>
                    <p>当<span class="highlighted-text">样本均值 ≤ 临界值</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">样本均值 > 临界值</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${sampleMean.toFixed(3)} ${rejected ? '≤' : '>'} ${criticalValues.toFixed(3)}，
                    因此${rejected ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            } else if (testMethod === 'p-value') {
                resultHTML = `
                    <p>原假设 (H₀): μ ≥ μ₀ = 0</p>
                    <p>备择假设 (H₁): μ < μ₀ = 0</p>
                    <p>p值: ${pValue.toFixed(4)}</p>
                    <p>显著性水平 (α): ${alpha.toFixed(2)}</p>
                    <p class="font-semibold mt-2">结论: ${pValue <= alpha ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>使用p值法判断：</p>
                    <p>当<span class="highlighted-text">p值 ≤ α</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">p值 > α</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${pValue.toFixed(4)} ${pValue <= alpha ? '≤' : '>'} ${alpha.toFixed(2)}，
                    因此${pValue <= alpha ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            } else {
                // 置信区间法
                const ciUpper = sampleMean + Math.abs(criticalValues); // 假设标准误 = 1
                
                resultHTML = `
                    <p>原假设 (H₀): μ ≥ μ₀ = 0</p>
                    <p>备择假设 (H₁): μ < μ₀ = 0</p>
                    <p>${((1-alpha)*100).toFixed(0)}% 置信区间: (-∞, ${ciUpper.toFixed(3)}]</p>
                    <p>假设值 μ₀ = 0</p>
                    <p class="font-semibold mt-2">结论: ${ciUpper < 0 ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>使用置信区间法判断：</p>
                    <p>当<span class="highlighted-text">置信区间上限 < μ₀</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">置信区间上限 ≥ μ₀</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${ciUpper.toFixed(3)} ${ciUpper < 0 ? '<' : '≥'} 0，
                    因此${ciUpper < 0 ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            }
        } else if (testType === 'right') {
            rejected = sampleMean >= criticalValues;
            
            if (testMethod === 'critical') {
                resultHTML = `
                    <p>原假设 (H₀): μ ≤ μ₀ = 0</p>
                    <p>备择假设 (H₁): μ > μ₀ = 0</p>
                    <p>临界值: ${criticalValues.toFixed(3)}</p>
                    <p>样本均值: ${sampleMean.toFixed(3)}</p>
                    <p class="font-semibold mt-2">结论: ${rejected ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>右侧检验的判断依据：</p>
                    <p>当<span class="highlighted-text">样本均值 ≥ 临界值</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">样本均值 < 临界值</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${sampleMean.toFixed(3)} ${rejected ? '≥' : '<'} ${criticalValues.toFixed(3)}，
                    因此${rejected ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            } else if (testMethod === 'p-value') {
                resultHTML = `
                    <p>原假设 (H₀): μ ≤ μ₀ = 0</p>
                    <p>备择假设 (H₁): μ > μ₀ = 0</p>
                    <p>p值: ${pValue.toFixed(4)}</p>
                    <p>显著性水平 (α): ${alpha.toFixed(2)}</p>
                    <p class="font-semibold mt-2">结论: ${pValue <= alpha ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>使用p值法判断：</p>
                    <p>当<span class="highlighted-text">p值 ≤ α</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">p值 > α</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${pValue.toFixed(4)} ${pValue <= alpha ? '≤' : '>'} ${alpha.toFixed(2)}，
                    因此${pValue <= alpha ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            } else {
                // 置信区间法
                const ciLower = sampleMean - Math.abs(criticalValues); // 假设标准误 = 1
                
                resultHTML = `
                    <p>原假设 (H₀): μ ≤ μ₀ = 0</p>
                    <p>备择假设 (H₁): μ > μ₀ = 0</p>
                    <p>${((1-alpha)*100).toFixed(0)}% 置信区间: [${ciLower.toFixed(3)}, ∞)</p>
                    <p>假设值 μ₀ = 0</p>
                    <p class="font-semibold mt-2">结论: ${ciLower > 0 ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>使用置信区间法判断：</p>
                    <p>当<span class="highlighted-text">置信区间下限 > μ₀</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">置信区间下限 ≤ μ₀</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${ciLower.toFixed(3)} ${ciLower > 0 ? '>' : '≤'} 0，
                    因此${ciLower > 0 ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            }
        } else {
            // 双侧检验
            const [leftCritical, rightCritical] = criticalValues;
            rejected = sampleMean <= leftCritical || sampleMean >= rightCritical;
            
            if (testMethod === 'critical') {
                resultHTML = `
                    <p>原假设 (H₀): μ = μ₀ = 0</p>
                    <p>备择假设 (H₁): μ ≠ μ₀ = 0</p>
                    <p>左临界值: ${leftCritical.toFixed(3)}</p>
                    <p>右临界值: ${rightCritical.toFixed(3)}</p>
                    <p>样本均值: ${sampleMean.toFixed(3)}</p>
                    <p class="font-semibold mt-2">结论: ${rejected ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>双侧检验的判断依据：</p>
                    <p>当<span class="highlighted-text">样本均值 ≤ 左临界值 或 样本均值 ≥ 右临界值</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">左临界值 < 样本均值 < 右临界值</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${sampleMean.toFixed(3)} ${rejected ? 
                        (sampleMean <= leftCritical ? '≤ ' + leftCritical.toFixed(3) : '≥ ' + rightCritical.toFixed(3)) : 
                        '在两个临界值之间'}，
                    因此${rejected ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            } else if (testMethod === 'p-value') {
                resultHTML = `
                    <p>原假设 (H₀): μ = μ₀ = 0</p>
                    <p>备择假设 (H₁): μ ≠ μ₀ = 0</p>
                    <p>p值: ${pValue.toFixed(4)}</p>
                    <p>显著性水平 (α): ${alpha.toFixed(2)}</p>
                    <p class="font-semibold mt-2">结论: ${pValue <= alpha ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>使用p值法判断：</p>
                    <p>当<span class="highlighted-text">p值 ≤ α</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">p值 > α</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${pValue.toFixed(4)} ${pValue <= alpha ? '≤' : '>'} ${alpha.toFixed(2)}，
                    因此${pValue <= alpha ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            } else {
                // 置信区间法
                const margin = Math.abs(leftCritical); // 假设标准误 = 1
                const ciLower = sampleMean - margin;
                const ciUpper = sampleMean + margin;
                
                resultHTML = `
                    <p>原假设 (H₀): μ = μ₀ = 0</p>
                    <p>备择假设 (H₁): μ ≠ μ₀ = 0</p>
                    <p>${((1-alpha)*100).toFixed(0)}% 置信区间: [${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]</p>
                    <p>假设值 μ₀ = 0</p>
                    <p class="font-semibold mt-2">结论: ${(ciLower > 0 || ciUpper < 0) ? 
                        '<span class="text-red-600">拒绝原假设</span>' : 
                        '<span class="text-green-600">不能拒绝原假设</span>'}</p>
                `;
                
                explanationHTML = `
                    <p>使用置信区间法判断：</p>
                    <p>当<span class="highlighted-text">置信区间不包含μ₀</span>时，拒绝原假设。</p>
                    <p>当<span class="highlighted-text">置信区间包含μ₀</span>时，不能拒绝原假设。</p>
                    <p class="mt-2">本例中，${(ciLower > 0 || ciUpper < 0) ? 'μ₀ = 0 不在置信区间内' : 'μ₀ = 0 在置信区间内'}，
                    因此${(ciLower > 0 || ciUpper < 0) ? '拒绝' : '不能拒绝'}原假设。</p>
                `;
            }
        }
        
        // 更新DOM
        testResult.innerHTML = resultHTML;
        explanation.innerHTML = explanationHTML;
    }
    
    // 事件监听器
    testTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentParams.testType = this.value;
            updateTest();
        });
    });
    
    testMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentParams.testMethod = this.value;
            updateTest();
        });
    });
    
    alphaSlider.addEventListener('input', function() {
        const value = parseFloat(this.value) / 100;
        alphaValue.textContent = value.toFixed(2);
        currentParams.alpha = value;
        updateTest();
    });
    
    sampleMeanSlider.addEventListener('input', function() {
        const value = parseFloat(this.value) / 10;
        sampleMeanValue.textContent = value.toFixed(2);
        currentParams.sampleMean = value;
        updateTest();
    });
    
    // 处理窗口大小调整
    window.addEventListener('resize', function() {
        visualization.resize();
        updateTest();
    });
    
    // 初始化检验
    updateTest();
});

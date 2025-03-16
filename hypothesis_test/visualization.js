/**
 * 假设检验可视化
 */
class TestVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.margin = { top: 40, right: 40, bottom: 60, left: 50 };
        
        // 创建SVG
        this.svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
            
        // 创建元素组
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
            
        // 设置比例尺
        this.xScale = d3.scaleLinear()
            .domain([-4, 4])
            .range([0, this.width - this.margin.left - this.margin.right]);
            
        this.yScale = d3.scaleLinear()
            .domain([0, 0.45])
            .range([this.height - this.margin.top - this.margin.bottom, 0]);
            
        // 正态曲线生成器
        this.line = d3.line()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y))
            .curve(d3.curveBasis);
            
        // 添加x轴
        this.xAxis = this.g.append('g')
            .attr('class', 'axis-line')
            .attr('transform', `translate(0,${this.height - this.margin.top - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale).ticks(8));
            
        // 添加y轴
        this.yAxis = this.g.append('g')
            .attr('class', 'axis-line')
            .call(d3.axisLeft(this.yScale).ticks(5));

        // 添加轴标签
        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
            .attr('y', this.height - this.margin.top - 15)
            .attr('text-anchor', 'middle')
            .text('标准化值 (Z)');

        // 初始化正态曲线数据
        this.curveData = [];
        this.calculateCurveData();
        
        // 添加曲线
        this.curve = this.g.append('path')
            .datum(this.curveData)
            .attr('class', 'normal-curve')
            .attr('d', this.line);
            
        // 添加拒绝域和接受域
        this.rejectArea = this.g.append('path')
            .attr('class', 'reject-area');
            
        this.acceptArea = this.g.append('path')
            .attr('class', 'accept-area');
            
        // 添加p值区域
        this.pArea = this.g.append('path')
            .attr('class', 'p-area')
            .style('opacity', 0);
            
        // 添加临界值线
        this.criticalLines = this.g.append('g');
        
        // 添加样本均值线
        this.meanLine = this.g.append('line')
            .attr('class', 'mean-line')
            .attr('y1', 0)
            .attr('y2', this.height - this.margin.top - this.margin.bottom);
            
        // 添加文本标注
        this.annotations = this.g.append('g');
    }

    /**
     * 计算正态曲线数据点
     */
    calculateCurveData() {
        this.curveData = [];
        for (let x = -4; x <= 4.01; x += 0.05) {
            this.curveData.push({
                x: x,
                y: Normal.pdf(x)
            });
        }
    }

    /**
     * 根据检验参数更新可视化
     * @param {Object} params - 检验参数
     */
    update(params) {
        const { testType, alpha, sampleMean, testMethod } = params;
        
        // 获取临界值
        const criticalValues = Normal.getCriticalValue(alpha, testType);
        
        // 清除之前的元素
        this.criticalLines.selectAll('*').remove();
        this.annotations.selectAll('*').remove();
        
        // 更新样本均值线
        this.meanLine
            .attr('x1', this.xScale(sampleMean))
            .attr('x2', this.xScale(sampleMean))
            .style('opacity', 1);

        // 重置p值区域
        this.pArea.style('opacity', 0);
            
        // 根据检验类型和方法更新可视化
        if (testType === 'left') {
            this.updateLeftTailedTest(criticalValues, sampleMean, alpha, testMethod);
        } else if (testType === 'right') {
            this.updateRightTailedTest(criticalValues, sampleMean, alpha, testMethod);
        } else {
            this.updateTwoTailedTest(criticalValues, sampleMean, alpha, testMethod);
        }
        
        // 添加样本均值标注
        this.annotations.append('text')
            .attr('x', this.xScale(sampleMean))
            .attr('y', this.height - this.margin.top - this.margin.bottom - 10)
            .attr('text-anchor', sampleMean > 0 ? 'start' : 'end')
            .attr('dx', sampleMean > 0 ? 5 : -5)
            .attr('class', 'axis-label')
            .style('fill', '#3b82f6')
            .text(`样本均值 (${sampleMean.toFixed(2)})`);
    }

    /**
     * 更新左侧检验可视化
     */
    updateLeftTailedTest(criticalValue, sampleMean, alpha, testMethod) {
        // 添加临界线
        this.criticalLines.append('line')
            .attr('class', 'critical-line')
            .attr('x1', this.xScale(criticalValue))
            .attr('x2', this.xScale(criticalValue))
            .attr('y1', 0)
            .attr('y2', this.height - this.margin.top - this.margin.bottom);
            
        // 更新拒绝域(临界值左侧)
        const rejectPoints = this.curveData.filter(d => d.x <= criticalValue);
        this.rejectArea
            .datum(rejectPoints)
            .attr('d', d3.area()
                .x(d => this.xScale(d.x))
                .y0(this.height - this.margin.top - this.margin.bottom)
                .y1(d => this.yScale(d.y))
            );
            
        // 更新接受域(临界值右侧)
        const acceptPoints = this.curveData.filter(d => d.x >= criticalValue);
        this.acceptArea
            .datum(acceptPoints)
            .attr('d', d3.area()
                .x(d => this.xScale(d.x))
                .y0(this.height - this.margin.top - this.margin.bottom)
                .y1(d => this.yScale(d.y))
            );
            
        // 如果是p值法，显示p值区域
        if (testMethod === 'p-value') {
            const pPoints = this.curveData.filter(d => d.x <= sampleMean);
            this.pArea
                .datum(pPoints)
                .attr('d', d3.area()
                    .x(d => this.xScale(d.x))
                    .y0(this.height - this.margin.top - this.margin.bottom)
                    .y1(d => this.yScale(d.y))
                )
                .style('opacity', 1);
        }
            
        // 添加标注
        this.annotations.append('text')
            .attr('x', this.xScale(criticalValue))
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .text(`临界值 (${criticalValue.toFixed(2)})`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(-2.5))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#ef4444')
            .text(`拒绝域 (α = ${alpha.toFixed(2)})`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(2))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#22c55e')
            .text('接受域');
    }

    /**
     * 更新右侧检验可视化
     */
    updateRightTailedTest(criticalValue, sampleMean, alpha, testMethod) {
        // 添加临界线
        this.criticalLines.append('line')
            .attr('class', 'critical-line')
            .attr('x1', this.xScale(criticalValue))
            .attr('x2', this.xScale(criticalValue))
            .attr('y1', 0)
            .attr('y2', this.height - this.margin.top - this.margin.bottom);
            
        // 更新拒绝域(临界值右侧)
        const rejectPoints = this.curveData.filter(d => d.x >= criticalValue);
        this.rejectArea
            .datum(rejectPoints)
            .attr('d', d3.area()
                .x(d => this.xScale(d.x))
                .y0(this.height - this.margin.top - this.margin.bottom)
                .y1(d => this.yScale(d.y))
            );
            
        // 更新接受域(临界值左侧)
        const acceptPoints = this.curveData.filter(d => d.x <= criticalValue);
        this.acceptArea
            .datum(acceptPoints)
            .attr('d', d3.area()
                .x(d => this.xScale(d.x))
                .y0(this.height - this.margin.top - this.margin.bottom)
                .y1(d => this.yScale(d.y))
            );
            
        // 如果是p值法，显示p值区域
        if (testMethod === 'p-value') {
            const pPoints = this.curveData.filter(d => d.x >= sampleMean);
            this.pArea
                .datum(pPoints)
                .attr('d', d3.area()
                    .x(d => this.xScale(d.x))
                    .y0(this.height - this.margin.top - this.margin.bottom)
                    .y1(d => this.yScale(d.y))
                )
                .style('opacity', 1);
        }
            
        // 添加标注
        this.annotations.append('text')
            .attr('x', this.xScale(criticalValue))
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .text(`临界值 (${criticalValue.toFixed(2)})`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(2.5))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#ef4444')
            .text(`拒绝域 (α = ${alpha.toFixed(2)})`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(-2))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#22c55e')
            .text('接受域');
    }

    /**
     * 更新双侧检验可视化
     */
    updateTwoTailedTest(criticalValues, sampleMean, alpha, testMethod) {
        const [leftCritical, rightCritical] = criticalValues;
        
        // 添加临界线
        this.criticalLines.append('line')
            .attr('class', 'critical-line')
            .attr('x1', this.xScale(leftCritical))
            .attr('x2', this.xScale(leftCritical))
            .attr('y1', 0)
            .attr('y2', this.height - this.margin.top - this.margin.bottom);
            
        this.criticalLines.append('line')
            .attr('class', 'critical-line')
            .attr('x1', this.xScale(rightCritical))
            .attr('x2', this.xScale(rightCritical))
            .attr('y1', 0)
            .attr('y2', this.height - this.margin.top - this.margin.bottom);
            
        // 更新拒绝域(两个尾部)
        const leftRejectPoints = this.curveData.filter(d => d.x <= leftCritical);
        const rightRejectPoints = this.curveData.filter(d => d.x >= rightCritical);
        
        // 合并两个拒绝域
        const rejectPoints = [...leftRejectPoints, ...rightRejectPoints].sort((a, b) => a.x - b.x);
        this.rejectArea
            .datum(rejectPoints)
            .attr('d', d3.area()
                .x(d => this.xScale(d.x))
                .y0(this.height - this.margin.top - this.margin.bottom)
                .y1(d => this.yScale(d.y))
            );
            
        // 更新接受域(临界值之间)
        const acceptPoints = this.curveData.filter(d => d.x >= leftCritical && d.x <= rightCritical);
        this.acceptArea
            .datum(acceptPoints)
            .attr('d', d3.area()
                .x(d => this.xScale(d.x))
                .y0(this.height - this.margin.top - this.margin.bottom)
                .y1(d => this.yScale(d.y))
            );
            
        // 如果是p值法，显示p值区域
        if (testMethod === 'p-value') {
            let pPoints = [];
            if (sampleMean <= 0) {
                pPoints = this.curveData.filter(d => d.x <= sampleMean || d.x >= -sampleMean);
            } else {
                pPoints = this.curveData.filter(d => d.x >= sampleMean || d.x <= -sampleMean);
            }
            this.pArea
                .datum(pPoints)
                .attr('d', d3.area()
                    .x(d => this.xScale(d.x))
                    .y0(this.height - this.margin.top - this.margin.bottom)
                    .y1(d => this.yScale(d.y))
                )
                .style('opacity', 1);
        }
            
        // 添加标注
        this.annotations.append('text')
            .attr('x', this.xScale(leftCritical))
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .text(`左临界值 (${leftCritical.toFixed(2)})`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(rightCritical))
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .text(`右临界值 (${rightCritical.toFixed(2)})`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(-3))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#ef4444')
            .text(`α/2 = ${(alpha/2).toFixed(3)}`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(3))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#ef4444')
            .text(`α/2 = ${(alpha/2).toFixed(3)}`);
            
        this.annotations.append('text')
            .attr('x', this.xScale(0))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .style('fill', '#22c55e')
            .text('接受域');
    }

    /**
     * 重新调整可视化尺寸
     */
    resize() {
        this.width = this.container.clientWidth;
        this.svg.attr('width', this.width);
        
        this.xScale.range([0, this.width - this.margin.left - this.margin.right]);
        this.xAxis.call(d3.axisBottom(this.xScale).ticks(8));
        
        // 更新曲线
        this.curve
            .datum(this.curveData)
            .attr('d', this.line);
    }
}

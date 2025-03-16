/**
 * 正态分布相关函数
 */
class Normal {
    /**
     * 计算正态分布概率密度函数
     * @param {number} x - 输入值
     * @param {number} mean - 分布的均值
     * @param {number} stdDev - 分布的标准差
     * @returns {number} - 概率密度值
     */
    static pdf(x, mean = 0, stdDev = 1) {
        const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
        return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    }

    /**
     * 计算标准正态累积分布函数(CDF)
     * @param {number} x - 输入值
     * @returns {number} - 累积概率 P(Z ≤ x)
     */
    static cdf(x) {
        // CDF近似
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        let probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        
        if (x > 0) {
            probability = 1 - probability;
        }
        
        return probability;
    }

    /**
     * 计算标准正态分布累积函数的反函数(quantile function)
     * @param {number} p - 概率值(0到1)
     * @returns {number} - 对应的z值
     */
    static invCdf(p) {
        // 反函数近似算法
        if (p <= 0) return -Infinity;
        if (p >= 1) return Infinity;
        
        const a1 = -3.969683028665376e+01;
        const a2 = 2.209460984245205e+02;
        const a3 = -2.759285104469687e+02;
        const a4 = 1.383577518672690e+02;
        const a5 = -3.066479806614716e+01;
        const a6 = 2.506628277459239e+00;
        
        const b1 = -5.447609879822406e+01;
        const b2 = 1.615858368580409e+02;
        const b3 = -1.556989798598866e+02;
        const b4 = 6.680131188771972e+01;
        const b5 = -1.328068155288572e+01;
        
        const c1 = -7.784894002430293e-03;
        const c2 = -3.223964580411365e-01;
        const c3 = -2.400758277161838e+00;
        const c4 = -2.549732539343734e+00;
        const c5 = 4.374664141464968e+00;
        const c6 = 2.938163982698783e+00;
        
        const d1 = 7.784695709041462e-03;
        const d2 = 3.224671290700398e-01;
        const d3 = 2.445134137142996e+00;
        const d4 = 3.754408661907416e+00;
        
        // 低区域近似值
        if (p < 0.02425) {
            const q = Math.sqrt(-2 * Math.log(p));
            return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                   ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        }
        
        // 中间区域近似值
        if (p < 0.97575) {
            const q = p - 0.5;
            const r = q * q;
            return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
                   (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
        }
        
        // 高区域近似值
        const q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }

    /**
     * 获取指定显著性水平和检验类型的临界值
     * @param {number} alpha - 显著性水平(0到1)
     * @param {string} testType - 检验类型: 'left', 'right', 或 'two'
     * @returns {number|Array} - 临界z值
     */
    static getCriticalValue(alpha, testType) {
        switch (testType) {
            case 'left':
                return this.invCdf(alpha);
            case 'right':
                return this.invCdf(1 - alpha);
            case 'two':
                return [
                    this.invCdf(alpha / 2),
                    this.invCdf(1 - alpha / 2)
                ];
            default:
                throw new Error('无效的检验类型');
        }
    }

    /**
     * 计算z值对应的p值
     * @param {number} z - z值
     * @param {string} testType - 检验类型: 'left', 'right', 或 'two'
     * @returns {number} - p值
     */
    static getPValue(z, testType) {
        switch (testType) {
            case 'left':
                return this.cdf(z);
            case 'right':
                return 1 - this.cdf(z);
            case 'two':
                return 2 * Math.min(this.cdf(z), 1 - this.cdf(z));
            default:
                throw new Error('无效的检验类型');
        }
    }
}

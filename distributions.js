/**
 * 概率分布库
 * 包含常见离散和连续概率分布的计算函数
 */

const Distributions = {
  /**
   * 离散型分布
   */
  
  // 伯努利分布
  bernoulli: {
    // 概率质量函数
    pmf: function(x, p) {
      if (x === 0) return 1 - p;
      if (x === 1) return p;
      return 0;
    },
    // 累积分布函数
    cdf: function(x, p) {
      if (x < 0) return 0;
      if (x >= 0 && x < 1) return 1 - p;
      return 1;
    },
    // 随机数生成
    random: function(p) {
      return Math.random() < p ? 1 : 0;
    },
    // 计算均值
    mean: function(p) {
      return p;
    },
    // 计算方差
    variance: function(p) {
      return p * (1 - p);
    },
    // 计算中位数
    median: function(p) {
      if (p < 0.5) return 0;
      if (p > 0.5) return 1;
      return 0.5; // 当p=0.5时，中位数可能是0或1，返回0.5表示两者等可能
    },
    // 支持的取值范围
    support: function(p) {
      return [0, 1];
    },
    // 数学公式(LaTeX)
    formula: "P(X=x) = \\begin{cases} p, & \\text{if } x = 1 \\\\ 1-p, & \\text{if } x = 0 \\end{cases}",
    // 参数说明
    params: [
      { name: "p", description: "成功概率", range: [0, 1] }
    ],
    // 分布描述
    description: "伯努利分布描述了一个二值随机事件的结果，如抛硬币（正面或反面）。它只有一个参数p，表示成功（取值为1）的概率。",
    // 应用场景
    applications: [
      "抛硬币实验的结果建模",
      "二元分类问题（成功/失败，是/否）",
      "质量控制中的合格/不合格判断",
      "医学试验中的治愈/未治愈结果"
    ]
  },

  // 二项分布
  binomial: {
    // 概率质量函数
    pmf: function(k, n, p) {
      if (k < 0 || k > n || !Number.isInteger(k)) return 0;
      return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },
    // 累积分布函数
    cdf: function(k, n, p) {
      if (k < 0) return 0;
      if (k >= n) return 1;
      let sum = 0;
      for (let i = 0; i <= Math.floor(k); i++) {
        sum += this.pmf(i, n, p);
      }
      return sum;
    },
    // 随机数生成
    random: function(n, p) {
      let successes = 0;
      for (let i = 0; i < n; i++) {
        if (Math.random() < p) successes++;
      }
      return successes;
    },
    // 计算均值
    mean: function(n, p) {
      return n * p;
    },
    // 计算方差
    variance: function(n, p) {
      return n * p * (1 - p);
    },
    // 计算中位数(近似)
    median: function(n, p) {
      return Math.floor(n * p + (p < 0.5 ? 0 : 1));
    },
    // 支持的取值范围
    support: function(n, p) {
      return Array.from({length: n + 1}, (_, i) => i);
    },
    // 数学公式(LaTeX)
    formula: "P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}",
    // 参数说明
    params: [
      { name: "n", description: "试验次数", range: [1, Infinity], integer: true },
      { name: "p", description: "单次试验成功概率", range: [0, 1] }
    ],
    // 分布描述
    description: "二项分布描述了n次独立的是/否试验中成功的次数，每次试验成功的概率为p。它是伯努利分布的扩展。",
    // 应用场景
    applications: [
      "质量控制中的抽样检验",
      "市场调研中的消费者偏好统计",
      "医学试验中的病例统计",
      "投票结果的统计模型"
    ]
  },

  // 泊松分布
  poisson: {
    // 概率质量函数
    pmf: function(k, lambda) {
      if (k < 0 || !Number.isInteger(k)) return 0;
      return Math.exp(-lambda) * Math.pow(lambda, k) / math.factorial(k);
    },
    // 累积分布函数
    cdf: function(k, lambda) {
      if (k < 0) return 0;
      let sum = 0;
      for (let i = 0; i <= Math.floor(k); i++) {
        sum += this.pmf(i, lambda);
      }
      return sum;
    },
    // 随机数生成(使用逆变换采样)
    random: function(lambda) {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k += 1;
        p *= Math.random();
      } while (p > L);
      return k - 1;
    },
    // 计算均值
    mean: function(lambda) {
      return lambda;
    },
    // 计算方差
    variance: function(lambda) {
      return lambda;
    },
    // 计算中位数(近似)
    median: function(lambda) {
      return Math.floor(lambda + 1/3 - 0.02/lambda);
    },
    // 支持的取值范围
    support: function(lambda) {
      // 返回一个合理的范围(0到lambda的3倍左右)
      const max = Math.max(Math.ceil(lambda * 3), 10);
      return Array.from({length: max + 1}, (_, i) => i);
    },
    // 数学公式(LaTeX)
    formula: "P(X=k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}",
    // 参数说明
    params: [
      { name: "lambda", description: "平均发生率", range: [0, Infinity] }
    ],
    // 分布描述
    description: "泊松分布描述了单位时间内随机事件发生的次数。参数λ表示单位时间内事件发生的平均次数。",
    // 应用场景
    applications: [
      "呼叫中心单位时间内的来电数",
      "网站在特定时间段内的访问量",
      "某地区一定时间内发生的交通事故数",
      "超市收银台单位时间内的顾客数"
    ]
  },

  // 几何分布
  geometric: {
    // 概率质量函数
    pmf: function(k, p) {
      if (k < 1 || !Number.isInteger(k)) return 0;
      return Math.pow(1 - p, k - 1) * p;
    },
    // 累积分布函数
    cdf: function(k, p) {
      if (k < 1) return 0;
      return 1 - Math.pow(1 - p, Math.floor(k));
    },
    // 随机数生成
    random: function(p) {
      return Math.ceil(Math.log(Math.random()) / Math.log(1 - p));
    },
    // 计算均值
    mean: function(p) {
      return 1 / p;
    },
    // 计算方差
    variance: function(p) {
      return (1 - p) / (p * p);
    },
    // 计算中位数
    median: function(p) {
      return Math.ceil(-1 / Math.log2(1 - p));
    },
    // 支持的取值范围
    support: function(p) {
      // 返回一个合理的范围(1到均值的3倍左右)
      const max = Math.max(Math.ceil(3 / p), 20);
      return Array.from({length: max}, (_, i) => i + 1);
    },
    // 数学公式(LaTeX)
    formula: "P(X=k) = (1-p)^{k-1} p",
    // 参数说明
    params: [
      { name: "p", description: "单次试验成功概率", range: [0, 1] }
    ],
    // 分布描述
    description: "几何分布描述了进行伯努利试验时，首次成功所需要的试验次数。参数p是单次试验成功的概率。",
    // 应用场景
    applications: [
      "产品质检中首次发现缺陷的编号",
      "玩家第一次赢得游戏所需的尝试次数",
      "机器零件首次故障前的工作时间",
      "病毒传播中，感染者传染其他人所需的接触次数"
    ]
  },

  /**
   * 连续型分布
   */
  
  // 正态分布
  normal: {
    // 概率密度函数
    pdf: function(x, mu, sigma) {
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
             Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
    },
    // 累积分布函数(近似计算)
    cdf: function(x, mu, sigma) {
      // 标准化
      const z = (x - mu) / sigma;
      // 使用误差函数近似计算标准正态分布的CDF
      return 0.5 * (1 + this._erf(z / Math.sqrt(2)));
    },
    // 误差函数近似
    _erf: function(x) {
      // 常数
      const a1 =  0.254829592;
      const a2 = -0.284496736;
      const a3 =  1.421413741;
      const a4 = -1.453152027;
      const a5 =  1.061405429;
      const p  =  0.3275911;
      
      // 保存符号
      const sign = (x >= 0) ? 1 : -1;
      x = Math.abs(x);
      
      // 公式计算
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      
      return sign * y;
    },
    // 随机数生成(使用Box-Muller变换)
    random: function(mu, sigma) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mu + sigma * z0;
    },
    // 计算均值
    mean: function(mu, sigma) {
      return mu;
    },
    // 计算方差
    variance: function(mu, sigma) {
      return sigma * sigma;
    },
    // 计算中位数
    median: function(mu, sigma) {
      return mu;
    },
    // 支持的取值范围
    support: function(mu, sigma) {
      // 返回一个合理的范围(mu-3*sigma到mu+3*sigma)
      return [mu - 3 * sigma, mu + 3 * sigma];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}",
    // 参数说明
    params: [
      { name: "mu", description: "均值(期望)", range: [-Infinity, Infinity] },
      { name: "sigma", description: "标准差", range: [0, Infinity] }
    ],
    // 分布描述
    description: "正态分布(也称高斯分布)是最常见的连续概率分布，其概率密度函数呈钟形曲线。它由均值μ和标准差σ两个参数决定。",
    // 应用场景
    applications: [
      "自然现象的测量误差",
      "人类身高、体重的分布",
      "学生成绩的分布",
      "金融市场中资产收益率的建模"
    ]
  },

  // 均匀分布
  uniform: {
    // 概率密度函数
    pdf: function(x, a, b) {
      if (x < a || x > b) return 0;
      return 1 / (b - a);
    },
    // 累积分布函数
    cdf: function(x, a, b) {
      if (x < a) return 0;
      if (x > b) return 1;
      return (x - a) / (b - a);
    },
    // 随机数生成
    random: function(a, b) {
      return a + Math.random() * (b - a);
    },
    // 计算均值
    mean: function(a, b) {
      return (a + b) / 2;
    },
    // 计算方差
    variance: function(a, b) {
      return Math.pow(b - a, 2) / 12;
    },
    // 计算中位数
    median: function(a, b) {
      return (a + b) / 2;
    },
    // 支持的取值范围
    support: function(a, b) {
      return [a, b];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\begin{cases} \\frac{1}{b-a}, & \\text{if } a \\leq x \\leq b \\\\ 0, & \\text{otherwise} \\end{cases}",
    // 参数说明
    params: [
      { name: "a", description: "下限参数", range: [-Infinity, Infinity] },
      { name: "b", description: "上限参数", range: [-Infinity, Infinity] }
    ],
    // 分布描述
    description: "均匀分布是一种连续型概率分布，在给定的区间[a,b]内所有点具有相同的概率密度。它是建模随机性的最简单方式之一。",
    // 应用场景
    applications: [
      "计算机生成的随机数",
      "随机抽样过程",
      "量化误差的建模",
      "到达时间的估计(在没有先验知识的情况下)"
    ]
  },

  // 指数分布
  exponential: {
    // 概率密度函数
    pdf: function(x, lambda) {
      if (x < 0) return 0;
      return lambda * Math.exp(-lambda * x);
    },
    // 累积分布函数
    cdf: function(x, lambda) {
      if (x < 0) return 0;
      return 1 - Math.exp(-lambda * x);
    },
    // 随机数生成
    random: function(lambda) {
      return -Math.log(Math.random()) / lambda;
    },
    // 计算均值
    mean: function(lambda) {
      return 1 / lambda;
    },
    // 计算方差
    variance: function(lambda) {
      return 1 / (lambda * lambda);
    },
    // 计算中位数
    median: function(lambda) {
      return Math.log(2) / lambda;
    },
    // 支持的取值范围
    support: function(lambda) {
      // 返回一个合理的范围(0到均值的5倍左右)
      return [0, 5 / lambda];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\begin{cases} \\lambda e^{-\\lambda x}, & \\text{if } x \\geq 0 \\\\ 0, & \\text{if } x < 0 \\end{cases}",
    // 参数说明
    params: [
      { name: "lambda", description: "速率参数", range: [0, Infinity] }
    ],
    // 分布描述
    description: "指数分布描述了独立随机事件之间的等待时间。它常用于建模无记忆性的随机过程，如排队系统中的服务时间、设备的寿命等。",
    // 应用场景
    applications: [
      "设备的寿命分析",
      "排队系统中的服务时间",
      "放射性物质的衰变过程",
      "接收到的电话来电之间的时间间隔"
    ]
  },

  // 伽马分布
  gamma: {
    // 概率密度函数
    pdf: function(x, k, theta) {
      if (x <= 0) return 0;
      return (Math.pow(x, k - 1) * Math.exp(-x / theta)) / 
             (Math.pow(theta, k) * this._gammaFunction(k));
    },
    // 伽马函数近似
    _gammaFunction: function(x) {
      // 使用Lanczos近似计算伽马函数
      const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                 771.32342877765313, -176.61502916214059, 12.507343278686905,
                 -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
      
      if (x < 0.5) {
        return Math.PI / (Math.sin(Math.PI * x) * this._gammaFunction(1 - x));
      }
      
      x -= 1;
      let a = p[0];
      const g = 7;
      
      for (let i = 1; i < g + 2; i++) {
        a += p[i] / (x + i);
      }
      
      const t = x + g + 0.5;
      return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
    },
    // 累积分布函数(近似计算)
    cdf: function(x, k, theta) {
      // 简化版实现，实际应使用不完全伽马函数
      if (x <= 0) return 0;
      
      // 数值积分近似
      const steps = 1000;
      const h = x / steps;
      let sum = 0;
      
      for (let i = 0; i < steps; i++) {
        const x1 = i * h;
        const x2 = (i + 1) * h;
        sum += (this.pdf(x1, k, theta) + this.pdf(x2, k, theta)) * h / 2;
      }
      
      return sum;
    },
    // 随机数生成(使用和方法)
    random: function(k, theta) {
      // 对于整数k，使用和方法
      if (Math.floor(k) === k && k > 0) {
        let sum = 0;
        for (let i = 0; i < k; i++) {
          sum += -Math.log(Math.random()) * theta;
        }
        return sum;
      } 
      // 对于非整数k，可以使用更复杂的方法(简化处理)
      else {
        return this.mean(k, theta);
      }
    },
    // 计算均值
    mean: function(k, theta) {
      return k * theta;
    },
    // 计算方差
    variance: function(k, theta) {
      return k * theta * theta;
    },
    // 计算中位数(近似)
    median: function(k, theta) {
      // 伽马分布的中位数没有闭式解，使用近似公式
      return theta * (k - 1/3 + 0.1/k);
    },
    // 支持的取值范围
    support: function(k, theta) {
      const mean = this.mean(k, theta);
      const stdDev = Math.sqrt(this.variance(k, theta));
      return [0, mean + 4 * stdDev];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\frac{x^{k-1} e^{-x/\\theta}}{\\theta^k \\Gamma(k)}",
    // 参数说明
    params: [
      { name: "k", description: "形状参数", range: [0, Infinity] },
      { name: "theta", description: "尺度参数", range: [0, Infinity] }
    ],
    // 分布描述
    description: "伽马分布是一种连续概率分布，是指数分布、卡方分布和埃尔朗分布的一般形式。它有两个参数：形状参数k和尺度参数θ。",
    // 应用场景
    applications: [
      "降雨量的建模",
      "保险索赔的金额分布",
      "可靠性工程中的寿命分析",
      "贝叶斯统计中的共轭先验"
    ]
  },

    // t 分布
  t: {
    // 概率密度函数
    pdf: function(x, nu) {
      // f(x) = Γ((ν+1)/2) / (√(νπ) Γ(ν/2)) (1 + x²/ν)^(-(ν+1)/2)
      return math.gamma((nu + 1) / 2) / (Math.sqrt(nu * Math.PI) * math.gamma(nu / 2)) *
             Math.pow(1 + (x * x) / nu, -(nu + 1) / 2);
    },
    // 累积分布函数（数值积分近似）
    cdf: function(x, nu) {
      // 这里采用简单的数值积分方法，从 -10 到 x 进行积分（注意：积分区间可以根据需要调整）
      const steps = 1000;
      const a = -10, b = x;
      const h = (b - a) / steps;
      let sum = 0;
      for (let i = 0; i < steps; i++) {
        const x1 = a + i * h;
        const x2 = a + (i + 1) * h;
        sum += (this.pdf(x1, nu) + this.pdf(x2, nu)) * h / 2;
      }
      return sum;
    },
    // 随机数生成：利用 t 分布与标准正态分布和卡方分布的关系
    random: function(nu) {
      const Z = Distributions.normal.random(0, 1);
      let chiSq = 0;
      for (let i = 0; i < nu; i++) {
        chiSq += Math.pow(Distributions.normal.random(0, 1), 2);
      }
      return Z / Math.sqrt(chiSq / nu);
    },
    // 计算均值：ν > 1 时为 0
    mean: function(nu) {
      return nu > 1 ? 0 : NaN;
    },
    // 计算方差：ν > 2 时为 ν/(ν-2)，1 < ν ≤ 2 时无穷大
    variance: function(nu) {
      if (nu > 2) return nu / (nu - 2);
      else if (nu > 1 && nu <= 2) return Infinity;
      else return NaN;
    },
    // 中位数
    median: function(nu) {
      return 0;
    },
    // 支持范围：这里只是一个近似显示范围
    support: function(nu) {
      return [-5, 5];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\frac{\\Gamma\\left(\\frac{\\nu+1}{2}\\right)}{\\sqrt{\\nu\\pi}\\,\\Gamma\\left(\\frac{\\nu}{2}\\right)} \\left(1+\\frac{x^2}{\\nu}\\right)^{-\\frac{\\nu+1}{2}}",
    // 参数说明
    params: [
      { name: "nu", description: "自由度", range: [1, Infinity] }
    ],
    // 分布描述和应用场景
    description: "t 分布常用于小样本统计推断中，在总体方差未知时构建置信区间和进行 t 检验。",
    applications: [
      "t 检验",
      "置信区间估计",
      "小样本统计推断"
    ]
  },

  // F 分布
  f: {
    // 概率密度函数
    pdf: function(x, d1, d2) {
      if (x < 0) return 0;
      // f(x) = [Γ((d1+d2)/2) / (Γ(d1/2)Γ(d2/2))] (d1/d2)^(d1/2) x^(d1/2-1) / (1+(d1/d2)x)^((d1+d2)/2)
      return math.gamma((d1 + d2) / 2) / (math.gamma(d1 / 2) * math.gamma(d2 / 2)) *
             Math.pow(d1 / d2, d1 / 2) * Math.pow(x, d1 / 2 - 1) /
             Math.pow(1 + (d1 / d2) * x, (d1 + d2) / 2);
    },
    // 累积分布函数（数值积分近似）
    cdf: function(x, d1, d2) {
      const steps = 1000;
      const a = 0, b = x;
      const h = (b - a) / steps;
      let sum = 0;
      for (let i = 0; i < steps; i++) {
        const x1 = a + i * h;
        const x2 = a + (i + 1) * h;
        sum += (this.pdf(x1, d1, d2) + this.pdf(x2, d1, d2)) * h / 2;
      }
      return sum;
    },
    // 随机数生成：利用 F 分布与卡方分布的关系
    random: function(d1, d2) {
      let u1 = 0;
      for (let i = 0; i < d1; i++) {
        u1 += Math.pow(Distributions.normal.random(0, 1), 2);
      }
      let u2 = 0;
      for (let i = 0; i < d2; i++) {
        u2 += Math.pow(Distributions.normal.random(0, 1), 2);
      }
      return (u1 / d1) / (u2 / d2);
    },
    // 均值：当 d2 > 2 时存在
    mean: function(d1, d2) {
      return d2 > 2 ? d2 / (d2 - 2) : NaN;
    },
    // 方差：当 d2 > 4 时存在
    variance: function(d1, d2) {
      return d2 > 4 ? (2 * Math.pow(d2, 2) * (d1 + d2 - 2)) / (d1 * Math.pow(d2 - 2, 2) * (d2 - 4)) : NaN;
    },
    // 中位数：无闭式解
    median: function(d1, d2) {
      return NaN;
    },
    // 支持范围：这里只给出一个近似范围
    support: function(d1, d2) {
      return [0, 10];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\frac{\\Gamma\\left(\\frac{d_1+d_2}{2}\\right)}{\\Gamma\\left(\\frac{d_1}{2}\\right)\\Gamma\\left(\\frac{d_2}{2}\\right)} \\left(\\frac{d_1}{d_2}\\right)^{\\frac{d_1}{2}} \\frac{x^{\\frac{d_1}{2}-1}}{\\left(1+\\frac{d_1}{d_2}x\\right)^{\\frac{d_1+d_2}{2}}}",
    params: [
      { name: "d1", description: "分子自由度", range: [1, Infinity], integer: true },
      { name: "d2", description: "分母自由度", range: [1, Infinity], integer: true }
    ],
    description: "F 分布常用于比较两个样本方差，在方差分析（ANOVA）中尤为常见。",
    applications: [
      "方差分析",
      "模型比较",
      "回归分析中的假设检验"
    ]
  },

  // 卡方分布
  chiSquare: {
    // 概率密度函数
    pdf: function(x, k) {
      if (x < 0) return 0;
      // f(x) = 1/(2^(k/2)Γ(k/2)) x^(k/2-1) e^(-x/2)
      return 1 / (Math.pow(2, k / 2) * math.gamma(k / 2)) *
             Math.pow(x, k / 2 - 1) * Math.exp(-x / 2);
    },
    // 累积分布函数（数值积分近似）
    cdf: function(x, k) {
      if (x < 0) return 0;
      const steps = 1000;
      const h = x / steps;
      let sum = 0;
      for (let i = 0; i < steps; i++) {
        const x1 = i * h;
        const x2 = (i + 1) * h;
        sum += (this.pdf(x1, k) + this.pdf(x2, k)) * h / 2;
      }
      return sum;
    },
    // 随机数生成：卡方分布可由 k 个标准正态随机变量的平方和构成
    random: function(k) {
      let sum = 0;
      for (let i = 0; i < k; i++) {
        sum += Math.pow(Distributions.normal.random(0, 1), 2);
      }
      return sum;
    },
    // 均值
    mean: function(k) {
      return k;
    },
    // 方差
    variance: function(k) {
      return 2 * k;
    },
    // 中位数（近似）
    median: function(k) {
      return k * Math.pow(1 - 2 / (9 * k), 3);
    },
    // 支持范围
    support: function(k) {
      return [0, k + 4 * Math.sqrt(2 * k)];
    },
    // 数学公式(LaTeX)
    formula: "f(x) = \\frac{1}{2^{k/2}\\Gamma(k/2)} x^{k/2-1} e^{-x/2}",
    params: [
      { name: "k", description: "自由度", range: [1, Infinity], integer: true }
    ],
    description: "卡方分布常用于假设检验（例如适配度检验）和构建置信区间，在统计推断中占有重要地位。",
    applications: [
      "适配度检验",
      "假设检验",
      "置信区间估计"
    ]
  }

};
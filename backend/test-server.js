import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS 中间件 - 必须在所有路由之前
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// 高考成绩本地数据库
const gaokaoScores = [
  { admissionNumber: '20240001001', name: '王同学', province: '北京', score: 710, ranking: 85, percentile: 99.8, physics: '物理', subjects: '化学、生物' },
  { admissionNumber: '20240001002', name: '李同学', province: '北京', score: 695, ranking: 245, percentile: 99.5, physics: '物理', subjects: '地理、化学' },
  { admissionNumber: '20240002001', name: '周同学', province: '上海', score: 720, ranking: 42, percentile: 99.9, physics: '物理', subjects: '化学、地理' },
  { admissionNumber: '20240003001', name: '孙同学', province: '浙江', score: 715, ranking: 125, percentile: 99.7, physics: '物理', subjects: '化学、生物' },
];

// 去年排名对应分数（示例数据：排名 -> 去年分数）
const lastYearRankingScores = {
  '北京': { 85: 695, 245: 680, 1000: 650 },
  '上海': { 42: 705, 500: 675, 1000: 650 },
  '浙江': { 125: 700, 500: 680, 1000: 650 },
  '默认': { 100: 690, 500: 670, 1000: 645 }
};

// 根据排名计算去年相同排名的分数
function getLastYearScore(province, ranking) {
  const scores = lastYearRankingScores[province] || lastYearRankingScores['默认'];
  const rankingArray = Object.keys(scores).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < rankingArray.length; i++) {
    if (ranking <= rankingArray[i]) {
      return scores[rankingArray[i]];
    }
  }
  return scores[rankingArray[rankingArray.length - 1]];
}

console.log('🚀 启动服务器...');

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

app.post('/api/verification/send-code', (req, res) => {
  res.json({ success: true, message: '验证码已发送到您的邮箱' });
});

app.post('/api/gaokao/query-score', (req, res) => {
  const { admissionNumber } = req.body;

  if (!admissionNumber) {
    return res.status(400).json({ success: false, message: '请输入准考证号' });
  }

  const record = gaokaoScores.find(s => s.admissionNumber === admissionNumber);

  if (!record) {
    return res.status(404).json({ success: false, message: '未找到该准考证号的成绩记录' });
  }

  const lastYearScore = getLastYearScore(record.province, record.ranking);

  res.json({
    success: true,
    data: {
      score: record.score,
      ranking: record.ranking,
      lastYearScore,
      percentile: record.percentile,
      province: record.province,
      physicsOrHistory: record.physics,
      subjects: record.subjects,
      message: `恭喜！您的高考成绩为 ${record.score} 分，全省位次 ${record.ranking}，百分位数 ${record.percentile}%`
    }
  });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

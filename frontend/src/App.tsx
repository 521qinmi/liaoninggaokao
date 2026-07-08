import { useState, useEffect } from 'react';
import './App.css';
import { API_BASE_URL } from './config';

interface Major {
  id: number;
  name: string;
  category: string;
  description: string;
  job_prospects: string;
  avg_salary: number;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  views: number;
  created_at: string;
}

interface CarouselItem {
  id: number;
  title: string;
  description: string;
}

export default function App() {
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  // 注册表单状态
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeCount, setCodeCount] = useState(0);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // 页面状态 - 从 localStorage 初始化
  const [currentPage, setCurrentPage] = useState<'home' | 'volunteer' | 'recommendation'>(() => {
    const saved = localStorage.getItem('volunteerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.currentPage || 'home';
      } catch (e) {
        return 'home';
      }
    }
    return 'home';
  });

  // 志愿填报状态 - 从 localStorage 初始化
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [queryMessage, setQueryMessage] = useState({ type: '', text: '' });
  const [volunteerForm, setVolunteerForm] = useState({
    score: '',
    ranking: '',
    lastYearScore: '',
    province: '',
    physicsOrHistory: '',
    subjects: [] as string[],
  });
  const [submitData, setSubmitData] = useState(() => {
    const saved = localStorage.getItem('volunteerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.submitData || {
          score: '',
          ranking: '',
          lastYearScore: '',
          province: '',
          physicsOrHistory: '',
          subjects: [] as string[],
        };
      } catch (e) {
        return {
          score: '',
          ranking: '',
          lastYearScore: '',
          province: '',
          physicsOrHistory: '',
          subjects: [] as string[],
        };
      }
    }
    return {
      score: '',
      ranking: '',
      lastYearScore: '',
      province: '',
      physicsOrHistory: '',
      subjects: [] as string[],
    };
  });
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  // 筛选条件状态
  const [filterSchool, setFilterSchool] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterNature, setFilterNature] = useState('');
  const [allSchools, setAllSchools] = useState<string[]>([]);
  const [allMajors, setAllMajors] = useState<string[]>([]);
  const [allNatures, setAllNatures] = useState<string[]>([]);

  // 下拉框搜索状态
  const [schoolSearch, setSchoolSearch] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [natureSearch, setNatureSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [showNatureDropdown, setShowNatureDropdown] = useState(false);

  // 过滤的下拉框选项
  const filteredSchools = allSchools.filter(s => s.includes(schoolSearch));
  const filteredMajors = allMajors.filter(m => m.includes(majorSearch));
  const filteredNatures = allNatures.filter(n => n.includes(natureSearch));

  const provinces = [
    '北京', '天津', '河北', '山西', '内蒙古',
    '辽宁', '吉林', '黑龙江', '上海', '江苏',
    '浙江', '安徽', '福建', '江西', '山东',
    '河南', '湖北', '湖南', '广东', '广西',
    '海南', '重庆', '四川', '贵州', '云南',
    '西藏', '陕西', '甘肃', '青海', '宁夏',
    '新疆', '香港', '澳门', '台湾'
  ];

  const filteredProvinces = provinces.filter(p =>
    p.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  // 验证邮箱
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // 测试后端连接
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(r => r.json())
      .then(() => console.log('✓ 后端连接正常'))
      .catch(e => console.error('✗ 后端连接失败:', e.message));
  }, []);

  // 验证密码强度（至少8位，包含大小写字母、数字和特殊字符）
  const validatePassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
  };

  // 推荐算法
  const generateRecommendations = (lastYearScore: string) => {
    const score = parseInt(lastYearScore);
    const recommendations = [
      {
        level: '冲',
        nature: '985',
        name: '清华大学',
        major: '计算机科学与技术',
        plan06: 80, plan05: 75, plan04: 72, plan03: 70,
        fy05: score + 25, rank05: 45, fy04: score + 22, rank04: 52, fy03: score + 20, rank03: 58
      },
      {
        level: '冲',
        nature: '211',
        name: '北京大学',
        major: '数学与应用数学',
        plan2024: 70,
        plan05: 68, plan04: 65, plan03: 62,
        fy05: score + 23, rank05: 55, fy04: score + 21, rank04: 62, fy03: score + 18, rank03: 70
      },
      {
        level: '稳',
        nature: '双一流',
        name: '复旦大学',
        major: '物理学',
        plan2024: 120,
        plan05: 110, plan04: 108, plan03: 105,
        fy05: score + 5, rank05: 245, fy04: score + 3, rank04: 258, fy03: score + 2, rank03: 270
      },
      {
        level: '稳',
        nature: '省重点',
        name: '浙江大学',
        major: '电子信息工程',
        plan2024: 150,
        plan05: 140, plan04: 138, plan03: 135,
        fy05: score + 8, rank05: 210, fy04: score + 5, rank04: 225, fy03: score + 4, rank03: 240
      },
      {
        level: '保',
        nature: '双高计划',
        name: '南京大学',
        major: '化学',
        plan2024: 100,
        plan05: 95, plan04: 92, plan03: 90,
        fy05: score - 15, rank05: 850, fy04: score - 12, rank04: 920, fy03: score - 10, rank03: 1000
      },
      {
        level: '保',
        nature: '公办',
        name: '武汉大学',
        major: '地质学',
        plan2024: 90,
        plan05: 85, plan04: 82, plan03: 80,
        fy05: score - 12, rank05: 750, fy04: score - 10, rank04: 820, fy03: score - 8, rank03: 900
      }
    ];

    if (score >= 680) {
      return recommendations.filter((_, i) => i < 6);
    } else if (score >= 620) {
      return recommendations.filter((_, i) => i >= 1).slice(0, 5);
    } else if (score >= 560) {
      return recommendations.filter((_, i) => i >= 2).slice(0, 4);
    } else {
      return recommendations.filter((_, i) => i >= 3).slice(0, 3);
    }
  };

  // 查询高考成绩
  const queryGaokaoScore = async () => {
    if (!admissionNumber.trim()) {
      setQueryMessage({ type: 'error', text: '请输入准考证号' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gaokao/query-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionNumber: admissionNumber.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setVolunteerForm({
          score: String(result.data.score),
          ranking: String(result.data.ranking),
          lastYearScore: String(result.data.lastYearScore),
          province: result.data.province,
          physicsOrHistory: result.data.physicsOrHistory,
          subjects: result.data.subjects.split('、'),
        });
        setQueryMessage({ type: 'success', text: result.data.message });
        setAdmissionNumber('');
      } else {
        setQueryMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setQueryMessage({ type: 'error', text: '网络连接失败，请检查后端服务是否运行' });
    }
  };

  // 生成验证码
  const handleSendCode = async () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = '请输入邮箱';
    } else if (!validateEmail(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setMessage({ type: '', text: '' }); // 清除之前的消息

      // 调用后端 API 发送邮件验证码
      const apiUrl = `${API_BASE_URL}/verification/send-code`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // 检查响应状态
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `HTTP ${response.status}`;

        try {
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            errorMessage = data.message || errorMessage;
          }
        } catch (e) {
          // 如果 JSON 解析失败，使用 HTTP 状态码
        }

        setMessage({ type: 'error', text: `发送失败: ${errorMessage}` });
        return;
      }

      const data = await response.json();

      if (data.success) {
        // 后端成功，生成本地验证码（不显示给用户）
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedCode(code);
        setCodeCount(60);
        setMessage({ type: 'success', text: `验证码已发送到 ${email}，请查收` });
        setErrors({});
      } else {
        // 显示后端返回的错误信息
        setMessage({ type: 'error', text: data.message || '发送验证码失败，请重试' });
      }
    } catch (error) {
      // 后端连接错误
      console.error('发送验证码异常:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setMessage({ type: 'error', text: `网络错误: ${errorMsg}` });
    }
  };

  // 倒计时
  useEffect(() => {
    if (codeCount > 0) {
      const timer = setTimeout(() => setCodeCount(codeCount - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCount]);

  // 处理注册
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = '请输入邮箱';
    } else if (!validateEmail(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!verificationCode) {
      newErrors.code = '请输入验证码';
    } else if (verificationCode !== generatedCode) {
      newErrors.code = '验证码错误';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (!validatePassword(password)) {
      newErrors.password = '密码必须至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)';
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = '请确认密码';
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '两次密码输入不一致';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setMessage({ type: 'success', text: '注册成功！' });
    setTimeout(() => {
      setShowAuth(false);
      setEmail('');
      setVerificationCode('');
      setPassword('');
      setPasswordConfirm('');
      setMessage({ type: '', text: '' });
    }, 2000);
  };

  useEffect(() => {
    // 使用静态数据
    setCarousel([
      { id: 1, title: '计算机科学与技术', description: '当今最热门的技术专业，就业前景广阔' },
      { id: 2, title: '人工智能', description: '未来科技的核心，引领数字时代' },
      { id: 3, title: '数据科学与大数据技术', description: '数据驱动决策的时代已来' },
    ]);

    setMajors([
      { id: 1, name: '计算机科学与技术', category: '工科', description: '培养掌握计算机软硬件知识的高级技术人才', job_prospects: '优秀', avg_salary: 18000 },
      { id: 2, name: '人工智能', category: '工科', description: '学习深度学习、机器学习等前沿技术', job_prospects: '优秀', avg_salary: 20000 },
      { id: 3, name: '数据科学与大数据技术', category: '工科', description: '培养大数据处理和分析人才', job_prospects: '优秀', avg_salary: 17000 },
      { id: 4, name: '财务管理', category: '管理', description: '培养财务管理专业人才', job_prospects: '良好', avg_salary: 12000 },
      { id: 5, name: '法学', category: '法学', description: '培养法律专业人才', job_prospects: '良好', avg_salary: 11000 },
      { id: 6, name: '医学', category: '医学', description: '培养医疗卫生专业人才', job_prospects: '优秀', avg_salary: 14000 },
    ]);

    setNews([
      { id: 1, title: '2024年高考报名人数突破新高', content: '今年高考考生人数创历史新高，各校录取竞争更加激烈', category: '行业动态', views: 1200, created_at: new Date().toISOString() },
      { id: 2, title: 'AI时代来临，这些专业最吃香', content: '随着人工智能发展，相关专业就业前景持续看好', category: '就业前景', views: 980, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, title: '大学四年应该如何选择专业方向', content: '专业选择决定职业发展，选对专业很关键', category: '专业指导', views: 756, created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 4, title: '教育部发布2024年高考改革新政', content: '多项改革政策出台，将影响未来几年高考', category: '政策解读', views: 1450, created_at: new Date(Date.now() - 259200000).toISOString() },
      { id: 5, title: '名校开设新专业，应对产业升级', content: '清华北大等高校纷纷设立新兴产业相关专业', category: '校园新闻', views: 890, created_at: new Date(Date.now() - 345600000).toISOString() },
    ]);

    setLoading(false);
  }, []);

  // 获取完整推荐列表
  const fullRecommendations = generateRecommendations(submitData.lastYearScore);

  // 获取所有学校、专业、性质（用于筛选下拉框）
  useEffect(() => {
    if (fullRecommendations.length > 0) {
      const schools = [...new Set(fullRecommendations.map(r => r.name))];
      const majors = [...new Set(fullRecommendations.map(r => r.major))];
      const natures = [...new Set(fullRecommendations.map(r => r.nature))];
      setAllSchools(schools);
      setAllMajors(majors);
      setAllNatures(natures);
    }
  }, [fullRecommendations]);

  // 应用筛选条件
  const filteredRecommendations = fullRecommendations.filter(rec => {
    if (filterSchool && rec.name !== filterSchool) return false;
    if (filterMajor && rec.major !== filterMajor) return false;
    if (filterNature && rec.nature !== filterNature) return false;
    return true;
  });

  // 保存状态到 localStorage
  useEffect(() => {
    if (currentPage !== 'home' || Object.values(submitData).some(v => v)) {
      localStorage.setItem('volunteerState', JSON.stringify({
        currentPage,
        submitData
      }));
    }
  }, [currentPage, submitData]);

  useEffect(() => {
    if (carousel.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carousel.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carousel.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carousel.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carousel.length) % carousel.length);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div className="app">
      {/* Header */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>智选未来</span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem' }}>
          <button
            onClick={() => {
              setCurrentPage('home');
              window.scrollTo(0, 0);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'home' ? '#0066cc' : '#333',
              cursor: 'pointer',
              fontSize: 'inherit',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0066cc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = currentPage === 'home' ? '#0066cc' : '#333')}
          >
            首页
          </button>
          <button
            onClick={() => {
              setCurrentPage('volunteer');
              window.scrollTo(0, 0);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'volunteer' ? '#0066cc' : '#333',
              cursor: 'pointer',
              fontSize: 'inherit',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0066cc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = currentPage === 'volunteer' ? '#0066cc' : '#333')}
          >
            志愿填报
          </button>
          <a href="#majors" style={{ textDecoration: 'none', color: '#333', transition: 'color 0.3s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0066cc')} onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}>专业查询</a>
          <a href="#universities" style={{ textDecoration: 'none', color: '#333', transition: 'color 0.3s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0066cc')} onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}>高校查询</a>
          <a href="#news" style={{ textDecoration: 'none', color: '#333', transition: 'color 0.3s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0066cc')} onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}>资讯中心</a>
        </nav>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="login-btn" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>登录</button>
          <button className="register-btn" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>注册</button>
        </div>
      </header>

      <main>
        {currentPage === 'recommendation' ? (
          <div style={{ minHeight: 'calc(100vh - 100px)', backgroundColor: '#f9fafb', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              {/* User Input Info */}
              <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                marginTop: '-1rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ color: '#0066cc', marginBottom: '1rem' }}>您的填报信息</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '0.75rem',
                  alignItems: 'start'
                }}>
                  <div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0' }}>高考成绩</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: '0.5rem 0 0 0' }}>{submitData.score}分</p>
                  </div>
                  <div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0' }}>省排名</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: '0.5rem 0 0 0' }}>第 {submitData.ranking} 名</p>
                  </div>
                  <div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0' }}>去年等同分数</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', margin: '0.5rem 0 0 0' }}>{submitData.lastYearScore}分</p>
                  </div>
                  <div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0' }}>所在省份</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: '0.5rem 0 0 0' }}>{submitData.province}</p>
                  </div>
                  <div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0' }}>物理/历史</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: '0.5rem 0 0 0' }}>{submitData.physicsOrHistory}</p>
                  </div>
                  <div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0' }}>选科（4选2）</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: '0.5rem 0 0 0' }}>{submitData.subjects.join('、')}</p>
                  </div>
                </div>
              </div>

              {/* Recommendation Rules */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}>
                <h3 style={{ color: '#667eea', marginTop: 0 }}>📋 推荐规则说明</h3>
                <ul style={{ color: '#555', lineHeight: '1.8', paddingLeft: '1.5rem', textAlign: 'left' }}>
                  <li><strong>冲：</strong>选择比去年等同分数高 20-30 分的院校</li>
                  <li><strong>稳：</strong>选择与去年等同分数相近的院校，录取概率较高</li>
                  <li><strong>保：</strong>选择比去年等同分数低 10-20 分的院校，作为保底选择</li>
                  <li>系统根据您的高考成绩分档推荐不同级别的院校和专业</li>
                  <li>建议您在填报时遵循"冲、稳、保"的策略进行组合</li>
                </ul>
              </div>

              {/* Recommendations List */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#333', marginBottom: '1rem' }}>🎓 为您推荐的院校专业</h2>

                {/* Filter Panel */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {/* 学校名称 */}
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>学校名称</label>
                      <input
                        type="text"
                        placeholder="搜索或选择"
                        value={filterSchool ? filterSchool : schoolSearch}
                        onChange={(e) => {
                          setSchoolSearch(e.target.value);
                          if (filterSchool) setFilterSchool('');
                          setShowSchoolDropdown(true);
                        }}
                        onFocus={() => setShowSchoolDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem'
                        }}
                      />
                      {showSchoolDropdown && filteredSchools.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderTop: 'none',
                          borderRadius: '0 0 0.375rem 0.375rem',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          zIndex: 10
                        }}>
                          {filteredSchools.map(school => (
                            <div
                              key={school}
                              onClick={() => {
                                setFilterSchool(school);
                                setSchoolSearch('');
                                setShowSchoolDropdown(false);
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                backgroundColor: filterSchool === school ? '#f3f4f6' : 'transparent',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = filterSchool === school ? '#f3f4f6' : 'transparent')}
                            >
                              {school}
                            </div>
                          ))}
                        </div>
                      )}
                      {filterSchool && (
                        <button
                          onClick={() => {
                            setFilterSchool('');
                            setSchoolSearch('');
                          }}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '2.2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#999'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* 专业名称 */}
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>专业名称</label>
                      <input
                        type="text"
                        placeholder="搜索或选择"
                        value={filterMajor ? filterMajor : majorSearch}
                        onChange={(e) => {
                          setMajorSearch(e.target.value);
                          if (filterMajor) setFilterMajor('');
                          setShowMajorDropdown(true);
                        }}
                        onFocus={() => setShowMajorDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMajorDropdown(false), 200)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem'
                        }}
                      />
                      {showMajorDropdown && filteredMajors.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderTop: 'none',
                          borderRadius: '0 0 0.375rem 0.375rem',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          zIndex: 10
                        }}>
                          {filteredMajors.map(major => (
                            <div
                              key={major}
                              onClick={() => {
                                setFilterMajor(major);
                                setMajorSearch('');
                                setShowMajorDropdown(false);
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                backgroundColor: filterMajor === major ? '#f3f4f6' : 'transparent',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = filterMajor === major ? '#f3f4f6' : 'transparent')}
                            >
                              {major}
                            </div>
                          ))}
                        </div>
                      )}
                      {filterMajor && (
                        <button
                          onClick={() => {
                            setFilterMajor('');
                            setMajorSearch('');
                          }}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '2.2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#999'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* 学校性质 */}
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>学校性质</label>
                      <input
                        type="text"
                        placeholder="搜索或选择"
                        value={filterNature ? filterNature : natureSearch}
                        onChange={(e) => {
                          setNatureSearch(e.target.value);
                          if (filterNature) setFilterNature('');
                          setShowNatureDropdown(true);
                        }}
                        onFocus={() => setShowNatureDropdown(true)}
                        onBlur={() => setTimeout(() => setShowNatureDropdown(false), 200)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem'
                        }}
                      />
                      {showNatureDropdown && filteredNatures.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderTop: 'none',
                          borderRadius: '0 0 0.375rem 0.375rem',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          zIndex: 10
                        }}>
                          {filteredNatures.map(nature => (
                            <div
                              key={nature}
                              onClick={() => {
                                setFilterNature(nature);
                                setNatureSearch('');
                                setShowNatureDropdown(false);
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                backgroundColor: filterNature === nature ? '#f3f4f6' : 'transparent',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = filterNature === nature ? '#f3f4f6' : 'transparent')}
                            >
                              {nature}
                            </div>
                          ))}
                        </div>
                      )}
                      {filterNature && (
                        <button
                          onClick={() => {
                            setFilterNature('');
                            setNatureSearch('');
                          }}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '2.2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#999'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
                    共 <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{filteredRecommendations.length}</span> 条结果
                  </div>
                </div>

                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem'
                  }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>冲稳保</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>学校性质</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>学校名称</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>专业名称</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>06/05/04/03计划人数</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>计划变动</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>05年最低分数/排名</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>04年最低分数/排名</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>03年最低分数/排名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecommendations.map((rec, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: rec.level === '冲' ? '#ff6b6b' : rec.level === '稳' ? '#4ecdc4' : '#95e1d3',
                              color: 'white',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '0.25rem',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}>
                              {rec.level}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>{rec.nature}</td>
                          <td style={{ padding: '1rem' }}>{rec.name}</td>
                          <td style={{ padding: '1rem' }}>{rec.major}</td>
                          <td style={{ padding: '1rem' }}>{rec.plan06}/{rec.plan05}/{rec.plan04}/{rec.plan03}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>
                            {rec.plan06 > rec.plan05 ? '↑' : rec.plan06 < rec.plan05 ? '↓' : '='}
                          </td>
                          <td style={{ padding: '1rem' }}>{rec.fy05}/{rec.rank05}</td>
                          <td style={{ padding: '1rem' }}>{rec.fy04}/{rec.rank04}</td>
                          <td style={{ padding: '1rem' }}>{rec.fy03}/{rec.rank03}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                  onClick={() => {
                    setCurrentPage('home');
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        ) : currentPage === 'volunteer' ? (
          <div className="volunteer-page">
            <section className="volunteer-intro">
              <div className="volunteer-intro-content">
                <h2>志愿填报助手</h2>
                <p className="intro-subtitle">AI驱动的智能志愿填报推荐系统</p>

                <div className="volunteer-features">
                  <div className="feature-item">
                    <div className="feature-icon">🎯</div>
                    <h4>科学推荐</h4>
                    <p>根据您的成绩和兴趣，推荐最适合的院校和专业</p>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">📊</div>
                    <h4>数据驱动</h4>
                    <p>基于历年分数线、就业数据的科学分析</p>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">🏫</div>
                    <h4>三档策略</h4>
                    <p>冲、稳、保合理配置，降低被调剂风险</p>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">💡</div>
                    <h4>个性化建议</h4>
                    <p>考虑地域、学科、就业等多个维度</p>
                  </div>
                </div>

                <div className="volunteer-requirements">
                  <h3>填报前您需要准备</h3>
                  <ul>
                    <li>✓ 您的高考总分</li>
                    <li>✓ 确定报考的省份</li>
                    <li>✓ 明确理科/文科/不限的选择</li>
                    <li>✓ 了解您感兴趣的学科领域</li>
                  </ul>
                </div>

                <button className="start-btn" onClick={() => setShowVolunteerForm(true)}>
                  开始填报
                </button>
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* Carousel */}
            {carousel.length > 0 && (
          <div className="carousel">
            <h2>{carousel[currentSlide].title}</h2>
            <p>{carousel[currentSlide].description}</p>
            <button style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.5)', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '5px' }} onClick={prevSlide}>❮</button>
            <button style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.5)', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '5px' }} onClick={nextSlide}>❯</button>
            <div className="carousel-controls">
              {carousel.map((_, index) => (
                <div key={index} className={`carousel-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(index)}></div>
              ))}
            </div>
          </div>
            )}

            {/* Featured Majors */}
            <section className="featured" id="majors">
              <h2>推荐专业</h2>
              <p>为您精选热门且前景好的专业</p>
              <div className="majors-grid">
                {majors.map((major) => (
                  <div key={major.id} className="major-card">
                    <div className="major-card-header">
                      <div>
                        <h3>{major.name}</h3>
                        <p className="major-card-category">{major.category}</p>
                      </div>
                      <span className={`prospect-badge ${major.job_prospects === '优秀' ? 'prospect-excellent' : 'prospect-good'}`}>
                        {major.job_prospects}
                      </span>
                    </div>
                    <p className="major-card-desc">{major.description}</p>
                    <div className="major-card-footer">
                      <span className="major-card-salary">¥{major.avg_salary}k/月</span>
                    </div>
                    <button>了解更多</button>
                  </div>
                ))}
              </div>
            </section>

            {/* News */}
            <section className="news" id="news">
              <h2>热点话题</h2>
              <p>最新的高考和专业选择资讯</p>
              <div className="news-list">
                {news.map((item) => (
                  <div key={item.id} className="news-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <h3>{item.title}</h3>
                      <span className="news-category">{item.category}</span>
                    </div>
                    <p className="news-item-desc">{item.content}</p>
                    <div className="news-item-meta">
                      <span>{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                      <span>👁 {item.views} 次浏览</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
              <h2>准备好选择你的未来了吗？</h2>
              <p>无论是对专业一无所知，还是已有明确方向，我们都能帮你找到最适合的选择</p>
              <button onClick={() => { setAuthMode('register'); setShowAuth(true); }}>立即开始</button>
            </section>
          </>
        )}
      </main>

      {/* Volunteer Form Modal */}
      {showVolunteerForm && (
        <div className="volunteer-modal-overlay">
          <div className="volunteer-modal">
            <div className="volunteer-modal-header">
              <h2>请输入您的信息</h2>
              <button className="close-btn" onClick={() => setShowVolunteerForm(false)}>✕</button>
            </div>

            <div className="volunteer-modal-content">
              {/* 成绩查询部分 */}
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0f7ff', borderRadius: '0.5rem', borderLeft: '4px solid #0066cc' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#0066cc', fontWeight: '600', fontSize: '0.85rem' }}>💡 或输入准考证号快速查询</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="准考证号（如：20240001001）"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && queryGaokaoScore()}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.3rem',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={queryGaokaoScore}
                    style={{
                      padding: '0.5rem',
                      background: '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.3rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0052a3')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#0066cc')}
                  >
                    查询
                  </button>
                </div>
                {queryMessage.text && (
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    padding: '0.4rem',
                    borderRadius: '0.3rem',
                    fontSize: '0.8rem',
                    background: queryMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: queryMessage.type === 'success' ? '#065f46' : '#991b1b'
                  }}>
                    {queryMessage.text}
                  </p>
                )}
              </div>

              <div className="volunteer-form-section">
                <div className="form-group">
                  <label>高考成绩</label>
                  <input
                    type="text"
                    placeholder="请输入总分（如：620）"
                    value={volunteerForm.score}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setVolunteerForm({ ...volunteerForm, score: value });
                    }}
                  />
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label>所在省份</label>
                  <input
                    type="text"
                    placeholder="输入或选择省份"
                    value={volunteerForm.province}
                    onChange={(e) => {
                      setVolunteerForm({ ...volunteerForm, province: e.target.value });
                      setProvinceSearch(e.target.value);
                      setShowProvinceDropdown(true);
                    }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
                  />
                  {showProvinceDropdown && filteredProvinces.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderTop: 'none',
                      borderRadius: '0 0 0.375rem 0.375rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                      {filteredProvinces.map((province) => (
                        <div
                          key={province}
                          onClick={() => {
                            setVolunteerForm({ ...volunteerForm, province });
                            setProvinceSearch('');
                            setShowProvinceDropdown(false);
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            backgroundColor: volunteerForm.province === province ? '#f3f4f6' : 'transparent',
                            color: '#333',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = volunteerForm.province === province ? '#f3f4f6' : 'transparent')}
                        >
                          {province}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>物理/历史（二选一）</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['物理', '历史'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setVolunteerForm({ ...volunteerForm, physicsOrHistory: option })}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          border: volunteerForm.physicsOrHistory === option ? 'none' : '2px solid #d1d5db',
                          borderRadius: '0.375rem',
                          background: volunteerForm.physicsOrHistory === option ? 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)' : 'white',
                          color: volunteerForm.physicsOrHistory === option ? 'white' : '#333',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.3s',
                          fontSize: '0.9rem'
                        }}
                        onMouseEnter={(e) => {
                          if (volunteerForm.physicsOrHistory !== option) {
                            e.currentTarget.style.borderColor = '#0066cc';
                            e.currentTarget.style.color = '#0066cc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (volunteerForm.physicsOrHistory !== option) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.color = '#333';
                          }
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>选科（4选2）</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {['化学', '政治', '生物', '地理'].map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => {
                          if (volunteerForm.subjects.includes(subject)) {
                            setVolunteerForm({ ...volunteerForm, subjects: volunteerForm.subjects.filter(s => s !== subject) });
                          } else if (volunteerForm.subjects.length < 2) {
                            setVolunteerForm({ ...volunteerForm, subjects: [...volunteerForm.subjects, subject] });
                          }
                        }}
                        disabled={volunteerForm.subjects.length === 2 && !volunteerForm.subjects.includes(subject)}
                        style={{
                          padding: '0.6rem',
                          border: volunteerForm.subjects.includes(subject) ? 'none' : '2px solid #d1d5db',
                          borderRadius: '0.375rem',
                          background: volunteerForm.subjects.includes(subject) ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                          color: volunteerForm.subjects.includes(subject) ? 'white' : '#333',
                          cursor: volunteerForm.subjects.length === 2 && !volunteerForm.subjects.includes(subject) ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.3s',
                          fontSize: '0.9rem',
                          opacity: volunteerForm.subjects.length === 2 && !volunteerForm.subjects.includes(subject) ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!volunteerForm.subjects.includes(subject) && (volunteerForm.subjects.length < 2)) {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.color = '#667eea';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!volunteerForm.subjects.includes(subject)) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.color = '#333';
                          }
                        }}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="volunteer-actions">
                <button className="submit-btn" onClick={() => {
                  if (volunteerForm.score && volunteerForm.province && volunteerForm.physicsOrHistory && volunteerForm.subjects.length === 2) {
                    setSubmitData(volunteerForm);
                    setShowVolunteerForm(false);
                    setCurrentPage('recommendation');
                    window.scrollTo(0, 0);
                  } else {
                    alert('请填写所有必填项：\n- 高考成绩\n- 所在省份\n- 物理/历史\n- 选科（4选2）');
                  }
                }}>
                  获取推荐
                </button>
                <button className="cancel-btn" onClick={() => setShowVolunteerForm(false)}>
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <h3>关于我们</h3>
            <p>智选未来致力于为学生和家长提供专业的志愿填报指导。</p>
          </div>
          <div>
            <h3>快速链接</h3>
            <a href="#majors">专业查询</a>
            <a href="#universities">高校查询</a>
            <a href="#志愿填报">志愿填报</a>
          </div>
          <div>
            <h3>帮助</h3>
            <a href="#常见问题">常见问题</a>
            <a href="#使用教程">使用教程</a>
            <a href="#反馈建议">反馈建议</a>
          </div>
          <div>
            <h3>联系我们</h3>
            <p>📧 contact@gaokao.com</p>
            <p>📞 400-123-4567</p>
            <p>📍 北京市朝阳区</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 智选未来。保留所有权利。</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{authMode === 'login' ? '登录' : '注册'}</h2>
              <button onClick={() => setShowAuth(false)}>✕</button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={(e) => { e.preventDefault(); alert('功能演示'); }}>
                <div className="form-group">
                  <label>邮箱</label>
                  <input type="email" placeholder="请输入邮箱" />
                </div>
                <div className="form-group">
                  <label>密码</label>
                  <input type="password" placeholder="请输入密码" />
                </div>
                <button type="submit">登录</button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                {message.text && (
                  <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                    {message.text}
                  </div>
                )}

                {/* 邮箱 */}
                <div className="form-group">
                  <label>邮箱</label>
                  <input
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                {/* 验证码 */}
                <div className="form-group">
                  <label>验证码</label>
                  <div className="code-input-group">
                    <input
                      type="text"
                      placeholder="请输入验证码"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        if (errors.code) setErrors({ ...errors, code: '' });
                      }}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      className="code-btn"
                      onClick={handleSendCode}
                      disabled={codeCount > 0 || !email}
                    >
                      {codeCount > 0 ? `${codeCount}s` : '发送'}
                    </button>
                  </div>
                  {errors.code && <span className="error-text">{errors.code}</span>}
                </div>

                {/* 密码 */}
                <div className="form-group">
                  <label>密码</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="至少8位，包含大小写字母、数字和特殊字符"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? '隐藏密码' : '显示密码'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                {/* 确认密码 */}
                <div className="form-group">
                  <label>确认密码</label>
                  <div className="password-input-group">
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      placeholder="请再次输入密码"
                      value={passwordConfirm}
                      onChange={(e) => {
                        setPasswordConfirm(e.target.value);
                        if (errors.passwordConfirm) setErrors({ ...errors, passwordConfirm: '' });
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      title={showPasswordConfirm ? '隐藏密码' : '显示密码'}
                    >
                      {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.passwordConfirm && <span className="error-text">{errors.passwordConfirm}</span>}
                </div>

                <button type="submit">注册</button>
              </form>
            )}

            <div className="auth-toggle">
              <span>
                {authMode === 'login' ? '没有账户？' : '已有账户？'}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setErrors({});
                    setMessage({ type: '', text: '' });
                  }}
                >
                  {authMode === 'login' ? '立即注册' : '返回登录'}
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

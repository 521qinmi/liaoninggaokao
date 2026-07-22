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

// 院校推荐库（来自数据库，含相对分数偏移）
interface College {
  id: number;
  level: string;
  nature: string;
  name: string;
  major: string;
  plan06: number;
  plan05: number;
  plan04: number;
  plan03: number;
  off05: number; rank05: number;
  off04: number; rank04: number;
  off03: number; rank03: number;
}

// 结合考生分数计算出的推荐项
interface Recommendation {
  level: string;
  nature: string;
  name: string;
  major: string;
  plan06: number; plan05: number; plan04: number; plan03: number;
  fy05: number; rank05: number;
  fy04: number; rank04: number;
  fy03: number; rank03: number;
}

interface VolunteerData {
  score: string;
  ranking: string;
  lastYearScore: string;
  province: string;
  physicsOrHistory: string;
  subjects: string[];
}

interface UserProfile extends VolunteerData {
  email: string;
  name: string;
}

const emptyVolunteerData: VolunteerData = {
  score: '',
  ranking: '',
  lastYearScore: '',
  province: '',
  physicsOrHistory: '',
  subjects: [],
};

const calculateLastYearScore = (scoreValue: string, rankingValue: string) => {
  const score = Number(scoreValue);
  const ranking = Number(rankingValue);

  if (!score || !ranking) return '';

  let adjustment = 20;
  if (ranking <= 500) adjustment = 5;
  else if (ranking <= 2000) adjustment = 8;
  else if (ranking <= 10000) adjustment = 12;
  else if (ranking <= 30000) adjustment = 16;

  return String(Math.max(score - adjustment, 0));
};

const normalizeVolunteerData = (data: Partial<VolunteerData>): VolunteerData => {
  const score = data.score || '';
  const ranking = data.ranking || '';

  return {
    score,
    ranking,
    lastYearScore: calculateLastYearScore(score, ranking),
    province: data.province || '',
    physicsOrHistory: data.physicsOrHistory || '',
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
  };
};

const getVolunteerDataFromUser = (user: UserProfile | null): VolunteerData => normalizeVolunteerData({
  score: user?.score || '',
  ranking: user?.ranking || '',
  province: user?.province || '',
  physicsOrHistory: user?.physicsOrHistory || '',
  subjects: Array.isArray(user?.subjects) ? user.subjects : [],
});

const isVolunteerDataComplete = (data: VolunteerData) => Boolean(
  data.score &&
  data.ranking &&
  calculateLastYearScore(data.score, data.ranking) &&
  data.province &&
  data.physicsOrHistory &&
  data.subjects.length === 2
);


export default function App() {
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          ...emptyVolunteerData,
          ...parsed,
          subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
        };
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }

    return localStorage.getItem('isLoggedIn') === 'true'
      ? { ...emptyVolunteerData, email: '已登录用户', name: '用户' }
      : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true' || Boolean(localStorage.getItem('currentUser')));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingVolunteerStart, setPendingVolunteerStart] = useState(false);
  const [loading, setLoading] = useState(true);

  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册表单状态
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeCount, setCodeCount] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // 注册/个人信息表单状态
  const [profileForm, setProfileForm] = useState<VolunteerData>(() => getVolunteerDataFromUser(currentUser));
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // 页面状态 - 从 localStorage 初始化
  const [currentPage, setCurrentPage] = useState<'home' | 'volunteer' | 'recommendation' | 'profile'>(() => {
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
    return getVolunteerDataFromUser(currentUser);
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

  // 逐条密码规则（用于输入时实时校验提示）
  const getPasswordChecks = (value: string) => [
    { label: '至少 8 位', ok: value.length >= 8 },
    { label: '含小写字母', ok: /[a-z]/.test(value) },
    { label: '含大写字母', ok: /[A-Z]/.test(value) },
    { label: '含数字', ok: /\d/.test(value) },
    { label: '含特殊字符 @$!%*?&', ok: /[@$!%*?&]/.test(value) },
  ];

  // 推荐算法
  const generateRecommendations = (lastYearScore: string): Recommendation[] => {
    const score = parseInt(lastYearScore);
    // 基于数据库中的院校库，结合考生分数计算分数线
    const recommendations: Recommendation[] = colleges.map((c) => ({
      level: c.level,
      nature: c.nature,
      name: c.name,
      major: c.major,
      plan06: c.plan06, plan05: c.plan05, plan04: c.plan04, plan03: c.plan03,
      fy05: score + c.off05, rank05: c.rank05,
      fy04: score + c.off04, rank04: c.rank04,
      fy03: score + c.off03, rank03: c.rank03,
    }));

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

  const handleStartVolunteer = () => {
    if (!isLoggedIn) {
      setPendingVolunteerStart(true);
      setAuthMode('register');
      setProfileForm(emptyVolunteerData);
      setShowAuth(true);
      setMessage({ type: 'error', text: '请先注册并填写个人信息，注册成功后即可生成志愿推荐' });
      return;
    }

    const userVolunteerData = getVolunteerDataFromUser(currentUser);
    if (!isVolunteerDataComplete(userVolunteerData)) {
      setProfileForm(userVolunteerData);
      setIsProfileEditing(true);
      setProfileMessage({ type: 'error', text: '请先完善个人信息，系统将根据这些信息生成志愿推荐' });
      setCurrentPage('profile');
      window.scrollTo(0, 0);
      return;
    }

    setSubmitData(userVolunteerData);
    setCurrentPage('recommendation');
    window.scrollTo(0, 0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setMessage({ type: 'error', text: '请输入邮箱和密码' });
      return;
    }

    // 向数据库（后端）校验登录
    let user: UserProfile;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        setMessage({ type: 'error', text: data.error || '邮箱或密码错误' });
        return;
      }
      user = {
        ...emptyVolunteerData,
        ...data.user,
        subjects: Array.isArray(data.user.subjects) ? data.user.subjects : [],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setMessage({ type: 'error', text: `网络错误: ${errorMsg}` });
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowProfileMenu(false);
    setMessage({ type: 'success', text: '登录成功！' });

    setTimeout(() => {
      setShowAuth(false);
      setLoginEmail('');
      setLoginPassword('');
      setMessage({ type: '', text: '' });

      if (pendingVolunteerStart) {
        setPendingVolunteerStart(false);
        const userVolunteerData = getVolunteerDataFromUser(user);
        if (isVolunteerDataComplete(userVolunteerData)) {
          setSubmitData(userVolunteerData);
          setCurrentPage('recommendation');
        } else {
          setProfileForm(userVolunteerData);
          setIsProfileEditing(true);
          setProfileMessage({ type: 'error', text: '请先完善个人信息，系统将根据这些信息生成志愿推荐' });
          setCurrentPage('profile');
        }
        window.scrollTo(0, 0);
      }
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('volunteerState');
    setCurrentUser(null);
    setProfileForm(emptyVolunteerData);
    setSubmitData(emptyVolunteerData);
    setIsProfileEditing(false);
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    setPendingVolunteerStart(false);
    setProfileMessage({ type: '', text: '' });
    setCurrentPage('home');
  };

  const handleSaveProfile = async (options?: { goRecommendation?: boolean }) => {
    if (!currentUser) return;

    const normalizedProfile = normalizeVolunteerData(profileForm);

    if (!isVolunteerDataComplete(normalizedProfile)) {
      setProfileMessage({ type: 'error', text: '请完整填写成绩、排名、省份、物理/历史和两门选科' });
      return;
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      ...normalizedProfile,
      subjects: [...normalizedProfile.subjects],
    };

    // 保存到数据库（后端）
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileMessage({ type: 'error', text: data.error || '保存失败，请重试' });
        return;
      }
      if (data.user) Object.assign(updatedUser, data.user);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setProfileMessage({ type: 'error', text: `网络错误: ${errorMsg}` });
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setSubmitData(getVolunteerDataFromUser(updatedUser));
    setIsProfileEditing(false);
    setProfileMessage({ type: 'success', text: '个人信息已保存' });

    if (options?.goRecommendation) {
      setCurrentPage('recommendation');
      window.scrollTo(0, 0);
    }
  };

  const toggleProfileSubject = (subject: string) => {
    setProfileForm((prev) => {
      if (prev.subjects.includes(subject)) {
        return { ...prev, subjects: prev.subjects.filter(s => s !== subject) };
      }
      if (prev.subjects.length >= 2) return prev;
      return { ...prev, subjects: [...prev.subjects, subject] };
    });
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
        const queriedData = normalizeVolunteerData({
          score: String(result.data.score || ''),
          ranking: String(result.data.ranking || ''),
          province: result.data.province || '',
          physicsOrHistory: result.data.physicsOrHistory || '',
          subjects: result.data.subjects ? result.data.subjects.split('、') : [],
        });
        setVolunteerForm(queriedData);
        setProfileForm(queriedData);
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
      setSendingCode(true);
      setMessage({ type: '', text: '' }); // 清除之前的消息

      // 调用后端发送邮箱验证码
      const response = await fetch(`${API_BASE_URL}/verification/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let data: { success?: boolean; message?: string } = {};
      try {
        data = await response.json();
      } catch {
        // 非 JSON 响应（如代理层错误）
      }

      if (response.ok && data.success) {
        setCodeCount(60);
        setErrors({});
        setMessage({ type: 'success', text: data.message || '验证码已发送到您的邮箱，请查收' });
      } else if (response.status === 409) {
        // 邮箱已注册：在邮箱框下提示，并引导去登录
        setErrors({ email: data.message || '该邮箱已注册，请直接登录' });
        setMessage({ type: 'error', text: data.message || '该邮箱已注册，请直接登录' });
      } else {
        setMessage({ type: 'error', text: `发送失败: ${data.message || `HTTP ${response.status}`}` });
      }
    } catch (error) {
      console.error('发送验证码异常:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setMessage({ type: 'error', text: `网络错误: ${errorMsg}` });
    } finally {
      setSendingCode(false);
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
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = '请输入邮箱';
    } else if (!validateEmail(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!verificationCode) {
      newErrors.code = '请输入验证码';
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

    if (!isVolunteerDataComplete(profileForm)) {
      newErrors.profile = '请完整填写成绩、排名、省份、物理/历史和两门选科';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 向后端校验邮箱验证码
    try {
      const response = await fetch(`${API_BASE_URL}/verification/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      let data: { success?: boolean; message?: string } = {};
      try {
        data = await response.json();
      } catch {
        // 忽略非 JSON 响应
      }

      if (!response.ok || !data.success) {
        setErrors({ code: data.message || '验证码校验失败' });
        return;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setMessage({ type: 'error', text: `网络错误: ${errorMsg}` });
      return;
    }

    const normalizedProfile = normalizeVolunteerData(profileForm);
    const user: UserProfile = {
      ...normalizedProfile,
      email,
      name: email.split('@')[0] || '用户',
      subjects: [...normalizedProfile.subjects],
    };

    // 写入数据库（后端）
    try {
      const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, password }),
      });
      const regData = await regRes.json().catch(() => ({}));
      if (!regRes.ok) {
        setErrors({ email: regData.error || '注册失败，请重试' });
        return;
      }
      // 以数据库返回的用户为准
      if (regData.user) Object.assign(user, regData.user);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setMessage({ type: 'error', text: `网络错误: ${errorMsg}` });
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
    setSubmitData(getVolunteerDataFromUser(user));
    setMessage({ type: 'success', text: '注册成功！已为您保存个人信息' });
    setTimeout(() => {
      setShowAuth(false);
      setEmail('');
      setVerificationCode('');
      setPassword('');
      setPasswordConfirm('');
      setMessage({ type: '', text: '' });
      if (pendingVolunteerStart) {
        setPendingVolunteerStart(false);
        setCurrentPage('recommendation');
      } else {
        setCurrentPage('profile');
      }
      window.scrollTo(0, 0);
    }, 800);
  };

  useEffect(() => {
    // 从数据库（后端）加载首页数据与院校库
    const loadData = async () => {
      try {
        const [homeRes, collegesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/home/data`),
          fetch(`${API_BASE_URL}/home/colleges`),
        ]);
        const home = await homeRes.json();
        const collegeList = await collegesRes.json();

        setCarousel(Array.isArray(home.carousel) ? home.carousel : []);
        setMajors(Array.isArray(home.featuredMajors) ? home.featuredMajors : []);
        setNews(Array.isArray(home.news) ? home.news : []);
        setColleges(Array.isArray(collegeList) ? collegeList : []);
      } catch (error) {
        console.error('加载首页数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

  const renderProfileSummary = (data: VolunteerData) => (
    <div className="profile-summary-grid">
      <div className="profile-summary-item">
        <span>高考成绩</span>
        <strong>{data.score || '未填写'}{data.score && ' 分'}</strong>
      </div>
      <div className="profile-summary-item">
        <span>省排名</span>
        <strong>{data.ranking ? `第 ${data.ranking} 名` : '未填写'}</strong>
      </div>
      <div className="profile-summary-item">
        <span>去年等同分数</span>
        <strong>{calculateLastYearScore(data.score, data.ranking) || '待计算'}{calculateLastYearScore(data.score, data.ranking) && ' 分'}</strong>
      </div>
      <div className="profile-summary-item">
        <span>所在省份</span>
        <strong>{data.province || '未填写'}</strong>
      </div>
      <div className="profile-summary-item">
        <span>物理/历史</span>
        <strong>{data.physicsOrHistory || '未选择'}</strong>
      </div>
      <div className="profile-summary-item">
        <span>选科</span>
        <strong>{data.subjects.length ? data.subjects.join('、') : '未选择'}</strong>
      </div>
    </div>
  );

  const renderProfileFields = (options?: { hideLastYearScore?: boolean }) => (
    <div className="profile-form-grid editing">
      <div className="form-group compact-field">
        <label>高考成绩</label>
        <input
          type="text"
          placeholder="如：620"
          value={profileForm.score}
          onChange={(e) => setProfileForm({ ...profileForm, score: e.target.value.replace(/[^0-9]/g, '') })}
        />
      </div>

      <div className="form-group compact-field">
        <label>省排名</label>
        <input
          type="text"
          placeholder="如：12000"
          value={profileForm.ranking}
          onChange={(e) => setProfileForm({ ...profileForm, ranking: e.target.value.replace(/[^0-9]/g, '') })}
        />
      </div>

      {!options?.hideLastYearScore && (
        <div className="form-group compact-field">
          <label>去年等同分数</label>
          <div className="calculated-score-box">
            {calculateLastYearScore(profileForm.score, profileForm.ranking) || '填写成绩和排名后自动计算'}
            {calculateLastYearScore(profileForm.score, profileForm.ranking) && <span>分</span>}
          </div>
          <p className="field-help">根据高考成绩和省排名自动换算，无需手动填写。</p>
        </div>
      )}

      <div className="form-group compact-field" style={{ position: 'relative' }}>
        <label>所在省份</label>
        <input
          type="text"
          placeholder="输入或选择省份"
          value={profileForm.province}
          onChange={(e) => {
            setProfileForm({ ...profileForm, province: e.target.value });
            setProvinceSearch(e.target.value);
            setShowProvinceDropdown(true);
          }}
          onFocus={() => setShowProvinceDropdown(true)}
          onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
        />
        {showProvinceDropdown && filteredProvinces.length > 0 && (
          <div className="profile-select-dropdown">
            {filteredProvinces.map((province) => (
              <div
                key={province}
                className="profile-select-option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setProfileForm({ ...profileForm, province });
                  setProvinceSearch('');
                  setShowProvinceDropdown(false);
                }}
              >
                {province}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group compact-field stack-col1">
        <label>物理/历史（二选一）</label>
        <div className="choice-group">
          {['物理', '历史'].map(option => (
            <button
              key={option}
              type="button"
              className={`choice-btn ${profileForm.physicsOrHistory === option ? 'active' : ''}`}
              onClick={() => setProfileForm({ ...profileForm, physicsOrHistory: option })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group compact-field full-width">
        <label>选科（4选2）</label>
        <div className="choice-grid">
          {['化学', '政治', '生物', '地理'].map(subject => (
            <button
              key={subject}
              type="button"
              className={`choice-btn ${profileForm.subjects.includes(subject) ? 'active' : ''}`}
              disabled={profileForm.subjects.length === 2 && !profileForm.subjects.includes(subject)}
              onClick={() => toggleProfileSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  // 注册：整页界面（不再使用模态框）
  if (showAuth && authMode === 'register') {
    return (
      <div className="app register-page">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>智选未来</span>
          </div>
          <button
            className="login-btn"
            onClick={() => {
              setShowAuth(false);
              setPendingVolunteerStart(false);
              setErrors({});
              setMessage({ type: '', text: '' });
            }}
          >
            ← 返回首页
          </button>
        </header>

        <div className="register-split">
          {/* 左侧：高考主题宣传栏 */}
          <aside className="register-promo">
            <div className="register-promo-content">
              <span className="register-promo-badge">2026 高考志愿填报</span>
              <h1 className="register-promo-title">
                一分不浪费<br />选对专业赢未来
              </h1>
              <p className="register-promo-desc">
                填写高考成绩与省排名，系统结合历年录取数据，为你智能生成
                「冲、稳、保」志愿方案。
              </p>

              <ul className="register-promo-features">
                <li><span>🎯</span> 精准位次换算，锁定去年等效分</li>
                <li><span>📊</span> 院校专业大数据，一键对比</li>
                <li><span>🧭</span> 冲稳保梯度推荐，科学填报</li>
                <li><span>🔒</span> 信息本地保存，隐私更安心</li>
              </ul>

              <div className="register-promo-stats">
                <div>
                  <strong>2000+</strong>
                  <span>院校数据</span>
                </div>
                <div>
                  <strong>800万</strong>
                  <span>考生信赖</span>
                </div>
                <div>
                  <strong>98%</strong>
                  <span>录取匹配度</span>
                </div>
              </div>

              <p className="register-promo-quote">“选择比努力更重要，志愿填报是人生第一次重大选择。”</p>
            </div>
          </aside>

          {/* 右侧：注册表单 */}
          <div className="register-form-panel">
            <div className="register-form-inner">
              <div className="register-form-head">
                <h2>创建账户</h2>
                <p>只需一步，即可获取专属志愿推荐</p>
              </div>

              {message.text && (
                <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleRegister}>
                {/* 账户信息 */}
                <div className="register-field-group">
                  <div className="register-field-group-title">账户信息</div>

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

                  <div className="form-group">
                    <label>密码</label>
                    <div className="password-input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="至少8位，含大小写、数字及符号"
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
                    {password && (
                      <ul className="password-checks">
                        {getPasswordChecks(password).map((c) => (
                          <li key={c.label} className={c.ok ? 'ok' : ''}>
                            <span>{c.ok ? '✓' : '○'}</span> {c.label}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.password && <span className="error-text">{errors.password}</span>}
                  </div>

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
                        onBlur={() => {
                          if (passwordConfirm && passwordConfirm !== password) {
                            setErrors((prev) => ({ ...prev, passwordConfirm: '两次密码输入不一致' }));
                          } else {
                            setErrors((prev) => ({ ...prev, passwordConfirm: '' }));
                          }
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
                        disabled={codeCount > 0 || sendingCode || !email}
                      >
                        {codeCount > 0 ? `${codeCount}s` : sendingCode ? '发送中' : '发送'}
                      </button>
                    </div>
                    {errors.code && <span className="error-text">{errors.code}</span>}
                  </div>
                </div>

                {/* 填报基础信息 */}
                <div className="register-field-group">
                  <div className="register-field-group-title">填报基础信息</div>
                  <p className="register-field-group-hint">请填写完整，后续可在个人资料页修改。</p>
                  {errors.profile && <span className="error-text">{errors.profile}</span>}
                  {renderProfileFields({ hideLastYearScore: true })}
                </div>

                <button type="submit" className="register-submit-btn">注册并保存信息</button>
              </form>

              <div className="auth-toggle">
                <span>
                  已有账户？
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setPendingVolunteerStart(false);
                      setErrors({});
                      setMessage({ type: '', text: '' });
                    }}
                  >
                    返回登录
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="header-actions">
          {isLoggedIn && currentUser ? (
            <div className="profile-area">
              <button className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <span className="profile-avatar">{currentUser.name.slice(0, 1).toUpperCase()}</span>
                <span className="profile-name">{currentUser.name}</span>
                <span className="profile-arrow">▾</span>
              </button>

              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-info">
                    <div className="profile-info-name">{currentUser.name}</div>
                    <div className="profile-info-email">{currentUser.email}</div>
                  </div>
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setProfileForm(getVolunteerDataFromUser(currentUser));
                      setIsProfileEditing(false);
                      setCurrentPage('profile');
                      window.scrollTo(0, 0);
                    }}
                  >
                    个人资料
                  </button>
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="login-btn" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>登录</button>
              <button className="register-btn" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>注册</button>
            </>
          )}
        </div>
      </header>

      <main>
        {currentPage === 'profile' ? (
          <div className="profile-page">
            <div className="profile-card">
              <div className="profile-page-header">
                <div>
                  <h2>个人资料</h2>
                  <p>系统会根据这些信息直接生成志愿推荐，注册后也可以随时修改。</p>
                </div>
                {currentUser && (
                  <div className="profile-page-user">
                    <span className="profile-avatar large">{currentUser.name.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <div className="profile-info-name">{currentUser.name}</div>
                      <div className="profile-info-email">{currentUser.email}</div>
                    </div>
                  </div>
                )}
              </div>

              {profileMessage.text && (
                <div className={profileMessage.type === 'success' ? 'success-message' : 'error-message'}>
                  {profileMessage.text}
                </div>
              )}

              {isProfileEditing
                ? renderProfileFields()
                : renderProfileSummary(getVolunteerDataFromUser(currentUser))}

              <div className="profile-actions">
                {isProfileEditing ? (
                  <>
                    <button className="cancel-btn" onClick={() => {
                      setProfileForm(getVolunteerDataFromUser(currentUser));
                      setIsProfileEditing(false);
                      setProfileMessage({ type: '', text: '' });
                    }}>
                      取消
                    </button>
                    <button className="submit-btn" onClick={() => handleSaveProfile()}>
                      保存资料
                    </button>
                    <button className="start-btn" onClick={() => handleSaveProfile({ goRecommendation: true })}>
                      保存并生成推荐
                    </button>
                  </>
                ) : (
                  <>
                    <button className="submit-btn" onClick={() => {
                      setProfileForm(getVolunteerDataFromUser(currentUser));
                      setIsProfileEditing(true);
                      setProfileMessage({ type: '', text: '' });
                    }}>
                      修改资料
                    </button>
                    <button className="start-btn" onClick={handleStartVolunteer}>
                      生成推荐
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : currentPage === 'recommendation' ? (
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
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {rec.plan06 > rec.plan05 ? (
                              <span style={{
                                display: 'inline-block',
                                fontSize: '2rem',
                                color: '#22c55e',
                                fontWeight: 'bold',
                                backgroundColor: '#dcfce7',
                                width: '3rem',
                                height: '3rem',
                                lineHeight: '3rem',
                                borderRadius: '0.5rem'
                              }}>↑</span>
                            ) : rec.plan06 < rec.plan05 ? (
                              <span style={{
                                display: 'inline-block',
                                fontSize: '2rem',
                                color: '#ef4444',
                                fontWeight: 'bold',
                                backgroundColor: '#fee2e2',
                                width: '3rem',
                                height: '3rem',
                                lineHeight: '3rem',
                                borderRadius: '0.5rem'
                              }}>↓</span>
                            ) : (
                              <span style={{
                                display: 'inline-block',
                                fontSize: '1.8rem',
                                color: '#6b7280',
                                fontWeight: 'bold',
                                backgroundColor: '#f3f4f6',
                                width: '3rem',
                                height: '3rem',
                                lineHeight: '3rem',
                                borderRadius: '0.5rem'
                              }}>=</span>
                            )}
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

                <button className="start-btn" onClick={handleStartVolunteer}>
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

      {/* Auth Modal（仅登录使用；注册已改为整页界面） */}
      {showAuth && authMode === 'login' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>登录</h2>
              <button onClick={() => {
                setShowAuth(false);
                setPendingVolunteerStart(false);
                setMessage({ type: '', text: '' });
              }}>✕</button>
            </div>

            {message.text && (
              <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  placeholder="请输入邮箱"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button type="submit">登录</button>
            </form>

            <div className="auth-toggle">
              <span>
                没有账户？
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setPendingVolunteerStart(false);
                    setErrors({});
                    setMessage({ type: '', text: '' });
                    setProfileForm(getVolunteerDataFromUser(currentUser));
                  }}
                >
                  立即注册
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

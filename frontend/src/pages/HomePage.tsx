import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import Featured from '../components/Featured';
import News from '../components/News';
import Auth from '../components/Auth';
import { homeAPI } from '../services/api';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  major_id: number;
}

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

export default function HomePage() {
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homeAPI.getHomeData();
        setCarousel(response.data.carousel);
        setMajors(response.data.featuredMajors);
        setNews(response.data.news);
        setError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        // 使用静态数据作为后备
        setCarousel([
          { id: 1, title: '计算机科学与技术', description: '当今最热门的技术专业，就业前景广阔', major_id: 1 },
          { id: 2, title: '人工智能', description: '未来科技的核心，引领数字时代', major_id: 2 },
          { id: 3, title: '数据科学与大数据技术', description: '数据驱动决策的时代已来', major_id: 3 },
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">正在加载页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
        onRegisterClick={() => {
          setAuthMode('register');
          setShowAuth(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <Carousel items={carousel} />

        <Featured majors={majors} />

        <News items={news} />

        <section className="bg-indigo-600 text-white rounded-lg p-12 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">准备好选择你的未来了吗？</h2>
          <p className="text-lg mb-6 opacity-90">
            无论是对专业一无所知，还是已有明确方向，我们都能帮你找到最适合的选择
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            立即开始
          </button>
        </section>

        <footer className="border-t border-gray-300 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-4">关于我们</h3>
              <p className="text-gray-600 text-sm">
                高考志愿网致力于为学生和家长提供专业的志愿填报指导。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-indigo-600">专业查询</a></li>
                <li><a href="#" className="hover:text-indigo-600">高校查询</a></li>
                <li><a href="#" className="hover:text-indigo-600">志愿填报</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-4">帮助</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-indigo-600">常见问题</a></li>
                <li><a href="#" className="hover:text-indigo-600">使用教程</a></li>
                <li><a href="#" className="hover:text-indigo-600">反馈建议</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-4">联系我们</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📧 contact@gaokao.com</li>
                <li>📞 400-123-4567</li>
                <li>📍 北京市朝阳区</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2024 高考志愿网。保留所有权利。</p>
          </div>
        </footer>
      </main>

      <Auth
        isOpen={showAuth}
        mode={authMode}
        onClose={() => setShowAuth(false)}
        onSuccess={handleShowSuccess}
      />
    </div>
  );
}

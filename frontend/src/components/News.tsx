interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  views: number;
  created_at: string;
}

export interface NewsProps {
  items: NewsItem[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function News({ items }: NewsProps) {
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">热点话题</h2>
        <p className="text-gray-600">最新的高考和专业选择资讯</p>
      </div>

      <div className="space-y-4">
        {items.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 hover:scale-102"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 hover:text-indigo-600 cursor-pointer transition">
                  {news.title}
                </h3>
              </div>
              <span className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full whitespace-nowrap">
                {news.category}
              </span>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{news.content}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatDate(news.created_at)}</span>
              <span>👁 {news.views} 次浏览</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition">
          查看更多资讯
        </button>
      </div>
    </section>
  );
}

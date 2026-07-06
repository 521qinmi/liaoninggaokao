interface Major {
  id: number;
  name: string;
  category: string;
  description: string;
  job_prospects: string;
  avg_salary: number;
}

export interface FeaturedProps {
  majors: Major[];
}

const jobProspectsColor = (prospect: string) => {
  switch (prospect) {
    case '优秀':
      return 'bg-green-100 text-green-800';
    case '良好':
      return 'bg-blue-100 text-blue-800';
    case '一般':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Featured({ majors }: FeaturedProps) {
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">推荐专业</h2>
        <p className="text-gray-600">为您精选热门且前景好的专业</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {majors.map((major) => (
          <div
            key={major.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-indigo-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{major.name}</h3>
                <p className="text-sm text-gray-500">{major.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${jobProspectsColor(major.job_prospects)}`}>
                {major.job_prospects}
              </span>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{major.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">平均薪资</span>
              <span className="text-lg font-bold text-indigo-600">¥{major.avg_salary}k/月</span>
            </div>

            <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              了解更多
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useState } from 'react';

export interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 mb-8">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">🎓</span>
            <span className="text-xl font-bold text-gray-800">高考志愿</span>
          </a>

          <div className="hidden md:flex gap-6">
            <a href="#majors" className="text-gray-700 hover:text-indigo-600 transition">
              专业查询
            </a>
            <a href="#universities" className="text-gray-700 hover:text-indigo-600 transition">
              高校查询
            </a>
            <a href="#news" className="text-gray-700 hover:text-indigo-600 transition">
              资讯中心
            </a>
            <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition">
              联系我们
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="hidden sm:block px-4 py-2 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
          >
            登录
          </button>
          <button
            onClick={onRegisterClick}
            className="hidden sm:block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            注册
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t px-6 py-4 space-y-2">
          <a href="#majors" className="block py-2 text-gray-700 hover:text-indigo-600">
            专业查询
          </a>
          <a href="#universities" className="block py-2 text-gray-700 hover:text-indigo-600">
            高校查询
          </a>
          <a href="#news" className="block py-2 text-gray-700 hover:text-indigo-600">
            资讯中心
          </a>
          <button
            onClick={onLoginClick}
            className="w-full py-2 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
          >
            登录
          </button>
          <button
            onClick={onRegisterClick}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            注册
          </button>
        </div>
      )}
    </header>
  );
}

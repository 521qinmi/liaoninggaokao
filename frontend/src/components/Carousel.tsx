import { useEffect, useState } from 'react';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  major_id: number;
}

export interface CarouselProps {
  items: CarouselItem[];
}

export default function Carousel({ items }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Loading carousel...</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const colors = ['from-blue-600', 'from-purple-600', 'from-pink-600'];
  const bgColor = colors[currentIndex % colors.length];

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg mb-12">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${bgColor} to-indigo-600`}
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><rect fill="%23ffffff" fill-opacity="0.1" width="1200" height="400"/></svg>')`,
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <h2 className="text-5xl font-bold mb-4">{currentItem.title}</h2>
          <p className="text-xl text-gray-100 max-w-2xl">{currentItem.description}</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-8' : 'bg-gray-300'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 p-2 rounded-full transition"
        aria-label="Previous slide"
      >
        ❮
      </button>

      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 p-2 rounded-full transition"
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import shopApi from '../../api/shopApi';

function SkeletonSlide() {
  return (
    <div className="animate-pulse">
      <div className="h-36 w-full rounded-xl bg-gray-200 dark:bg-slate-700 mb-3" />
      <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function ShopSpotlightWidget() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [current, setCurrent]   = useState(0);
  const [direction, setDirection] = useState('right'); // 'right' | 'left'
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    shopApi.getProducts()
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setProducts(items.slice(0, 5));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback((index, dir) => {
    if (animating || products.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 250);
  }, [animating, products.length]);

  const prev = () => goTo((current - 1 + products.length) % products.length, 'left');
  const next = () => goTo((current + 1) % products.length, 'right');

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(() => {
      goTo((current + 1) % products.length, 'right');
    }, 4000);
    return () => clearInterval(id);
  }, [products.length, current, goTo]);

  const product = products[current];

  const slideClass = animating
    ? direction === 'right'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  const price = product
    ? product.price ?? product.pointCost ?? null
    : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Shop Spotlight
        </h3>
        <Link
          to="/shop"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors"
        >
          Visit Shop →
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonSlide />
      ) : products.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-2">No products yet</p>
          <Link to="/shop" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <>
          {/* Slide */}
          <Link to="/shop" className="block group">
            <div
              className={`transition-all duration-250 ease-in-out ${slideClass}`}
            >
              {/* Product image */}
              <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-900/30">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-emerald-300 dark:text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                )}

                {/* Price badge overlay */}
                {price !== null && (
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                    Rs. {typeof price === 'number' ? price.toLocaleString() : price}
                  </span>
                )}
              </div>

              {/* Product name */}
              <p className="text-[13px] font-semibold text-gray-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {product.name}
              </p>
              {product.description && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  {product.description}
                </p>
              )}
            </div>
          </Link>

          {/* Controls */}
          {products.length > 1 && (
            <div className="flex items-center justify-between mt-3">
              {/* Prev */}
              <button
                onClick={prev}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 dark:border-slate-600 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <ChevronLeft />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > current ? 'right' : 'left')}
                    className={`rounded-full transition-all duration-200 ${
                      i === current
                        ? 'bg-emerald-500 w-4 h-1.5'
                        : 'bg-gray-200 dark:bg-slate-600 w-1.5 h-1.5 hover:bg-emerald-300'
                    }`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                onClick={next}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 dark:border-slate-600 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

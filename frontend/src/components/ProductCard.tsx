import { Wind, Droplets, Recycle, Leaf } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getScoreIcon = (score: number) => {
    if (score >= 80) return 'from-emerald-400 to-green-500';
    if (score >= 60) return 'from-amber-400 to-yellow-500';
    return 'from-red-400 to-rose-500';
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      <div className="h-44 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Leaf className="w-16 h-16 text-emerald-300 group-hover:text-emerald-400 transition-colors duration-300" />
        <div className="absolute top-3 right-3">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getScoreIcon(product.ecoScore)} flex items-center justify-center shadow-lg`}>
            <span className="text-white text-xs font-black">{product.ecoScore}</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
            {product.category}
          </span>
          <span className="text-lg font-black text-gray-900">${product.price}</span>
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1" title="Carbon Footprint">
            <Wind className="w-3.5 h-3.5 text-gray-400" />
            {product.carbonFootprint} kg
          </span>
          <span className="inline-flex items-center gap-1" title="Water Usage">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            {product.waterUsage} L
          </span>
          {product.recyclable && (
            <span className="inline-flex items-center gap-1 text-emerald-600" title="Recyclable">
              <Recycle className="w-3.5 h-3.5" />
              Recyclable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

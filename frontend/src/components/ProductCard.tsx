import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
      <div className="h-48 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-5xl">&#x1F33F;</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 leading-tight">
            {product.name}
          </h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreColor(product.ecoScore)}`}
          >
            {product.ecoScore}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium">
            {product.category}
          </span>
          <span className="text-gray-800 font-bold">${product.price}</span>
        </div>
        <div className="mt-3 flex gap-3 text-xs text-gray-400">
          <span title="Carbon Footprint">&#x1F4A8; {product.carbonFootprint} kg CO2</span>
          <span title="Water Usage">&#x1F4A7; {product.waterUsage} L</span>
          {product.recyclable && <span title="Recyclable">&#x267B;&#xFE0F; Recyclable</span>}
        </div>
      </div>
    </div>
  );
}

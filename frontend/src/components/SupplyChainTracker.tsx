import { useEffect, useState, useMemo, type ReactNode } from 'react';
import {
  Sprout, Factory, Truck, Store, UserCheck,
  ShieldCheck, AlertTriangle, Package, Hash,
  Calendar, ArrowDown, ChevronDown, Search,
} from 'lucide-react';
import api from '../services/api';
import type { Product, SupplyChainGraph, SupplyChainNode, SupplyChainEdge } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const STAGE_ORDER: Record<string, number> = {
  supplier: 0,
  manufacturer: 1,
  distributor: 2,
  retailer: 3,
  consumer: 4,
};

interface StageMeta {
  label: string;
  icon: ReactNode;
  gradient: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  desc: string;
}

const STAGE_META: Record<string, StageMeta> = {
  supplier: {
    label: 'Raw Material',
    icon: <Sprout className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    desc: 'Sourcing sustainable raw materials',
  },
  manufacturer: {
    label: 'Manufacturing',
    icon: <Factory className="w-6 h-6" />,
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    desc: 'Production & quality control',
  },
  distributor: {
    label: 'Distribution',
    icon: <Truck className="w-6 h-6" />,
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    desc: 'Logistics & transportation',
  },
  retailer: {
    label: 'Retail',
    icon: <Store className="w-6 h-6" />,
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    desc: 'Point of sale & display',
  },
  consumer: {
    label: 'Consumer',
    icon: <UserCheck className="w-6 h-6" />,
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    desc: 'End customer delivery',
  },
};

interface StageInfo {
  node: SupplyChainNode;
  edges: SupplyChainEdge[];
}

interface SupplyChainTrackerProps {
  products: Product[];
}

export default function SupplyChainTracker({ products }: SupplyChainTrackerProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [graph, setGraph] = useState<SupplyChainGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedProduct) {
      setGraph(null);
      return;
    }
    fetchGraph(selectedProduct);
  }, [selectedProduct]);

  const fetchGraph = async (productId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<SupplyChainGraph>(`/supply-chain/${productId}`);
      setGraph(res.data);
    } catch {
      setError('Failed to load supply chain data.');
    } finally {
      setLoading(false);
    }
  };

  const stages = useMemo((): StageInfo[] => {
    if (!graph) return [];
    const nodeMap = new Map<string, SupplyChainNode>();
    for (const n of graph.nodes) nodeMap.set(n.id, n);

    const stageMap = new Map<string, StageInfo>();

    for (const edge of graph.edges) {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);

      if (fromNode && !stageMap.has(fromNode.actorType)) {
        stageMap.set(fromNode.actorType, { node: fromNode, edges: [] });
      }
      if (toNode && !stageMap.has(toNode.actorType)) {
        stageMap.set(toNode.actorType, { node: toNode, edges: [] });
      }
      if (fromNode) {
        stageMap.get(fromNode.actorType)!.edges.push(edge);
      }
    }

    return Array.from(stageMap.values()).sort(
      (a, b) => (STAGE_ORDER[a.node.actorType] ?? 99) - (STAGE_ORDER[b.node.actorType] ?? 99)
    );
  }, [graph]);

  const hasData = graph && (stages.length > 0 || graph.nodes.length > 0);

  const defaultStages = useMemo(
    () =>
      Object.entries(STAGE_META).sort(
        (a, b) => (STAGE_ORDER[a[0]] ?? 99) - (STAGE_ORDER[b[0]] ?? 99)
      ),
    []
  );

  return (
    <div>
      {/* Product selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Search className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Track a product&apos;s journey
        </label>
        <div className="relative max-w-md">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none shadow-sm text-sm"
          >
            <option value="">-- Choose a product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading supply chain data..." />}
      {error && <ErrorMessage message={error} onRetry={() => fetchGraph(selectedProduct)} />}

      {/* Default / example timeline */}
      {!selectedProduct && !loading && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supply Chain Flow</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
          </div>

          <div className="relative ml-6 sm:ml-8">
            {/* Connecting line */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 via-purple-300 via-orange-300 to-teal-300" />

            {defaultStages.map(([key, meta], idx) => (
              <div
                key={key}
                className="relative flex items-start gap-5 mb-8 last:mb-0 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  {meta.icon}
                </div>
                <div className={`flex-1 ${meta.bgLight} rounded-xl p-4 border ${meta.borderColor}`}>
                  <h4 className={`font-bold text-sm ${meta.textColor}`}>{meta.label}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{meta.desc}</p>
                </div>
                {idx < defaultStages.length - 1 && (
                  <ArrowDown className="absolute left-[14px] -bottom-5 w-3.5 h-3.5 text-gray-300 z-10" />
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 italic">
            Select a product above to see its real supply chain data with blockchain verification
          </p>
        </div>
      )}

      {/* Real data timeline */}
      {selectedProduct && !loading && !error && hasData && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-200" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Live Tracking</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-200" />
          </div>

          <div className="relative ml-6 sm:ml-8">
            {/* Connecting line */}
            <div className="absolute left-6 top-7 bottom-7 w-0.5 bg-gradient-to-b from-emerald-400 to-teal-400" />

            {stages.map((stage, idx) => {
              const meta = STAGE_META[stage.node.actorType] || {
                label: stage.node.actorType,
                icon: <Package className="w-6 h-6" />,
                gradient: 'from-gray-500 to-gray-600',
                bgLight: 'bg-gray-50',
                textColor: 'text-gray-700',
                borderColor: 'border-gray-200',
                desc: '',
              };
              const verified = stage.edges.length > 0 && stage.edges.every((e) => e.isVerifiedOnChain);
              const hasSuspicious = stage.edges.some((e) => e.suspicious);

              return (
                <div
                  key={stage.node.id}
                  className="relative flex items-start gap-5 mb-10 last:mb-0 animate-slide-up"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Stage icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-lg ${verified ? 'animate-pulse-glow' : ''}`}>
                      {meta.icon}
                    </div>
                    {verified && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {hasSuspicious && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Stage content card */}
                  <div className={`flex-1 min-w-0 bg-white rounded-xl p-4 border ${meta.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className={`font-bold text-sm ${meta.textColor}`}>{meta.label}</h4>
                      {verified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          <ShieldCheck className="w-3 h-3" />
                          Blockchain Verified
                        </span>
                      )}
                      {hasSuspicious && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm font-medium">{stage.node.name}</p>

                    {stage.edges.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {stage.edges.map((edge) => (
                          <div
                            key={edge.movementId}
                            className={`text-xs ${meta.bgLight} rounded-lg px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 border ${meta.borderColor}`}
                          >
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                              <Package className="w-3 h-3" />
                              Qty: {edge.quantity}
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(edge.occurredAt).toLocaleDateString()}
                            </span>
                            {edge.blockchainTxHash && (
                              <span
                                className="inline-flex items-center gap-1 text-emerald-600 font-mono truncate max-w-[140px]"
                                title={edge.blockchainTxHash}
                              >
                                <Hash className="w-3 h-3 flex-shrink-0" />
                                {edge.blockchainTxHash.slice(0, 12)}...
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {idx < stages.length - 1 && (
                    <ArrowDown className="absolute left-[18px] -bottom-7 w-4 h-4 text-emerald-400 z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedProduct && !loading && !error && graph && !hasData && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No supply chain data found for this product.</p>
          <p className="text-gray-400 text-sm mt-1">Movements haven&apos;t been recorded yet.</p>
        </div>
      )}
    </div>
  );
}

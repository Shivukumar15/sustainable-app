import { useEffect, useState } from 'react';
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

const STAGE_META: Record<string, { label: string; icon: string; color: string }> = {
  supplier: { label: 'Raw Material', icon: '\u{1F331}', color: 'emerald' },
  manufacturer: { label: 'Manufacturing', icon: '\u{1F3ED}', color: 'blue' },
  distributor: { label: 'Distribution', icon: '\u{1F69A}', color: 'purple' },
  retailer: { label: 'Retail', icon: '\u{1F6D2}', color: 'orange' },
  consumer: { label: 'Consumer', icon: '\u{1F464}', color: 'teal' },
};

const colorClasses: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700', ring: 'ring-emerald-400' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', ring: 'ring-blue-400' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', ring: 'ring-purple-400' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', ring: 'ring-orange-400' },
  teal: { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700', ring: 'ring-teal-400' },
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

  const buildStages = (): StageInfo[] => {
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
  };

  const stages = buildStages();
  const hasData = graph && (stages.length > 0 || graph.nodes.length > 0);

  const defaultStages = Object.entries(STAGE_META).sort(
    (a, b) => (STAGE_ORDER[a[0]] ?? 99) - (STAGE_ORDER[b[0]] ?? 99)
  );

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a product to track its supply chain
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        >
          <option value="">-- Choose a product --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingSpinner message="Loading supply chain..." />}
      {error && <ErrorMessage message={error} onRetry={() => fetchGraph(selectedProduct)} />}

      {!selectedProduct && !loading && (
        <div className="mt-4">
          <p className="text-gray-500 text-sm mb-6">
            Below is a typical supply chain flow. Select a product to see its real data.
          </p>
          <div className="relative">
            {defaultStages.map(([key, meta], idx) => {
              const colors = colorClasses[meta.color];
              return (
                <div key={key} className="flex items-start gap-4 mb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center text-2xl shadow-sm`}
                    >
                      {meta.icon}
                    </div>
                    {idx < defaultStages.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300 my-1" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h4 className={`font-semibold ${colors.text}`}>{meta.label}</h4>
                    <p className="text-gray-400 text-sm capitalize">{key}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedProduct && !loading && !error && hasData && (
        <div className="relative">
          {stages.map((stage, idx) => {
            const meta = STAGE_META[stage.node.actorType] || {
              label: stage.node.actorType,
              icon: '\u{1F4E6}',
              color: 'emerald',
            };
            const colors = colorClasses[meta.color] || colorClasses.emerald;
            const verified = stage.edges.length > 0 && stage.edges.every((e) => e.isVerifiedOnChain);
            const hasSuspicious = stage.edges.some((e) => e.suspicious);

            return (
              <div key={stage.node.id} className="flex items-start gap-4 mb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center text-2xl shadow-md ${
                      verified ? `ring-2 ${colors.ring} ring-offset-2` : ''
                    }`}
                  >
                    {meta.icon}
                  </div>
                  {idx < stages.length - 1 && (
                    <div
                      className={`w-0.5 h-20 my-1 ${
                        hasSuspicious ? 'bg-red-300' : 'bg-emerald-300'
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-semibold text-lg ${colors.text}`}>{meta.label}</h4>
                    {verified && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                    {hasSuspicious && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Suspicious
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{stage.node.name}</p>
                  {stage.edges.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {stage.edges.map((edge) => (
                        <div
                          key={edge.movementId}
                          className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-1.5 inline-flex items-center gap-2 mr-2"
                        >
                          <span>Qty: {edge.quantity}</span>
                          <span className="text-gray-300">|</span>
                          <span>{new Date(edge.occurredAt).toLocaleDateString()}</span>
                          {edge.blockchainTxHash && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="text-emerald-600 truncate max-w-[120px]" title={edge.blockchainTxHash}>
                                Tx: {edge.blockchainTxHash.slice(0, 10)}...
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProduct && !loading && !error && graph && !hasData && (
        <div className="text-center py-8">
          <p className="text-gray-500">No supply chain data found for this product.</p>
        </div>
      )}
    </div>
  );
}

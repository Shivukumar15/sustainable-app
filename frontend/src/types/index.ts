export interface User {
  id: string;
  username: string;
  email: string;
  ecoScore: number;
  purchasedProducts: PurchasedProduct[];
}

export interface PurchasedProduct {
  productId: string;
  purchaseDate: string;
  quantity: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  ecoScore: number;
  imageUrl: string;
  price: number;
  carbonFootprint: number;
  waterUsage: number;
  recyclable: boolean;
  createdAt: string;
}

export interface SupplyChainNode {
  id: string;
  actorType: string;
  name: string;
}

export interface SupplyChainEdge {
  movementId: string;
  from: string;
  to: string;
  occurredAt: string;
  quantity: number;
  movementType: string;
  notes?: string;
  evidenceUrl?: string;
  movementHash: string;
  blockchainTxHash?: string;
  isVerifiedOnChain: boolean;
  anomalyScore: number;
  anomalyReasons: string[];
  anomalyFlagged: boolean;
  needsReview: boolean;
  suspicious: boolean;
}

export interface SupplyChainGraph {
  productId: string;
  nodes: SupplyChainNode[];
  edges: SupplyChainEdge[];
}

export interface Actor {
  _id: string;
  actorType: string;
  name: string;
  location?: string;
}

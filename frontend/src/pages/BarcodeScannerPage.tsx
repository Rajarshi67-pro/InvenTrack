import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Search, Package, AlertCircle } from 'lucide-react';

interface ProductInfo {
  name: string;
  sku: string;
  quantity: number;
  location: string;
  unitPrice: number;
}

const DEMO_PRODUCTS: Record<string, ProductInfo> = {
  'IND-VLV-500': {
    name: 'Industrial Valve XL-500',
    sku: 'IND-VLV-500',
    quantity: 342,
    location: 'Main Distribution Hub / Rack A3',
    unitPrice: 129.99,
  },
  'HYD-PMP-300': {
    name: 'Hydraulic Pump HP-300',
    sku: 'HYD-PMP-300',
    quantity: 18,
    location: 'East Wing Storage / Rack B1',
    unitPrice: 899.5,
  },
  'SAF-HLM-PRO': {
    name: 'Safety Helmet Pro',
    sku: 'SAF-HLM-PRO',
    quantity: 210,
    location: 'West Coast Depot / Rack C2',
    unitPrice: 34.99,
  },
};

type SearchResult = ProductInfo | 'not-found' | null;

export default function BarcodeScannerPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult>(null);

  const handleSearch = () => {
    const found = DEMO_PRODUCTS[query.toUpperCase().trim()];
    setResult(found ?? 'not-found');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="section-title">Barcode Scanner</h1>
        <p className="section-subtitle">Scan or enter a SKU / barcode to look up a product</p>
      </div>

      {/* Scanner UI */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 border-dashed flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mb-6">Enter SKU or barcode manually below</p>
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="e.g. IND-VLV-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn-primary" onClick={handleSearch}>
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-3">
          Try: IND-VLV-500 · HYD-PMP-300 · SAF-HLM-PRO
        </p>
      </div>

      {/* Result */}
      {result && result !== 'not-found' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-l-4 border-l-emerald-500"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">{result.name}</h3>
              <p className="text-gray-500 text-sm">SKU: {result.sku}</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-600">Stock</p>
                  <p className="text-xl font-bold text-white">{result.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Unit Price</p>
                  <p className="text-xl font-bold text-emerald-400">₹{result.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm font-semibold text-white">{result.location}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {result === 'not-found' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 border-l-4 border-l-red-500 flex items-center gap-4"
        >
          <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white">Product not found</p>
            <p className="text-gray-500 text-sm">No product matched barcode &quot;{query}&quot;</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

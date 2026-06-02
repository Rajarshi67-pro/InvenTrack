import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TrendingUp, Brain, AlertTriangle, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { forecastingApi, productsApi } from '../api';


const MODELS = ['MOVING_AVERAGE', 'LINEAR_REGRESSION', 'ARIMA'] as const;
const PERIODS = [3, 6, 9, 12] as const;

export default function ForecastingPage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [periods, setPeriods] = useState<number>(6);
  const [model, setModel] = useState<string>('MOVING_AVERAGE');
  const [forecast, setForecast] = useState<any>(null);

  const { data: oracle } = useQuery({ queryKey: ['oracle-analytics'], queryFn: forecastingApi.getOracleAnalytics });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll({ limit: 200 }) });

  const forecastMut = useMutation({
    mutationFn: () => forecastingApi.forecast(selectedProduct, periods, model),
    onSuccess: (d) => { setForecast(d); toast.success('Forecast generated'); },
    onError: () => toast.error('Forecast failed'),
  });

  const productList: any[] = products?.data || [];
  const selectedProductObj = productList.find(p => p.id === selectedProduct);

  const chartData = forecast?.predictions?.map((p: any) => ({
    label: p.label,
    predicted: p.predictedDemand,
    upper: p.upperBound,
    lower: p.lowerBound,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Demand Forecasting</h1>
          <p className="page-subtitle">Powered by Oracle Analytics · XGBoost · Prophet · ARIMA</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-950/30 border border-blue-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />AI Powered
        </span>
      </div>

      {/* Oracle Analytics Summary */}
      {oracle && (
        <motion.div className="bg-card border-l-4 border-l-blue-500 border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-foreground">Oracle Analytics Cloud Insights</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Prediction Score', value: oracle.predictionScore, color: 'text-emerald-400', icon: CheckCircle },
                { label: 'Shortage Risks', value: `${oracle.shortageRisks} products`, color: 'text-amber-400', icon: AlertTriangle },
                { label: 'Reorder Suggestions', value: `${oracle.reorderRecommendations} items`, color: 'text-blue-400', icon: TrendingUp },
                { label: 'Optimization Gain', value: oracle.optimizationGain, color: 'text-emerald-400', icon: CheckCircle },
              ].map(m => (
                <div key={m.label} className="bg-muted/40 rounded-2xl p-4 text-center border border-border">
                  <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
                  <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-muted-foreground font-semibold mt-1">{m.label}</div>
                </div>
              ))}
            </div>
            {oracle.riskAlerts?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" />Risk Alerts</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {oracle.riskAlerts.map((a: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${a.risk === 'HIGH' ? 'bg-red-950/20 border-red-800' : 'bg-amber-950/20 border-amber-800'}`}>
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${a.risk === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground truncate">{a.product}</p>
                        <p className="text-xs text-muted-foreground">{a.daysToStockout} days to stockout</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Forecast Tool */}
      <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Demand Forecast Generator</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select a product and configure forecast parameters</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Product</label>
            <div className="relative">
              <select value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setForecast(null); }} className="w-full px-3 py-3 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                <option value="">Select a product to forecast…</option>
                {productList.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.quantity} in stock</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {selectedProductObj && (
            <div className="flex flex-wrap gap-4">
              {/* Periods */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Forecast Periods</label>
                <div className="flex gap-2">
                  {PERIODS.map(p => (
                    <button key={p} type="button" onClick={() => setPeriods(p)} className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${periods === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {p}M
                    </button>
                  ))}
                </div>
              </div>
              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Forecast Model</label>
                <div className="flex gap-2 flex-wrap">
                  {MODELS.map(m => (
                    <button key={m} type="button" onClick={() => setModel(m)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${model === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button onClick={() => forecastMut.mutate()} disabled={!selectedProduct || forecastMut.isPending} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 shadow-lg shadow-primary/20">
            {forecastMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Generate Forecast
          </button>
        </div>
      </motion.div>

      {/* Forecast Results */}
      <AnimatePresence>
        {forecast && (
          <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Recommended Reorder Qty', value: forecast.reorderSuggestion, unit: 'units', color: 'from-blue-600 to-blue-700', icon: TrendingUp },
                { label: 'Safety Stock Required', value: forecast.safetyStock, unit: 'units', color: 'from-amber-600 to-amber-700', icon: AlertTriangle },
                { label: 'Model Accuracy', value: `${forecast.accuracy?.toFixed(1)}%`, color: 'from-emerald-600 to-emerald-700', icon: CheckCircle },
              ].map(c => (
                <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white`}>
                  <c.icon className="w-6 h-6 mb-3 opacity-80" />
                  <div className="text-3xl font-black">{c.value}<span className="text-sm font-normal ml-1 opacity-80">{c.unit}</span></div>
                  <div className="text-xs font-semibold mt-1 opacity-80">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Forecast Chart */}
            <div className="bg-card border border-border rounded-2xl">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-bold text-foreground">{forecast.productName} — {periods}-Month Forecast ({forecast.model?.replace('_', ' ')})</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area dataKey="upper" name="Upper Bound" fill="url(#forecastGrad)" stroke="none" />
                    <Area dataKey="lower" name="Lower Bound" fill="white" stroke="none" />
                    <Line type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
                    {selectedProductObj?.quantity && (
                      <ReferenceLine y={selectedProductObj.quantity} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Current Stock', fill: '#ef4444', fontSize: 11 }} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Monthly Forecast Details</h3></div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Period</th><th>Predicted Demand</th><th>Lower Bound</th><th>Upper Bound</th><th>vs. Reorder</th></tr></thead>
                  <tbody>
                    {forecast.predictions?.map((p: any) => (
                      <tr key={p.period} className={p.predictedDemand > forecast.reorderSuggestion ? 'bg-amber-500/5' : ''}>
                        <td className="font-semibold text-foreground">{p.label}</td>
                        <td className="font-bold text-primary text-base">{p.predictedDemand}</td>
                        <td className="text-muted-foreground">{p.lowerBound}</td>
                        <td className="text-muted-foreground">{p.upperBound}</td>
                        <td>
                          {p.predictedDemand > forecast.reorderSuggestion ?
                            <span className="badge-low text-xs">High Demand</span> :
                            <span className="badge-normal text-xs">Normal</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { aiApi } from '../../utils/api';
import Badge from '../ui/Badge';

export default function SafetyAlert({ vehicleId }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!vehicleId) return;
    aiApi.post('/api/ai/safety', { vehicleId })
      .then(({ data }) => setAnalysis(data))
      .catch(() => {});
  }, [vehicleId]);

  if (!analysis || analysis.riskLevel === 'low') return null;

  const variant = analysis.riskLevel === 'high' ? 'danger' : 'warning';

  return (
    <div className={`glass-card p-4 border-l-4 ${analysis.riskLevel === 'high' ? 'border-brand-red' : 'border-yellow-400'}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className={analysis.riskLevel === 'high' ? 'text-brand-red' : 'text-yellow-400'} size={18} />
        <Badge variant={variant}>Safety: {analysis.riskLevel}</Badge>
      </div>
      <p className="text-sm text-gray-300">{analysis.recommendation}</p>
      {analysis.flags?.length > 0 && (
        <div className="flex gap-2 mt-2">
          {analysis.flags.map((f) => (
            <Badge key={f} variant="danger">{f.replace(/_/g, ' ')}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

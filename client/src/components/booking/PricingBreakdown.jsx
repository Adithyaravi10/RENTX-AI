import { formatPrice } from '../../utils/pricing';
import { isPeakHour, isFestivalDay } from '../../utils/pricing';

export default function PricingBreakdown({ vehicle, hours, surgeMultiplier = 1 }) {
  const basePrice = vehicle ? vehicle.pricePerHour * hours : 0;
  const total = basePrice * surgeMultiplier;

  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="font-syne font-bold text-white">Pricing Breakdown</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Base rate ({hours}h × {formatPrice(vehicle?.pricePerHour || 0)})</span>
          <span className="text-white">{formatPrice(basePrice)}</span>
        </div>
        {surgeMultiplier > 1 && (
          <div className="flex justify-between text-yellow-400">
            <span>Surge ({surgeMultiplier}x) {isPeakHour() && '⚡ Peak'}{isFestivalDay() && ' 🎉'}</span>
            <span>+{formatPrice(basePrice * (surgeMultiplier - 1))}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-2 flex justify-between font-syne font-bold text-lg">
          <span className="text-white">Total</span>
          <span className="text-brand-cyan">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

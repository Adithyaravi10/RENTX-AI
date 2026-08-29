const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingHeatmap({ data }) {
  const maxCount = Math.max(...(data?.map((d) => d.count) || [1]), 1);

  const getCell = (day, hour) => data?.find((d) => d.day === day && d.hour === hour)?.count || 0;

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: '40px repeat(24, 1fr)' }}>
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-xs text-gray-500 text-center w-6">{h}</div>
        ))}
        {DAYS.map((day) => (
          <div key={day} className="contents">
            <div className="text-xs text-gray-400 flex items-center">{day}</div>
            {Array.from({ length: 24 }, (_, hour) => {
              const count = getCell(day, hour);
              const intensity = count / maxCount;
              return (
                <div
                  key={`${day}-${hour}`}
                  title={`${day} ${hour}:00 - ${count} bookings`}
                  className="w-6 h-6 rounded-sm"
                  style={{
                    background: `rgba(0, 212, 255, ${intensity * 0.9 + 0.05})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

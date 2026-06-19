import { useState } from 'react'

export default function SpendingHeatmap({ currencySymbol = '₹' }) {
  const [hoveredDay, setHoveredDay] = useState(null)

  // Generate mock days for April, May, June 2026
  const generateMonthDays = (monthIndex, numDays, startOffset) => {
    const days = []
    // Add offset padding
    for (let i = 0; i < startOffset; i++) {
      days.push({ isPadding: true })
    }
    
    const monthNames = ['April', 'May', 'June']
    
    for (let d = 1; d <= numDays; d++) {
      // Determine random-ish spending amount for visual intensity
      let amount = 0
      let intensity = 0 // 0 to 4
      
      const seed = (d * (monthIndex + 1) * 17) % 100
      if (seed > 85) {
        amount = 4500 + (seed * 15)
        intensity = 4 // dark green
      } else if (seed > 60) {
        amount = 2500 + (seed * 10)
        intensity = 3 // medium green
      } else if (seed > 35) {
        amount = 1200 + (seed * 8)
        intensity = 2 // light-medium green
      } else if (seed > 15) {
        amount = 300 + (seed * 5)
        intensity = 1 // light green
      } else {
        amount = 0
        intensity = 0 // empty/very light
      }

      // Hardcode May 15, 2026 to match the exact tooltip in the picture
      if (monthIndex === 1 && d === 15) {
        amount = 5200
        intensity = 4
      }

      days.push({
        isPadding: false,
        dayNum: d,
        dateString: `${monthNames[monthIndex]} ${d}, 2026`,
        amount,
        intensity
      })
    }
    return days
  }

  // 2026: April starts on Wednesday (offset 3), May on Friday (offset 5), June on Monday (offset 1)
  const months = [
    { name: 'April', days: generateMonthDays(0, 30, 3) },
    { name: 'May', days: generateMonthDays(1, 31, 5) },
    { name: 'June', days: generateMonthDays(2, 30, 1) }
  ]

  const intensityColors = [
    'bg-[#1e293b]/20 hover:bg-[#1e293b]/40', // 0
    'bg-emerald-500/20 hover:bg-emerald-500/30', // 1
    'bg-emerald-500/40 hover:bg-emerald-500/50', // 2
    'bg-emerald-500/70 hover:bg-emerald-500/85', // 3
    'bg-emerald-500 hover:bg-emerald-400' // 4
  ]

  return (
    <div className="relative p-4 rounded-xl border border-white/5 bg-surface-900/30 flex flex-col items-center">
      {/* Tooltip Overlay */}
      {hoveredDay && (
        <div 
          className="absolute z-30 bg-[#121829] border border-white/10 rounded-xl p-3 text-[10px] text-white shadow-xl pointer-events-none font-mono"
          style={{
            top: `${hoveredDay.y - 75}px`,
            left: `${hoveredDay.x - 60}px`
          }}
        >
          <p className="font-bold border-b border-white/5 pb-1 mb-1">{hoveredDay.date}</p>
          <p className="text-surface-300">Total Spending: {currencySymbol}{hoveredDay.amount.toLocaleString()}</p>
          {hoveredDay.intensity >= 3 && <p className="text-emerald-400 font-semibold mt-0.5">High Spending Day</p>}
        </div>
      )}

      <div className="flex gap-4">
        {/* Y Axis Label */}
        <div className="flex items-center justify-center text-[11px] font-bold text-surface-500 select-none uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 border-r border-white/5 pr-3 mr-1">
          2026
        </div>

        {/* 3 Calendar Columns */}
        <div className="flex gap-6 flex-wrap justify-center">
          {months.map((m, mi) => (
            <div key={m.name} className="w-[110px]">
              <div className="text-center text-[10px] font-bold text-surface-400 mb-2.5 select-none uppercase tracking-wider">{m.name}</div>
              <div className="grid grid-cols-7 gap-1">
                {m.days.map((day, di) => {
                  if (day.isPadding) {
                    return <div key={`pad-${di}`} className="w-3.5 h-3.5" />
                  }
                  return (
                    <div
                      key={di}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const containerRect = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect()
                        setHoveredDay({
                          date: day.dateString,
                          amount: day.amount,
                          intensity: day.intensity,
                          x: rect.left - containerRect.left + rect.width / 2,
                          y: rect.top - containerRect.top
                        })
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-all duration-150 ${intensityColors[day.intensity]}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intensity Legend */}
      <div className="w-full flex items-center justify-between mt-5 pt-3 border-t border-white/5 text-[9px] text-surface-400 font-dm-sans">
        <span>Intensity: Low</span>
        <div className="flex gap-1 items-center">
          {intensityColors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c.split(' ')[0]}`} />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  )
}

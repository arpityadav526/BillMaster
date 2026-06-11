import { useMemo } from 'react'


const INTENSITY = ['rgba(255,255,255,0.03)', '#065f46', '#059669', '#10b981', '#34d399']

function getIntensity(amount, max) {
  if (!amount || amount === 0) return 0
  const ratio = amount / max
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 0.75) return 3
  return 4
}

export default function SpendingHeatmap({ data = [], currencySymbol = '$' }) {
  const { maxAmount, weeks } = useMemo(() => {
    const map = {}
    let max = 0
    data.forEach(d => { map[d._id] = d.total; if (d.total > max) max = d.total })

    const today = new Date()
    const cells = []
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      cells.push({ date: key, amount: map[key] || 0, day: d.getDay() })
    }
    // Group into weeks
    const wks = []
    let currentWeek = []
    cells.forEach((c, idx) => {
      currentWeek.push(c)
      if (c.day === 6 || idx === cells.length - 1) {
        wks.push(currentWeek)
        currentWeek = []
      }
    })
    return { grid: cells, maxAmount: max, weeks: wks }
  }, [data])

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1 pt-0">
          {dayLabels.map((d, i) => (
            <div key={i} className="h-3 w-3 flex items-center justify-center text-[8px] text-surface-700">{i % 2 === 1 ? d : ''}</div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {/* Pad first week */}
              {wi === 0 && Array(week[0]?.day || 0).fill(null).map((_, pi) => (
                <div key={`pad-${pi}`} className="w-3 h-3 rounded-sm" />
              ))}
              {week.map((cell, ci) => (
                <div
                  key={cell.date}
                  className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-150 animate-scale-in opacity-0"
                  style={{ 
                    background: INTENSITY[getIntensity(cell.amount, maxAmount)],
                    animationDelay: `${(wi * 7 + ci) * 10}ms`,
                    animationFillMode: 'forwards'
                  }}
                  title={`${cell.date}: ${currencySymbol}${cell.amount.toFixed(0)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-surface-700">Less</span>
        {INTENSITY.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[10px] text-surface-700">More</span>
      </div>
    </div>
  )
}

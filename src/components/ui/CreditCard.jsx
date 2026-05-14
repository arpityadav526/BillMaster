import { useState } from 'react'

/**
 * Interactive 3D flip credit/debit card component.
 * Props: cardNumber, holderName, expiryDate, cvv, cardType ('visa' | 'mastercard')
 * Flips on hover to reveal CVV.
 */
export default function CreditCard({
  cardNumber = '•••• •••• •••• ••••',
  holderName = 'YOUR NAME',
  expiryDate = 'MM/YY',
  cvv = '•••',
  cardType = 'visa',
  isFlipped = false,
}) {
  const [hovered, setHovered] = useState(false)
  const showBack = isFlipped || hovered

  // Format card number into groups of 4
  const formatNumber = (num) => {
    const clean = num.replace(/\s/g, '')
    if (clean.length === 0) return '•••• •••• •••• ••••'
    return clean.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim()
  }

  return (
    <div
      className="credit-card-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`credit-card-inner ${showBack ? 'credit-card-flipped' : ''}`}>
        {/* ═══ FRONT ═══ */}
        <div className="credit-card-face credit-card-front">
          {/* Background pattern */}
          <div className="credit-card-bg-pattern" />

          {/* Card type label */}
          <p className="credit-card-type-label">
            {cardType === 'mastercard' ? 'MASTERCARD' : 'VISA'}
          </p>

          {/* Card network logo */}
          {cardType === 'mastercard' ? (
            <svg className="credit-card-logo" xmlns="http://www.w3.org/2000/svg" width={36} height={36} viewBox="0 0 48 48">
              <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z" />
              <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z" />
              <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z" />
            </svg>
          ) : (
            <svg className="credit-card-logo" xmlns="http://www.w3.org/2000/svg" width={50} height={16} viewBox="0 0 1000 324">
              <path fill="#1a1f71" d="M116.6 0L0 324h79.5l23-60.2h133.9l13.4 60.2h69.7L236.3 0h-119.7zm29.7 84.6L186 209.8h-90.9l51.2-125.2z"/>
              <path fill="#1a1f71" d="M379.5 0L299 324h74L453.5 0h-74zM603.5 0L480 324h74l28-72.5h113.9L709 324h69.7L695 0H603.5zm29.7 84.6l39.7 125.2h-90.9l51.2-125.2z"/>
              <path fill="#f7a600" d="M833 108c0 57-47 103-104 103h70l18.7-48.5h59.5L890 211h69.7L900 0H822l11 108z"/>
            </svg>
          )}

          {/* Chip */}
          <svg className="credit-card-chip" version="1.1" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 50 50">
            <image width={50} height={50} x={0} y={0} href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB6VBMVEUAAACNcTiVeUKVeUOYfEaafEeUeUSYfEWZfEaykleyklaXe0SWekSZZjOYfEWYe0WXfUWXe0WcgEicfkiXe0SVekSXekSWekKYe0a9nF67m12ZfUWUeEaXfESVekOdgEmVeUWWekSniU+VeUKVeUOrjFKYfEWliE6WeESZe0GSe0WYfES7ml2Xe0WXeESUeEOWfEWcf0eWfESXe0SXfEWYekSVeUKXfEWxklawkVaZfEWWekOUekOWekSYfESZe0eXekWYfEWZe0WZe0eVeUSWeETAnmDCoWLJpmbxy4P1zoXwyoLIpWbjvXjivnjgu3bfu3beunWvkFWxkle/nmDivXiWekTnwXvkwHrCoWOuj1SXe0TEo2TDo2PlwHratnKZfEbQrWvPrWuafUfbt3PJp2agg0v0zYX0zYSfgkvKp2frxX7mwHrlv3rsxn/yzIPgvHfduXWXe0XuyIDzzISsjVO1lVm0lFitjVPzzIPqxX7duna0lVncuHTLqGjvyIHeuXXxyYGZfUayk1iyk1e2lln1zYTEomO2llrbtnOafkjFpGSbfkfZtXLhvHfkv3nqxH3mwXujhU3KqWizlFilh06khk2fgkqsjlPHpWXJp2erjVOhg0yWe0SliE+XekShhEvAn2D///+gx8TWAAAARnRSTlMACVCTtsRl7Pv7+vxkBab7pZv5+ZlL/UnU/f3SJCVe+Fx39naA9/75XSMh0/3SSkia+pil/KRj7Pr662JPkrbP7OLQ0JFOijI1MwAAAAFiS0dEorDd34wAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IDx2lsiuJAAACLElEQVRIx2NgGAXkAUYmZhZWPICFmYkRVQcbOwenmzse4MbFzc6DpIGXj8PD04sA8PbhF+CFaxEU8iWkAQT8hEVgOkTF/InR4eUVICYO1SIhCRMLDAoKDvFDVhUaEhwUFAjjSUlDdMiEhcOEItzdI6OiYxA6YqODIt3dI2DcuDBZsBY5eVTr4xMSYcyk5BRUOXkFsBZFJTQnp6alQxgZmVloUkrKYC0qqmji2WE5EEZuWB6alKoKdi35YQUQRkFYPpFaCouKIYzi6EDitJSUlsGY5RWVRGjJLyxNy4ZxqtIqqvOxaVELQwZFZdkIJVU1RSiSalAt6rUwUBdWG1CP6pT6gNqwOrgCdQyHNYR5YQFhDXj8MiK1IAeyN6aORiyBjByVTc0FqBoKWpqwRCVSgilOaY2OaUPw29qjOzqLvTAchpos47u6EZyYnngUSRwpuTe6D+6qaFQdOPNLRzOM1dzhRZyW+CZouHk3dWLXglFcFIflQhj9YWjJGlZcaKAVSvjyPrRQ0oQVKDAQHlYFYUwIm4gqExGmBSkutaVQJeomwViTJqPK6OhCy2Q9sQBk8cY0DxjTJw0lAQWK6cOKfgNhpKK7ZMpUeF3jPa28BCETK6mHqJKM+X1gxvWXpoUjVIVPnwErw71nmpgiqiQGBjNzbgs3j1nus+fMndc+Cwm0T52/oNR9lsdCS24ra7Tq1cbWjpXV3sHRCb1idXZ0sGdltXNxRateRwHRAACYHutzk/2I5QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMi0xM1QwODoxNToyOSswMDowMEUnN7UAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDItMTNUMDg6MTU6MjkrMDA6MDA0eo8JAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAyLTEzVDA4OjE1OjI5KzAwOjAwY2+u1gAAAABJRU5ErkJggg==" />
          </svg>

          {/* Contactless icon */}
          <svg className="credit-card-contactless" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 50 50">
            <image width={50} height={50} x={0} y={0} href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQflGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/FfPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xNGQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49itVoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkJkHpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15zbkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6gDJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJqSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKBsSctBRAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD71Amz Z+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uXXSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUicUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaInKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBKxDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDItMTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1NiswMDowMIXeN6gAAAAASUVORK5CYII=" />
          </svg>

          {/* Card number */}
          <p className="credit-card-number">{formatNumber(cardNumber)}</p>

          {/* Valid thru */}
          <p className="credit-card-valid-label">VALID THRU</p>
          <p className="credit-card-expiry">
            {expiryDate && expiryDate !== 'MM/YY'
              ? expiryDate.replace('/', ' / ')
              : 'MM / YY'}
          </p>

          {/* Cardholder name */}
          <p className="credit-card-name">
            {holderName.toUpperCase() || 'YOUR NAME'}
          </p>
        </div>

        {/* ═══ BACK ═══ */}
        <div className="credit-card-face credit-card-back">
          <div className="credit-card-strip" />
          <div className="credit-card-mag-strip" />
          <div className="credit-card-sig-strip">
            <p className="credit-card-cvv">{cvv || '•••'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

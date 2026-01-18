import { useState, useEffect } from 'react'

export default function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex gap-4 items-center p-4 rounded-lg my-4 bg-surface">
      <div className="text-4xl font-semibold text-neutral-900">
        {formatTime(time)}
      </div>
      <div className="text-sm text-neutral-500 font-normal mt-1">
        {formatDate(time)}
      </div>
    </div>
  )
}
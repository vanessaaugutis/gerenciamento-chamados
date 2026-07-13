interface MessageProps {
  text: string
  type?: 'info' | 'error'
}

export default function Message({ text, type = 'info' }: MessageProps) {
  if (!text) return null

  const color = type === 'error' ? '#ef4444' : '#2563eb'

  return <p style={{ color, margin: '4px 0 0' }}>{text}</p>
}

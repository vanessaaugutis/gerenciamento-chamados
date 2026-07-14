interface MessageProps {
  text: string
  type?: 'info' | 'error'
}

export default function Message({ text, type = 'info' }: MessageProps) {
  if (!text) return null

  return <p className={`form-message form-message--${type}`}>{text}</p>
}

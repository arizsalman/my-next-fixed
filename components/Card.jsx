export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

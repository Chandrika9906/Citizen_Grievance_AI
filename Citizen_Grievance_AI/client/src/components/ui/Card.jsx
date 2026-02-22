export default function Card({ children, className = '' }) {
  return (
    <div className={`glass rounded-lg shadow-md p-4 ${className}`}>
      {children}
    </div>
  );
}

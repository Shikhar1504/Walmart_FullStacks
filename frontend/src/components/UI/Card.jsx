import { clsx } from "clsx"

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx("card", className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx("mb-4", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={clsx("text-lg font-semibold text-gray-900", className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={clsx("text-sm text-gray-600 mt-1", className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx(className)} {...props}>
      {children}
    </div>
  )
}

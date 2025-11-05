import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ children, value, onValueChange, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const selectRef = React.useRef(null)

  return (
    <div className="relative" ref__={selectRef}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { open, setOpen, value })
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { open, setOpen, onValueChange, selectRef })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, open, setOpen, value, ...props }, ref) => (
  <button
    type="button"
    ref__={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => setOpen(!open)}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ className, children, open, setOpen, onValueChange, selectRef, ...props }) => {
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen, selectRef])

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child =>
        React.cloneElement(child, { onValueChange, setOpen })
      )}
    </div>
  )
}

const SelectItem = ({ className, children, value, onValueChange, setOpen, ...props }) => (
  <div
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className
    )}
    onClick={() => {
      onValueChange(value)
      setOpen(false)
    }}
    {...props}
  >
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

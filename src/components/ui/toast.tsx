import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] flex max-h-screen w-full max-w-[420px] flex-col p-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-xl border p-4 pr-8 shadow-2xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border-border/50 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm text-foreground shadow-lg border",
        success: "border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 text-emerald-900 dark:text-emerald-100 backdrop-blur-sm",
        destructive: "border-red-500/20 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 text-red-900 dark:text-red-100 backdrop-blur-sm",
        warning: "border-amber-500/20 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 text-amber-900 dark:text-amber-100 backdrop-blur-sm",
        info: "border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 text-blue-900 dark:text-blue-100 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ToastIcon = ({ variant }: { variant?: "default" | "success" | "destructive" | "warning" | "info" }) => {
  const iconProps = { className: "h-5 w-5 shrink-0" }
  
  switch (variant) {
    case "success":
      return <CheckCircle2 {...iconProps} className={cn(iconProps.className, "text-emerald-600")} />
    case "destructive":
      return <AlertCircle {...iconProps} className={cn(iconProps.className, "text-red-600")} />
    case "warning":
      return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-amber-600")} />
    case "info":
      return <Info {...iconProps} className={cn(iconProps.className, "text-blue-600")} />
    default:
      return <div className="h-5 w-5 rounded-full bg-gradient-to-r from-primary to-primary/60" />
  }
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      icon?: React.ReactNode
    }
>(({ className, variant, icon, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start space-x-3 w-full">
        <ToastIcon variant={variant} />
        <div className="flex-1 space-y-1">
          {children}
        </div>
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80 px-3 text-sm font-medium transition-all hover:bg-accent/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm",
      "group-[.destructive]:border-red-300 group-[.destructive]:hover:border-red-400 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400",
      "group-[.success]:border-emerald-300 group-[.success]:hover:border-emerald-400 group-[.success]:hover:bg-emerald-500 group-[.success]:hover:text-emerald-50 group-[.success]:focus:ring-emerald-400",
      "group-[.warning]:border-amber-300 group-[.warning]:hover:border-amber-400 group-[.warning]:hover:bg-amber-500 group-[.warning]:hover:text-amber-50 group-[.warning]:focus:ring-amber-400",
      "group-[.info]:border-blue-300 group-[.info]:hover:border-blue-400 group-[.info]:hover:bg-blue-500 group-[.info]:hover:text-blue-50 group-[.info]:focus:ring-blue-400",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-lg p-1 text-foreground/50 opacity-0 transition-all hover:scale-110 hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/50 group-hover:opacity-100 backdrop-blur-sm",
      "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400",
      "group-[.success]:text-emerald-300 group-[.success]:hover:text-emerald-50 group-[.success]:focus:ring-emerald-400",
      "group-[.warning]:text-amber-300 group-[.warning]:hover:text-amber-50 group-[.warning]:focus:ring-amber-400",
      "group-[.info]:text-blue-300 group-[.info]:hover:text-blue-50 group-[.info]:focus:ring-blue-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
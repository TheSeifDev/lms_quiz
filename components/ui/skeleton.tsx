import * as React from "react"

const Skeleton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`animate-pulse rounded-md bg-gray-200 ${className || ''}`}
            {...props}
        />
    )
})
Skeleton.displayName = "Skeleton"

// Preset skeleton components for common use cases
export function CardSkeleton() {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center p-3 space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded" />
                </div>
            ))}
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    );
}

export { Skeleton }

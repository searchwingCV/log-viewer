import React, { useEffect } from 'react'

type CheckboxType = {
  indeterminate: boolean
  className?: string
}

export const SelectCheckbox = React.forwardRef<HTMLInputElement, CheckboxType>(
  ({ indeterminate, className, ...rest }, ref) => {
    const defaultRef = React.useRef<HTMLInputElement | null>(null)
    const resolvedRef: any = ref || defaultRef

    useEffect(() => {
      if (resolvedRef?.current) {
        resolvedRef.current.indeterminate = indeterminate ?? false
      }
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} className={className} />
      </>
    )
  },
)

SelectCheckbox.displayName = 'SelectCheckbox'

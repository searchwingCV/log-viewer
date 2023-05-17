/*
    Diclosure or Accordion Element on the base of the library headless UI,
    used for the list of timeseries
*/
import { Disclosure as HeadlessDisclosure } from '@headlessui/react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const DisclosurePanel = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <HeadlessDisclosure.Panel
      className={clsx(
        `justify-between,
         className
         flex
         w-full
        `,
        className,
      )}
    >
      {children}
    </HeadlessDisclosure.Panel>
  )
}

type DisclosureProps = {
  buttonContent: React.ReactNode
  children: React.ReactNode
  isSpecialButton?: boolean //for marking a more accentuated accordion level
}

export const Disclosure = ({ children, buttonContent, isSpecialButton }: DisclosureProps) => {
  return (
    <HeadlessDisclosure defaultOpen>
      {({ open: disclosureOpen }) => (
        <>
          <HeadlessDisclosure.Button
            className={clsx(
              `my-1
               flex
               w-full
               justify-between
               rounded-md
               bg-white
               bg-opacity-[10%]
               px-4 
               text-left
               text-sm
               text-white`,
              isSpecialButton
                ? `bg-opacity-[30%]
                   py-2`
                : ` pb-0.25 
                    bg-opacity-[10%]
                    pt-1`,
            )}
          >
            {buttonContent}

            <div className="mt-1">
              {disclosureOpen ? (
                <FontAwesomeIcon icon={'chevron-up'} />
              ) : (
                <FontAwesomeIcon icon={'chevron-down'} />
              )}
            </div>
          </HeadlessDisclosure.Button>

          {children}
        </>
      )}
    </HeadlessDisclosure>
  )
}

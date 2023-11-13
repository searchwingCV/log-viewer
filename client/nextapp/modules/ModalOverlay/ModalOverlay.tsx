import { Fragment } from 'react'
import clsx from 'clsx'
import { Dialog, Transition } from '@headlessui/react'
import Button from '@modules/Button'

type ModalProps = {
  children?: React.ReactNode
  modalTitle: string
  isOpen: boolean
  closeModal: () => void
  proceedAction?: () => void
  linkProps?: {
    link: string
    linkText: string
  }
  hideCancelButton?: boolean
}
export function ModalOverlay({
  proceedAction,
  modalTitle,
  isOpen,
  closeModal,
  children,
  linkProps,
  hideCancelButton,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div
          className={`fixed
                      inset-0
                      overflow-y-auto`}
        >
          <div
            className={`flex
                        min-h-full
                        items-center
                        justify-center
                        p-4
                        text-center`}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full
                            max-w-[600px]
                            transform
                            overflow-hidden
                            rounded-2xl
                            bg-white
                            p-6
                            text-left
                            align-middle
                            shadow-xl
                            transition-all`}
              >
                <Dialog.Title
                  as="h3"
                  className={`mb-4
                              text-lg
                              font-medium
                              leading-6
                              text-gray-900`}
                >
                  {modalTitle}
                </Dialog.Title>
                <div className="mt-2">{children}</div>

                <div
                  className={clsx(
                    'mt-8 grid h-12 w-full justify-around gap-x-2 px-4',
                    linkProps ? 'grid-cols-3' : 'grid-cols-2',
                  )}
                >
                  {linkProps ? (
                    <Button buttonStyle="Main" href={linkProps.link} isSpecial>
                      <span className="flex h-full w-full items-center justify-center">
                        {linkProps.linkText}
                      </span>
                    </Button>
                  ) : null}
                  {proceedAction ? (
                    <Button
                      buttonStyle="Secondary"
                      className="h-full w-full"
                      onClick={() => {
                        proceedAction()
                        closeModal()
                      }}
                    >
                      Proceed with action
                    </Button>
                  ) : null}
                  {hideCancelButton ? null : (
                    <Button buttonStyle="Tertiary" className="w-full" onClick={closeModal}>
                      Cancel and go back
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

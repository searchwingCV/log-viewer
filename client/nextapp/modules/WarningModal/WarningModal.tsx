import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

type ModalProps = {
  children?: React.ReactNode
  modalTitle: string
  isOpen: boolean
  closeModal: () => void
  proceedAction?: () => void
}
export function WarningModal({
  proceedAction,
  modalTitle,
  isOpen,
  closeModal,
  children,
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
                            max-w-md
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
                  className={`text-lg
                              font-medium
                              leading-6
                              text-gray-900`}
                >
                  {modalTitle}
                </Dialog.Title>
                <div className="mt-2">{children}</div>

                <div className="mt-4 flex justify-around gap-x-2 px-4">
                  {proceedAction ? (
                    <button
                      type="button"
                      className={`inline-flex
                                  justify-center
                                  rounded-md
                                  border
                                  border-transparent
                                  bg-primary-light-petrol
                                  px-4
                                  py-2
                                  text-sm
                                  font-medium
                                  text-white
                                  hover:bg-secondary-dark-petrol
                                  focus:outline-none
                                  focus-visible:ring-2
                                  focus-visible:ring-offset-2`}
                      onClick={() => {
                        proceedAction()
                        closeModal()
                      }}
                    >
                      Proceed with action
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className={`inline-flex
                                justify-center
                                rounded-md
                                border
                                border-transparent
                                bg-primary-red
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-white
                                hover:bg-secondary-dark-red
                                focus:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-offset-2`}
                    onClick={closeModal}
                  >
                    Cancel and go back
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

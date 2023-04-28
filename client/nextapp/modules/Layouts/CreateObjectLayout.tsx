import { ReactNode } from 'react'
import Button from '~/modules/Button'
import { useRouter } from 'next/router'

export type Props = { children: ReactNode }

export const CreateObjectLayout = ({ children }: Props) => {
  const router = useRouter()
  const { model } = router.query

  return (
    <div
      className={`flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  pb-16
                `}
    >
      <div
        className={`max-w-[600px]
                    pt-16`}
      >
        <Button
          className="pb-12"
          buttonStyle="Link"
          onClick={async () => await router.push(`/${model}-overview`)}
        >
          Back To Table Overview
        </Button>
        <h1
          className={`mb-12
                      text-4xl
                      font-bold`}
        >{`Add new ${model}`}</h1>

        {children}
      </div>
    </div>
  )
}

import { type ReactNode } from 'react'
import { useRouter } from 'next/router'
import Button from '~/modules/Button'

export type CreateObjectLayoutProps = { children: ReactNode }

export const CreateObjectLayout = ({ children }: CreateObjectLayoutProps) => {
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
          onClick={async () => await router.push(`/${model}s`)}
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

import React, { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import CircleIconButton from '~/modules/CircleIconButton'
import { useRouter } from 'next/router'

type TablePaginationProps = {
  pageSize: number
  pageCount: number
  pageIndex: number
  pageOptions: number[]
  totalNumber: number
}

export const Pagination = ({
  pageSize,
  pageCount,
  pageIndex,
  pageOptions,
  totalNumber,
}: TablePaginationProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { page: queryPage, pagesize: queryPageSize } = router.query

  useEffect(() => {
    if (!router.asPath.includes('page') && !router.asPath.includes('pagesize')) {
      router.push({ query: { page: 1, pagesize: '10' } }, undefined, {
        shallow: true,
      })
    }
  }, [queryPageSize, queryPage])

  return (
    <div
      className={`pagination
                  absolute
                  bottom-6`}
    >
      <span className="">
        <CircleIconButton
          disabled={parseInt(queryPage as string) === 1}
          onClick={() => {
            router.push({ query: { page: 1, pagesize: queryPageSize } }, undefined, {
              shallow: true,
            })
          }}
          iconClassName={'angle-double-left'}
          addClasses={`w-8
                       h-8
                       mr-2`}
        />
        <CircleIconButton
          disabled={parseInt(queryPage as string) === 1}
          onClick={() => {
            router.push(
              { query: { page: parseInt(queryPage as string) - 1, pagesize: queryPageSize } },
              undefined,
              {
                shallow: true,
              },
            )
          }}
          iconClassName={'angle-left'}
          addClasses={`w-8
                       h-8
                       mr-2`}
        ></CircleIconButton>
        <CircleIconButton
          disabled={parseInt(queryPage as string) === pageCount}
          iconClassName={'angle-right'}
          onClick={() => {
            router.push(
              { query: { page: parseInt(queryPage as string) + 1, pagesize: queryPageSize } },
              undefined,
              {
                shallow: true,
              },
            )
          }}
          addClasses={`w-8
                       h-8
                       ml`}
        ></CircleIconButton>
        <CircleIconButton
          onClick={() => {
            router.push({ query: { page: pageCount - 1, pagesize: queryPageSize } }, undefined, {
              shallow: true,
            })
          }}
          iconClassName={'angle-double-right'}
          disabled={parseInt(queryPage as string) === pageCount}
          addClasses={`w-8
                       h-8
                       ml-2`}
        />
      </span>
      <span className="ml-4">
        {t('Page')}
        <span className="mx-2">
          {pageIndex + 1} of {pageOptions.length}
        </span>
      </span>
      <span>
        <span className="mr-2">{`| ${t('Go to page')}:   `}</span>
        <input
          max={pageCount}
          type="number"
          className={`mr-4
                      rounded-md
                      border-0
                      py-2
                      px-4
                      shadow-subtle`}
          defaultValue={queryPage}
          value={queryPage}
          onChange={(e) => {
            router.push(
              { query: { page: Number(e.target.value), pagesize: queryPageSize } },
              undefined,
              {
                shallow: true,
              },
            )
          }}
          style={{ width: '100px' }}
        />
      </span>
      <select
        defaultValue={parseInt(queryPageSize as string)}
        className={`rounded-md
                    border-0
                    bg-primary-white
                    py-[11px]
                    px-6
                    shadow-subtle`}
        onChange={(e) => {
          const isSelectionPossible =
            parseInt(queryPageSize as string) * parseInt(queryPage as string) < totalNumber

          router.push(
            { query: { page: isSelectionPossible ? queryPage : 1, pagesize: e.target.value } },
            undefined,
            {
              shallow: true,
            },
          )
        }}
      >
        {[5, 10, 15, 20].map((pageSize) => (
          <option
            key={pageSize}
            value={pageSize}
            selected={parseInt(queryPageSize as string) === pageSize}
            disabled={totalNumber / pageSize < 1}
          >
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  )
}

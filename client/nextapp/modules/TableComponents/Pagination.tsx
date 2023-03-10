import { useTranslation } from 'next-i18next'
import CircleIconButton from '~/modules/CircleIconButton'

type TablePaginationProps = {
  gotoPage: (updater: number | ((pageIndex: number) => number)) => void
  previousPage: () => void
  nextPage: () => void
  canPreviousPage: boolean
  pageSize: number
  canNextPage: boolean
  pageCount: number
  pageIndex: number
  pageOptions: number[]
  setPageSize: (pageSize: number) => void
}

export const Pagination = ({
  gotoPage,
  previousPage,
  canPreviousPage,
  pageSize,
  nextPage,
  canNextPage,
  pageCount,
  pageIndex,
  pageOptions,
  setPageSize,
}: TablePaginationProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={`pagination
                  absolute
                  bottom-20`}
    >
      <span className="">
        <CircleIconButton
          disabled={!canPreviousPage}
          onClick={() => gotoPage(0)}
          iconClassName={'angle-double-left'}
          addClasses={`w-8
                       h-8
                       mr-2`}
        />
        <CircleIconButton
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          iconClassName={'angle-left'}
          addClasses={`w-8
                       h-8
                       mr-2`}
        ></CircleIconButton>
        <CircleIconButton
          iconClassName={'angle-right'}
          onClick={() => nextPage()}
          disabled={!canNextPage}
          addClasses={`w-8
                       h-8
                       ml`}
        ></CircleIconButton>
        <CircleIconButton
          onClick={() => gotoPage(pageCount - 1)}
          iconClassName={'angle-double-right'}
          disabled={!canNextPage}
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
          type="number"
          className={`mr-4
                      rounded-md
                      border-0
                      py-2
                      px-4
                      shadow-subtle`}
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            gotoPage(page)
          }}
          style={{ width: '100px' }}
        />
      </span>
      <select
        value={pageSize}
        className={`rounded-md
                    border-0
                    bg-primary-white
                    py-[11px]
                    px-6
                    shadow-subtle`}
        onChange={(e) => {
          setPageSize(Number(e.target.value))
        }}
      >
        {[5, 10, 15, 20].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
      <pre></pre>
    </div>
  )
}

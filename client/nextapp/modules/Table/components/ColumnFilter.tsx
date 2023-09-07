/*  

  So far this component is not actively used

*/
export const ColumnFilter = ({ column: { filterValue, preFilteredRows, setFilter } }: any) => {
  const count = preFilteredRows.length

  return (
    <input
      className="py mt-2 w-[80%] bg-primary-white px-2 text-xs font-normal text-primary-black"
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

type ColumnType =
    | 'number'
    | 'text'
    | 'textInputLong'
    | 'textInputSmall'
    | 'selectInput'
    | 'date'
    | 'dateInput'
    | 'numberInput'

export const determineWidth = (columnType: ColumnType) => {
    switch (columnType) {
        case 'number':
            return 'w-[80px]'
        case 'text':
            return 'w-[100px]'
        case 'date':
            return 'w-[130px]'
        case 'dateInput':
            return 'w-[200px]'
        case 'textInputLong':
            return 'w-[250px]'
        case 'textInputSmall':
            return 'w-[200px]'
        case 'numberInput':
            return 'w-[100px]'
        case 'selectInput':
            return 'w-[200px]'
        default:
            return 'w-[150px]'
    }
}
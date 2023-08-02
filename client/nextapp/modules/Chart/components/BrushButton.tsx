import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const getButtonIcon = (fixedTimeInterval: FixedTimeIntervals) => {
  switch (fixedTimeInterval) {
    case FixedTimeIntervals.First30:
      return 'hourglass-start'
    case FixedTimeIntervals.Middle30:
      return 'hourglass-half'
    case FixedTimeIntervals.Last30:
      return 'hourglass-end'
    case FixedTimeIntervals.Reset:
      return 'undo'
    default:
      return 'undo'
  }
}

enum FixedTimeIntervals {
  First30 = 'First 30s',
  Middle30 = 'Middle 30s',
  Last30 = 'Last 30s',
  Reset = 'Reset',
}

type BrushButtonProps = {
  active: boolean
  fixedTimeInterval: FixedTimeIntervals
  onClick: () => void
}

export const BrushButton = ({ active, fixedTimeInterval, onClick }: BrushButtonProps) => {
  return (
    <button
      className={clsx(
        `z-10
          mr-3
          flex
          h-6
          items-center
          justify-center
          rounded-md
          bg-x-pink-to-blue-low-opacity
          text-[10px]
          text-white
          hover:opacity-60
          disabled:cursor-not-allowed
          disabled:opacity-60`,
        active &&
          fixedTimeInterval !== FixedTimeIntervals.Reset &&
          `outline
           outline-2
           outline-offset-2
           outline-black`,

        fixedTimeInterval === FixedTimeIntervals.Reset ? 'w-8' : 'w-20',
      )}
      disabled={active}
      onClick={onClick}
    >
      <span>
        <FontAwesomeIcon icon={getButtonIcon(fixedTimeInterval)} width={16} height={16} />
      </span>

      {fixedTimeInterval !== FixedTimeIntervals.Reset ? (
        <span
          className={`text-center
                      text-[10px]`}
        >{`${fixedTimeInterval}`}</span>
      ) : null}
    </button>
  )
}

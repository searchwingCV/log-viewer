import Link from 'next/link'

/**
 * Turns an href like produkte/orthesen into
 * something like /produkte/orthesen
 */
export const makeAbsoluteUrl = (url: string): string => {
  if (typeof url !== 'string') {
    console.error(`${url} is not a string but typeof ${typeof url}`)
    return ''
  }
  if (url.startsWith('/')) {
    return url
  }
  return `/${url}`
}

/**
 * Utility function that checks if a string used as href
 * attribute should result in us rendering a next/link or a
 * normal <a></a> component. This is, because next/link doesn't
 * work for off-site navigation
 *
 * @param {string} url - Url to test
 * @returns boolean
 */
export const isExternalUrl = (url: string) => {
  if (!url) return false
  // https://regex101.com/r/MsgMo0/1
  const regex = /^(https?:\/\/(www\.)?|mailto:|tel:)/g
  return regex.test(url.toString())
}

type LinkWrapperProps = {
  children: React.ReactNode
  href: string
  className?: string
  title?: string
}

export const LinkWrapper = ({ children, href, className, title, ...props }: LinkWrapperProps) => {
  if (isExternalUrl(href)) {
    return (
      <a href={href} title={title} {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <Link href={makeAbsoluteUrl(href)} title={title} {...props}>
      <a href={href} title={title} className={className}>
        {children}
      </a>
    </Link>
  )
}

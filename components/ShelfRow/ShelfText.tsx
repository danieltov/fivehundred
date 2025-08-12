/* eslint-disable jsx-a11y/anchor-is-valid */
import { Heading, Link } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { ReactNode } from 'react'

interface ShelfTextProps {
  text: ReactNode
  path: string
  bgColor: string
  fontSize: string | string[]
  isEven: boolean
  isMobile: boolean
}

export const ShelfText = ({ text, path, bgColor, fontSize, isEven, isMobile }: ShelfTextProps) => (
  <NextLink href={`${path}?bg=${bgColor.replace('#', '')}`} as={path}>
    <Link>
      <Heading
        padding={3}
        fontSize={fontSize}
        textAlign={isEven ? 'right' : 'left'}
        fontWeight='normal'
        _hover={
          !isMobile
            ? {
                fontWeight: 800,
                transition: 'font-weight 0.5s',
              }
            : {}
        }
      >
        {text}
      </Heading>
    </Link>
  </NextLink>
)

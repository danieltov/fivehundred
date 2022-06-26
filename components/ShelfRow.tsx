/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Heading, Link } from '@chakra-ui/layout'
import gsap from 'gsap'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useRef } from 'react'
import { colorsA, colorsB } from '../lib/constants'

/**
 * Utils
 */
const getStripeHeight = (count: number) => {
  switch (true) {
    case count === 5:
      return `calc(24vh)`
    default:
      return 'calc(100vh / 6.25)'
  }
}
const toPX = (value: string) =>
  typeof window !== 'undefined' &&
  (parseFloat(value) / 100) * (/vh/gi.test(value) ? window.innerHeight : window.innerWidth)

/**
 * Types
 */
type Props = {
  text: ReactNode
  count: number
  itemIndex: number
  path: string
}

/**
 *
 * Component
 *
 */

const ShelfRow = ({ text, count, itemIndex, path }: Props) => {
  const wrapper = useRef<HTMLDivElement | undefined>()
  const q = gsap.utils.selector(wrapper)
  const router = useRouter()
  const isHome = router.route === '/'
  const isEven = !(itemIndex % 2)
  const fontSize = isHome ? '6xl' : ['xl', '2xl', '3xl', '4xl']
  const bgColors = isEven ? colorsA : colorsB

  useEffect(() => {
    const boxWidth = toPX('100vw')
    const totalWidth = boxWidth * 3
    const duration = 60
    const boxes = q('.box')
    const xValue = `${isEven ? '+' : '-'}=${totalWidth}`
    const mod = gsap.utils.wrap(0, totalWidth)

    gsap.set(boxes, {
      x: (i) => i * boxWidth,
    })

    const tl = gsap.timeline({ repeat: -1 })

    tl.to(boxes, {
      x: xValue,
      modifiers: { x: (x) => `${mod(parseFloat(x))}px` },
      duration,
      ease: 'none',
    })
  }, [count, isEven, itemIndex, q])

  return (
    <Box
      key={itemIndex}
      className="wrapper"
      ref={wrapper}
      position="relative"
      width="250%"
      height={getStripeHeight(count)}
      overflow="hidden"
      left="-100%"
    >
      <Box
        className="box"
        width="100vw"
        position="absolute"
        key={0}
        height="100%"
        bg={bgColors[itemIndex % bgColors.length]}
      >
        <NextLink href={`${path}?bg=${bgColors[itemIndex % bgColors.length].replace('#', '')}`} as={path}>
          <Link>
            <Heading padding={3} fontSize={fontSize} textAlign={isEven ? 'right' : 'left'}>
              {text}
            </Heading>
          </Link>
        </NextLink>
      </Box>
      <Box
        className="box"
        width="100vw"
        position="absolute"
        key={1}
        height="100%"
        bg={bgColors[(itemIndex + 1) % bgColors.length]}
      >
        <NextLink href={`${path}?bg=${bgColors[(itemIndex + 1) % bgColors.length].replace('#', '')}`} as={path}>
          <Link>
            <Heading padding={3} fontSize={fontSize} textAlign={isEven ? 'right' : 'left'}>
              {text}
            </Heading>
          </Link>
        </NextLink>
      </Box>
      <Box
        className="box"
        width="100vw"
        position="absolute"
        key={2}
        height="100%"
        bg={bgColors[(itemIndex + 2) % bgColors.length]}
      >
        <NextLink href={`${path}?bg=${bgColors[(itemIndex + 2) % bgColors.length].replace('#', '')}`} as={path}>
          <Link>
            <Heading padding={3} fontSize={fontSize} textAlign={isEven ? 'right' : 'left'}>
              {text}
            </Heading>
          </Link>
        </NextLink>
      </Box>
    </Box>
  )
}

export default ShelfRow

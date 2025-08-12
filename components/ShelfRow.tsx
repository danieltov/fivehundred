/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box } from '@chakra-ui/layout'
import { useMediaQuery } from '@chakra-ui/react'
import gsap from 'gsap'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useMemo, useRef } from 'react'

import { colorsA, colorsB } from '../lib/constants'
import { ShelfBox } from './ShelfRow/'

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
  cover: string
  disableAnimation: boolean
  type: 'album' | 'detail' | 'home'
  ranking?: number
}

/**
 * Main ShelfRow Component
 */
const ShelfRow = ({
  text,
  count,
  itemIndex,
  path,
  cover,
  disableAnimation = true,
  type,
  ranking,
}: Props) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)', {
    ssr: true,
    fallback: true,
  })
  const wrapper = useRef<HTMLDivElement | undefined>()
  const router = useRouter()

  // Memoize computed values
  const computedValues = useMemo(
    () => ({
      isHome: router.route === '/',
      isEven: !(itemIndex % 2),
      bgColors: !(itemIndex % 2) ? colorsA : colorsB,
    }),
    [router.route, itemIndex]
  )

  const { isHome, isEven, bgColors } = computedValues
  const fontSize = isHome ? '6xl' : ['xl', '2xl', '3xl', '4xl']

  // Memoize box colors
  const boxColors = useMemo(
    () => [
      bgColors[itemIndex % bgColors.length],
      bgColors[(itemIndex + 1) % bgColors.length],
      bgColors[(itemIndex + 2) % bgColors.length],
    ],
    [bgColors, itemIndex]
  )

  // Animation effect
  useEffect(() => {
    if (disableAnimation) return

    const boxWidth = toPX('100vw')
    const totalWidth = boxWidth * 3
    const duration = 60
    const q = gsap.utils.selector(wrapper)
    const boxes = q('.box')
    const xValue = `${isEven ? '+' : '-'}=${totalWidth}`
    const mod = gsap.utils.wrap(0, totalWidth)

    gsap.set(boxes, {
      x: (i) => i * boxWidth,
    })

    const tl = gsap.timeline({ repeat: 3 })
    tl.to(boxes, {
      x: xValue,
      modifiers: { x: (x) => `${mod(parseFloat(x))}px` },
      duration,
      ease: 'none',
    })

    return () => {
      tl.kill()
    }
  }, [count, isEven, disableAnimation, itemIndex])

  const leftValue = useMemo(() => {
    if (isMobile && disableAnimation) return '0'
    if (disableAnimation) return '-7.5px'
    return '-100%'
  }, [isMobile, disableAnimation])

  const commonBoxProps = {
    isEven,
    ranking,
    cover,
    path,
    count,
    itemIndex,
    type,
    text,
    fontSize,
    isMobile,
  }

  return (
    <Box
      className='wrapper'
      ref={disableAnimation ? null : wrapper}
      position='relative'
      width='250%'
      height={getStripeHeight(count)}
      overflow='hidden'
      left={leftValue}
    >
      {boxColors.map((bgColor, index) => (
        <ShelfBox key={index} {...commonBoxProps} bgColor={bgColor} />
      ))}
    </Box>
  )
}

export default ShelfRow

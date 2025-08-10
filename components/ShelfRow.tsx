/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Flex, Heading, Link } from '@chakra-ui/layout'
import { useMediaQuery } from '@chakra-ui/react'
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
  cover: string
  disableAnimation: boolean
}

/**
 *
 * Component
 *
 */

const ShelfRow = ({ text, count, itemIndex, path, cover, disableAnimation }: Props) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)', {
    ssr: true,
    fallback: true,
  })
  const wrapper = useRef<HTMLDivElement | undefined>()
  const router = useRouter()
  const isHome = router.route === '/'
  const isEven = !(itemIndex % 2)
  const fontSize = isHome ? '6xl' : ['xl', '2xl', '3xl', '4xl']
  const bgColors = isEven ? colorsA : colorsB

  useEffect(() => {
    const boxWidth = toPX('100vw')
    const totalWidth = boxWidth * 3
    const duration = 60
    const q = gsap.utils.selector(wrapper)
    const boxes = q('.box')
    const xValue = `${isEven ? '+' : '-'}=${totalWidth}`
    const mod = gsap.utils.wrap(0, totalWidth)

    if (!disableAnimation)
      gsap.set(boxes, {
        x: (i) => i * boxWidth,
      })

    const tl = !disableAnimation && gsap.timeline({ repeat: 3 })

    if (!disableAnimation)
      tl.to(boxes, {
        x: xValue,
        modifiers: { x: (x) => `${mod(parseFloat(x))}px` },
        duration,
        ease: 'none',
      })
  }, [count, isEven, disableAnimation, itemIndex])

  const leftValue = () => {
    if (isMobile && disableAnimation) return '0'
    if (disableAnimation) return '-7.5px'
    return '-100%'
  }

  // Utility to compute contrasting color (black or white)
  const getContrastColor = (hex: string) => {
    // Remove '#' if present
    const sanitizedHex = hex.replace('#', '')
    // Parse r, g, b
    const r = parseInt(sanitizedHex.substring(0, 2), 16)
    const g = parseInt(sanitizedHex.substring(2, 4), 16)
    const b = parseInt(sanitizedHex.substring(4, 6), 16)
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#111' : '#fff'
  }

  return (
    <Box
      className='wrapper'
      ref={disableAnimation ? null : wrapper}
      position='relative'
      width='250%'
      height={getStripeHeight(count)}
      overflow='hidden'
      left={leftValue()}
    >
      <Flex
        justifyContent='space-between'
        flexDirection={isEven ? 'row' : 'row-reverse'}
        className='box'
        width='100vw'
        position='absolute'
        height='100%'
        bg={bgColors[itemIndex % bgColors.length]}
      >
        {cover && (
          <NextLink href={path}>
            <Link>
              <Box
                minWidth={getStripeHeight(count)}
                height='100%'
                bgImg={`url(${cover})`}
                bgSize='cover'
              />
            </Link>
          </NextLink>
        )}
        <NextLink
          href={`${path}?bg=${bgColors[itemIndex % bgColors.length].replace('#', '')}`}
          as={path}
        >
          <Link>
            <Heading
              padding={3}
              fontSize={fontSize}
              textAlign={isEven ? 'right' : 'left'}
              fontWeight='normal'
              _hover={!isMobile ? {
                color: getContrastColor(bgColors[itemIndex % bgColors.length]),
                fontWeight: 800,
                transition: 'font-weight 0.5s'
              } : {}}
            >
              {text}
            </Heading>
          </Link>
        </NextLink>
      </Flex>
      <Flex
        justifyContent='space-between'
        flexDirection={isEven ? 'row' : 'row-reverse'}
        className='box'
        width='100vw'
        position='absolute'
        height='100%'
        bg={bgColors[(itemIndex + 1) % bgColors.length]}
      >
        {cover && (
          <NextLink href={path}>
            <Link>
              <Box
                minWidth={getStripeHeight(count)}
                height='100%'
                bgImg={`url(${cover})`}
                bgSize='cover'
              />
            </Link>
          </NextLink>
        )}
        <NextLink
          href={`${path}?bg=${bgColors[(itemIndex + 1) % bgColors.length].replace('#', '')}`}
          as={path}
        >
          <Link>
            <Heading
              padding={3}
              fontSize={fontSize}
              textAlign={isEven ? 'right' : 'left'}
              fontWeight='normal'
              _hover={!isMobile ? {
                color: getContrastColor(bgColors[(itemIndex + 1) % bgColors.length]),
                fontWeight: 800,
                transition: 'font-weight 0.5s'
              } : {}}
            >
              {text}
            </Heading>
          </Link>
        </NextLink>
      </Flex>
      <Flex
        justifyContent='space-between'
        flexDirection={isEven ? 'row' : 'row-reverse'}
        className='box'
        width='100vw'
        position='absolute'
        height='100%'
        bg={bgColors[(itemIndex + 2) % bgColors.length]}
      >
        {cover && (
          <NextLink href={path}>
            <Link>
              <Box
                minWidth={getStripeHeight(count)}
                height='100%'
                bgImg={`url(${cover})`}
                bgSize='cover'
              />
            </Link>
          </NextLink>
        )}
        <NextLink
          href={`${path}?bg=${bgColors[(itemIndex + 2) % bgColors.length].replace('#', '')}`}
          as={path}
        >
          <Link>
            <Heading
              padding={3}
              fontSize={fontSize}
              textAlign={isEven ? 'right' : 'left'}
              fontWeight='normal'
              _hover={!isMobile ? {
                color: getContrastColor(bgColors[(itemIndex + 2) % bgColors.length]),
                fontWeight: 800,
                transition: 'font-weight 0.5s'
              } : {}}
            >
              {text}
            </Heading>
          </Link>
        </NextLink>
      </Flex>
    </Box>
  )
}

export default ShelfRow

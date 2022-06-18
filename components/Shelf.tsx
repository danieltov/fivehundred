/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Heading, Link } from '@chakra-ui/layout'
import NextLink from 'next/link'
import React from 'react'
import Slider from 'react-slick'
import { Album, Detail } from '../@types/ui'
import { colorsA, colorsB } from '../lib/constants'

type Props =
  | { type: 'album'; items?: Album[] }
  | { type: 'detail'; items?: Detail[] }
  | {
      type: 'home'
      items: {
        text: string
        path: string
      }[]
    }

const getStripeHeight = (count: number) => (count < 8 ? `calc(100vh/${count - 0.75})` : `calc(100vh/6.5)`)

export const Shelf = React.memo(({ items, type }: Props) => {
  const isAlbum = type === 'album'
  const isDetail = type === 'detail'
  const isHome = type === 'home'
  return (
    <Box
      sx={{
        '& .slick-slide div': {
          marginY: '-7px',
          marginX: '-1px',
        },
      }}
    >
      {items.map((item, i) => {
        const isEven = !(i % 2)
        const bgColors = isEven ? colorsA : colorsB
        return (
          <Slider
            key={`slider-${item.id || item.text}`}
            arrows={false}
            autoplay
            dots={false}
            draggable={false}
            infinite
            initialSlide={i % 3}
            rtl={isEven}
            slidesToScroll={1}
            slidesToShow={1}
            speed={15000}
            autoplaySpeed={500}
            cssEase="linear"
            pauseOnFocus={false}
            pauseOnHover={false}
          >
            <Box key={0} height={getStripeHeight(items.length)} m={0} bg={bgColors[0]}>
              <NextLink href={`${item.path}?bg=${bgColors[0].replace('#', '')}`} as={item.path}>
                <Link>
                  <Heading
                    padding={3}
                    fontSize={isHome ? '6xl' : ['xl', '2xl', '3xl', '4xl']}
                    textAlign={isEven ? 'right' : 'left'}
                  >
                    {isAlbum &&
                      `${item.artist[0]?.name}: ${
                        item.title.length > 36 ? `${item.title.slice(0, 36)}...` : item.title
                      }`}
                    {isDetail && `${item.name}`}
                    {isHome && `${item.text}`}
                  </Heading>
                </Link>
              </NextLink>
            </Box>
            <Box key={0} height={getStripeHeight(items.length)} m={0} bg={bgColors[1]}>
              <NextLink href={`${item.path}?bg=${bgColors[1].replace('#', '')}`} as={item.path}>
                <Link>
                  <Heading
                    padding={3}
                    fontSize={isHome ? '6xl' : ['xl', '2xl', '3xl', '4xl']}
                    textAlign={isEven ? 'right' : 'left'}
                  >
                    {isAlbum &&
                      `${item.artist[0]?.name}: ${
                        item.title.length > 36 ? `${item.title.slice(0, 36)}...` : item.title
                      }`}
                    {isDetail && `${item.name}`}
                    {isHome && `${item.text}`}
                  </Heading>
                </Link>
              </NextLink>
            </Box>
            <Box key={0} height={getStripeHeight(items.length)} m={0} bg={bgColors[2]}>
              <NextLink href={`${item.path}?bg=${bgColors[2].replace('#', '')}`} as={item.path}>
                <Link>
                  <Heading
                    padding={3}
                    fontSize={isHome ? '6xl' : ['xl', '2xl', '3xl', '4xl']}
                    textAlign={isEven ? 'right' : 'left'}
                  >
                    {isAlbum &&
                      `${item.artist[0]?.name}: ${
                        item.title.length > 36 ? `${item.title.slice(0, 36)}...` : item.title
                      }`}
                    {isDetail && `${item.name}`}
                    {isHome && `${item.text}`}
                  </Heading>
                </Link>
              </NextLink>
            </Box>
          </Slider>
        )
      })}
    </Box>
  )
})

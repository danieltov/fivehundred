import { Flex } from '@chakra-ui/layout'
import { ReactNode } from 'react'

import { AlbumCover } from './AlbumCover'
import { ShelfText } from './ShelfText'

interface ShelfBoxProps {
  isEven: boolean
  bgColor: string
  ranking?: number
  cover: string
  path: string
  count: number
  itemIndex: number
  type: 'album' | 'detail' | 'home'
  text: ReactNode
  fontSize: string | string[]
  isMobile: boolean
}

export const ShelfBox = ({
  isEven,
  bgColor,
  ranking,
  cover,
  path,
  count,
  itemIndex,
  type,
  text,
  fontSize,
  isMobile,
}: ShelfBoxProps) => (
  <Flex
    justifyContent='space-between'
    flexDirection={isEven ? 'row' : 'row-reverse'}
    className='box'
    width='100vw'
    position='absolute'
    height='100%'
    bg={bgColor}
  >
    <AlbumCover
      cover={cover}
      path={path}
      count={count}
      itemIndex={itemIndex}
      type={type}
      ranking={ranking}
      isEven={isEven}
    />
    <ShelfText
      text={text}
      path={path}
      bgColor={bgColor}
      fontSize={fontSize}
      isEven={isEven}
      isMobile={isMobile}
    />
  </Flex>
)

/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box } from '@chakra-ui/layout'
import React from 'react'
import { Album, Detail, HomeItem } from '../@types/ui'
import Intro from './Intro'
import ShelfRow from './ShelfRow'

type Props =
  | { type: 'album'; items?: Album[] }
  | { type: 'detail'; items?: Detail[] }
  | { type: 'home'; items: HomeItem[] }

export const Shelf = React.memo(({ items, type }: Props) => {
  const isAlbum = type === 'album'
  const isDetail = type === 'detail'
  const isHome = type === 'home'
  return (
    <>
      <Intro />
      <Box>
        {items.map((item, i) => {
          const RowText = (
            <>
              {isAlbum &&
                `${item.artist[0]?.name}: ${item.title.length > 36 ? `${item.title.slice(0, 36)}...` : item.title}`}
              {isDetail && `${item.name}`}
              {isHome && `${item.text}`}
            </>
          )
          return <ShelfRow key={item.path} text={RowText} count={items.length} itemIndex={i} path={item.path} />
        })}
      </Box>
    </>
  )
})

import { Grid, GridItem, Heading } from '@chakra-ui/layout'
import { Tag } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import { Album } from '../@types/ui'
import { colorsAll } from '../lib/constants'
import { isLight } from '../lib/utils'
import { Art } from './Art'

type Props = {
  album: Album
}

export const AlbumSummary = ({ album }: Props) => {
  const router = useRouter()
  const scheme = colorsAll.filter((color) => !color.includes(router.query.bg as string))
  return (
    <>
      <Heading
        fontSize={['3.5rem', null, '7rem', '10rem']}
        fontWeight={200}
        textTransform="uppercase"
        textAlign="center"
      >{`${album.artist[0].name}: ${album.title}`}</Heading>
      <Grid h="500px" px={10} m={5} templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
        <GridItem rowSpan={3} colSpan="auto">
          <Art coverArt={album.coverArt} />
        </GridItem>
        <GridItem colSpan={4} ml="7.5%">
          <Heading>Genres</Heading>
          {album.genres.map((genre, i) => {
            const bg = scheme[i % scheme.length]
            return (
              <Tag
                size="lg"
                key={genre.name}
                marginX={5}
                marginY={2.5}
                borderRadius="full"
                bg={bg}
                color={isLight(bg) ? 'black' : 'white'}
              >
                {genre.name}
              </Tag>
            )
          })}
        </GridItem>
        <GridItem colSpan={4} ml="7.5%">
          <Heading>Vibes</Heading>
          {album.descriptors.map((descriptor, i) => {
            const bg = scheme[i % scheme.length]
            return (
              <Tag
                size="lg"
                key={descriptor.name}
                marginX={5}
                marginY={2.5}
                borderRadius="full"
                bg={bg}
                color={isLight(bg) ? 'black' : 'white'}
              >
                {descriptor.name}
              </Tag>
            )
          })}
        </GridItem>
      </Grid>
    </>
  )
}

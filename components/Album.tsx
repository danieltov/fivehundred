/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Grid, GridItem, Heading, Link, Text } from '@chakra-ui/layout'
import { Tag } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Album } from '../@types/ui'
import { colorsAll, slugify } from '../lib/constants'
import { isLight } from '../lib/utils'
import { Art } from './Art'

type Props = {
  album: Album
}

const getTitle = (album: Album) => {
  if (!album) return 'No Album'
  return (
    <>
      <NextLink href={`/artist/${slugify(album.artist[0].name)}`} passHref>
        <Link fontWeight={300}>{album.artist[0].name}</Link>
      </NextLink>
      {': '}
      <Text as="span" fontStyle="italic">
        {album.title}
      </Text>
    </>
  )
}

export const AlbumSummary = ({ album }: Props) => {
  const router = useRouter()
  const scheme = colorsAll.filter((color) => !color.includes(router.query.bg as string))

  return (
    <Box pb="10">
      <Heading
        fontSize={['3.5rem', null, '7rem', '10rem']}
        fontWeight={200}
        textTransform="uppercase"
        textAlign="center"
      >
        {getTitle(album)}
      </Heading>
      {album && (
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
                  <NextLink href={`/genre/${slugify(genre.name)}`}>
                    <Link>{genre.name}</Link>
                  </NextLink>
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
                  <NextLink href={`/vibe/${slugify(descriptor.name)}`}>
                    <Link>{descriptor.name}</Link>
                  </NextLink>
                </Tag>
              )
            })}
          </GridItem>
        </Grid>
      )}
    </Box>
  )
}

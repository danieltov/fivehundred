/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Grid, GridItem, Heading, Link, Text } from '@chakra-ui/layout'
import { Tag } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Album } from '../@types/ui'
import { colorsAll } from '../lib/constants'
import { isLight } from '../lib/utils'
import { Art } from './Art'

type Props = {
  album: Album
  bg: string
}

const getTitle = (album: Album) => {
  if (!album) return 'No Album'
  return (
    <>
      <NextLink href={`/artist/${album.artist[0].slug}`} passHref>
        <Link fontWeight={300}>{album.artist[0].name}</Link>
      </NextLink>
      {': '}
      <Text as='span' fontStyle='italic'>
        {album.title}
      </Text>
      <Text as='span'> ({new Date(album.releaseDate).getFullYear()})</Text>
    </>
  )
}

export const AlbumSummary = ({ album, bg }: Props) => {
  const scheme = colorsAll.filter((color) => !color.includes(bg))

  return (
    <Box pb='10' px={[1, null, 0]} mt='50px'>
      <Heading
        fontSize={['2.5rem', null, '5rem', '7rem']}
        fontWeight={200}
        textTransform='uppercase'
        textAlign='center'
      >
        {getTitle(album)}
      </Heading>
      {album && (
        <Grid
          px={[0, null, null, 10]}
          m={5}
          templateColumns={['1fr', null, null, 'repeat(5, 1fr)']}
          gap={4}
        >
          <GridItem rowSpan={[1, null, null, 3]} colSpan='auto'>
            <Art coverArt={album.coverArt} />
          </GridItem>
          <GridItem colSpan={[1, null, null, 4]} ml={[0, 0, 0, '7.5%']}>
            <Heading>Genres</Heading>
            {album.genres.map((genre, i) => {
              const genreBG = scheme[i % scheme.length]
              return (
                <Tag
                  size='lg'
                  key={genre.name}
                  m={2}
                  borderRadius='full'
                  bg={genreBG}
                  color={isLight(genreBG) ? 'black' : 'white'}
                >
                  <NextLink href={`/genre/${genre.slug}`}>
                    <Link>{genre.name}</Link>
                  </NextLink>
                </Tag>
              )
            })}
          </GridItem>
          <GridItem colSpan={[1, null, null, 4]} ml={[0, 0, 0, '7.5%']}>
            <Heading>Vibes</Heading>
            {album.descriptors.map((descriptor, i) => {
              const vibeBG = scheme[i % scheme.length]
              return (
                <Tag
                  size='lg'
                  key={descriptor.name}
                  m={2}
                  borderRadius='full'
                  bg={vibeBG}
                  color={isLight(vibeBG) ? 'black' : 'white'}
                >
                  <NextLink href={`/vibe/${descriptor.slug}`}>
                    <Link>{descriptor.name}</Link>
                  </NextLink>
                </Tag>
              )
            })}
          </GridItem>
          {(album.spotifyUri || album.appleMusicUrl) && (
            <GridItem colSpan={[1, null, null, 4]} ml={[0, 0, 0, '7.5%']} mt={4}>
              <Heading>Listen</Heading>
              <Box mt={4}>
                {album.spotifyUri && (
                  <Box mb={4}>
                    <iframe
                      data-testid='embed-iframe'
                      style={{ borderRadius: '12px' }}
                      src={`https://open.spotify.com/embed/album/${album.spotifyUri.split(':')[2]}`}
                      width='100%'
                      height='352'
                      frameBorder='0'
                      allowFullScreen={false}
                      allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
                      loading='lazy'
                    />
                  </Box>
                )}
                {album.appleMusicUrl && (
                  <Box>
                    <iframe
                      src={`https://embed.music.apple.com/us/album/${
                        album.appleMusicUrl.split('/album/')[1]?.split('?')[0]
                      }`}
                      width='100%'
                      height='175'
                      frameBorder='0'
                      allow='autoplay *; encrypted-media *; fullscreen *'
                      style={{ borderRadius: '12px' }}
                    />
                  </Box>
                )}
              </Box>
            </GridItem>
          )}
        </Grid>
      )}
    </Box>
  )
}

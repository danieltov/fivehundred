import { Box, Input, Text, useMediaQuery } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { Album } from '../../@types/ui'
import { AlbumListItem } from './AlbumListItem'

interface AlbumListProps {
  items: Album[]
  showRanking?: boolean
  title?: string
}

export const AlbumList = ({ items, showRanking = false, title = 'Album List' }: AlbumListProps) => {
  const [query, setQuery] = useState<string>('')
  const [filteredItems, setFilteredItems] = useState<Album[]>(items)
  const [isMobile] = useMediaQuery('(max-width: 768px)', {
    ssr: true,
    fallback: true,
  })

  // Filter logic
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredItems(items)
    } else {
      const filtered = items.filter((item: Album) => {
        const isArtistFound = item.artist[0]?.name.toLowerCase().includes(query.toLowerCase())
        const isAlbumFound = item.title.toLowerCase().includes(query.toLowerCase())
        return isArtistFound || isAlbumFound
      })
      setFilteredItems(filtered)
    }
  }, [query, items])

  return (
    <Box w='100vw' bg='transparent'>
      {/* List Header */}
      <Box py={6} px={4} textAlign='center'>
        <Text
          fontSize={['xl', '2xl', '3xl']}
          fontWeight={200}
          color='black'
          textTransform='uppercase'
          mb={4}
        >
          {title}
        </Text>

        {/* Filter Input - only show if more than 10 albums */}
        {items.length > 10 && (
          <Input
            placeholder='Filter albums...'
            size='lg'
            w={isMobile ? 'xs' : 'sm'}
            variant='flushed'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            borderColor='black'
            _placeholder={{ color: 'gray.600' }}
            _focus={{
              borderColor: 'black',
            }}
            textAlign='center'
          />
        )}
      </Box>

      {/* List Items */}
      <Box display='flex' justifyContent='center' w='100%'>
        <Box
          display='grid'
          gridTemplateColumns={['1fr', null, null, '1fr 1fr']}
          gap={0}
          maxW={['100%', '100%', '1200px']}
          w='100%'
        >
          {filteredItems.map((album, index) => (
            <AlbumListItem
              key={album.id}
              rank={showRanking ? album.topRanking : undefined}
              albumArtUrl={album.coverArt}
              albumTitle={album.title}
              artistName={album.artist[0]?.name}
              path={`/album/${album.artist[0]?.slug}/${album.slug}`}
              isPriority={index < 10} // First 10 items get priority loading
            />
          ))}
        </Box>

        {/* No results message */}
        {filteredItems.length === 0 && query.trim() !== '' && (
          <Box py={12} textAlign='center'>
            <Text color='gray.600' fontSize='lg'>
              No albums found matching &ldquo;{query}&rdquo;
            </Text>
          </Box>
        )}
      </Box>

      {/* Items Count Footer */}
      <Box py={4} textAlign='center'>
        <Text fontSize='sm' color='gray.600' textTransform='uppercase' letterSpacing='wide'>
          {query.trim() !== '' && filteredItems.length !== items.length
            ? `Showing ${filteredItems.length} of ${items.length} albums`
            : `${items.length} albums`}
        </Text>
      </Box>
    </Box>
  )
}

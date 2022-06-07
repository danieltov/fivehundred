import { Box } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/react'
import React from 'react'
import { Album } from '../@types/ui'

type Props = {
  coverArt: Album['coverArt']
}

export const Art = ({ coverArt }: Props) => {
  return (
    <Box
      as="picture"
      width={['85vw', '500px']}
      height={['85vw', '500px']}
      _after={{
        content: `""`,
        position: 'absolute',
        bg: 'gray.800',
        borderRadius: '100%',
        height: '90%',
        width: '90%',
        top: '5%',
        left: '15%',
        zIndex: 0,
        transitionDuration: '0.5s',
      }}
      _hover={{
        _after: {
          left: ['15%', '25%'],
        },
      }}
      display="inline-block"
      position="relative"
    >
      <Image src={coverArt} position="relative" zIndex="banner" width="full" height="full" display="block" />
    </Box>
  )
}

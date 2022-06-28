import { Flex, Heading, Text } from '@chakra-ui/layout'
import { useRouter } from 'next/router'
import { colorPages, colorsB } from '../lib/constants'
import { unslugify } from '../lib/utils'

/**
 * Constants
 */
const TEXT = {
  '/a-plus': {
    title: 'A-Plus',
    description:
      'The Beloveds. The albums of sustained beauty, insight, power, or groove that have invited and rewarded repeated listens in my daily life — even though I have five hundred other records to get to.',
  },
  '/albums': {
    title: 'Albums',
    description: 'Every last one of them.',
  },
  '/artists': {
    title: 'Artists',
    description: 'The artists whose names came up most often when cataloguing this library.',
  },
  '/genres': {
    title: 'Genres',
    description: 'The styles of music that dominate this library.',
  },
  '/vibes': {
    title: 'Vibes',
    description: 'The moods I gravitate to in my lifetime of listening.',
  },
}

const NO_RENDER = ['/']

const Intro = () => {
  const router = useRouter()
  const pathname = router.pathname
  return (
    !NO_RENDER.includes(router.pathname) && (
      <Flex
        direction="column"
        alignItems="center"
        as="section"
        minHeight="250px"
        textAlign="center"
        py={'100px'}
        bg={colorPages[pathname] ?? colorsB[Math.floor(Math.random() * colorsB.length)]}
      >
        <Heading fontSize={['3.5rem', null, '7rem', '10rem']} fontWeight={200} textTransform="uppercase">
          {TEXT[pathname]?.title ?? `${unslugify(router.asPath)}`}
        </Heading>
        <Text width="33%">{TEXT[pathname]?.description}</Text>
      </Flex>
    )
  )
}

export default Intro

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
    description: 'Every last one of them a gem.',
  },
  '/artists': {
    title: 'Artists',
    description: 'The names came up most often when cataloguing this library.',
  },
  '/genres': {
    title: 'Genres',
    description: 'I reach out for these styles most often.',
  },
  '/vibes': {
    title: 'Vibes',
    description: 'The moods that color my listening.',
  },
}

const NO_RENDER = ['/']

const Intro = () => {
  const router = useRouter()
  const { pathname, asPath } = router
  return (
    !NO_RENDER.includes(pathname) && (
      <Flex
        direction="column"
        alignItems="center"
        as="section"
        minHeight="250px"
        textAlign="center"
        py="100px"
        bg={colorPages[pathname] ?? colorsB[Math.floor(Math.random() * colorsB.length)]}
      >
        <Heading fontSize={['3.5rem', null, '7rem', '10rem']} fontWeight={200} textTransform="uppercase">
          {TEXT[pathname]?.title ?? `${unslugify(asPath)}`}
        </Heading>
        <Text width={['70%', null, null, '33%']}>{TEXT[pathname]?.description}</Text>
      </Flex>
    )
  )
}

export default Intro

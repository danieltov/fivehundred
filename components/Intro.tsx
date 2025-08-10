import { Heading, Text } from '@chakra-ui/layout'
import { useRouter } from 'next/router'

import { unslugify } from '../lib/utils'

/**
 * Constants
 */
const TEXT = {
  '/': {
    title: 'Five Hundred',
    description:
      'Thanks for stopping by! 💛 This project catalogs a lifetime library of my favorite albums. The idea is to collect and trace their various styles and moods in a fun, colorful way. This is an evolving project but please pull out your 🎧 and feel free to explore! ✨',
  },
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

const Intro = () => {
  const router = useRouter()
  const { pathname, asPath } = router
  return (
    <>
      <Heading
        fontSize={['2.5rem', null, '5rem', '7rem']}
        fontWeight={200}
        textTransform='uppercase'
      >
        {TEXT[pathname]?.title ?? `${unslugify(asPath)}`}
      </Heading>
      <Text width={['70%', null, null, '33%']}>{TEXT[pathname]?.description}</Text>
    </>
  )
}

export default Intro

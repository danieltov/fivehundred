import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'

import { Shelf } from '../components/Shelf'
import { links } from '../lib/constants'

const Home = () => {
  const type = useConst('home')
  return (
    <Box as='main' width='100vw' maxWidth='100vw'>
      <Shelf items={links} type={type} />
    </Box>
  )
}

export default Home

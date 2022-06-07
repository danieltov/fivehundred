import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'
import { Shelf } from '../components/Shelf'
import { links } from '../lib/constants'

const Home = () => {
  const type = useConst('home')
  return (
    <Box as="main" mt="50px" width="100%" height="100vh">
      <Shelf items={links} type={type} />
    </Box>
  )
}

export default Home

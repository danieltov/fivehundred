import { Box, Spinner } from '@chakra-ui/react'

import { colorsAll } from '../lib/constants'

export const LoadingOverlay = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={2000}
      // bg black with opacity .2
      bgColor="rgba(0, 0, 0, 0.2)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
    >
      <Spinner
        size="xl"
        thickness="4px"
        color={colorsAll[Math.floor(Math.random() * colorsAll.length)]}
        speed="0.7s"
      />
    </Box>
  )
}

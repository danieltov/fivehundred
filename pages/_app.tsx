import 'reset-css'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { Footer } from '../components/Footer'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { Menu } from '../components/Menu'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, refetchOnReconnect: false } },
})
const theme = extendTheme({
  styles: {
    global: {
      'body, html': { backgroundColor: 'ivory', overflowX: 'hidden', position: 'relative' },
      'a:hover': { textDecoration: 'none!important' },
    },
  },
})

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleStop = () => setLoading(false)
    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <LoadingOverlay isActive={loading} />
        <Head>
          <title>Five Hundred</title>
          <meta
            name='description'
            content='The goal of the Five Hundred project is to catalogue a lifetime library of my favorite albums, to collect and trace their various styles and moods, in a colorful, visual way.'
          />
          <meta name='twitter:card' content='summary' />
          <meta name='twitter:site' content='@danieltovario' />
          <meta name='twitter:title' content='Five Hundred, a digital record collection' />
          <meta
            name='twitter:description'
            content='The goal of the Five Hundred project is to catalogue a lifetime library of my favorite albums, to collect and trace their various styles and moods, in a colorful, visual way.'
          />
          <meta name='twitter:image' content='/twitter-image.png' />
          <meta name='twitter:image:alt' content='Screenshot of the Five Hundred home page' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
          />
          <link rel='icon' href='/favicon.ico' />
          <script
            defer
            data-domain='fivehundred.danieltovar.io'
            src='https://plausible.io/js/plausible.js'
          />
        </Head>
        <Menu />
        <Component {...pageProps} />
        <Footer />
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default MyApp

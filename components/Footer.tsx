/* eslint-disable jsx-a11y/anchor-is-valid */
import { Grid, GridItem, Heading, Link, Text } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { colorsAll } from '../lib/constants'

export const Footer = () => {
  return (
    <Grid as="footer" padding={[14, null, 28]} templateColumns={['1fr', null, 'repeat(2, 1fr)']} gap={5}>
      <GridItem>
        <Heading as="h3" size="lg">
          A project from{' '}
          <NextLink href="https://danieltovar.io" passHref>
            <Link isExternal fontWeight="bolder" color={colorsAll[5]}>
              Daniel Tovar
            </Link>
          </NextLink>
          {'. '}
        </Heading>
      </GridItem>
      <GridItem>
        <Heading as="h3" size="lg">
          About
        </Heading>
        <Text>
          The goal of Five Hundred is to catalogue a lifetime library of my favorite albums, to collect and trace their
          various styles and moods, in a colorful, visual way. The project is powered by{' '}
          <NextLink href="https://nextjs.org/" passHref>
            <Link isExternal fontWeight="bolder" color={colorsAll[2]}>
              Next
            </Link>
          </NextLink>{' '}
          and{' '}
          <NextLink href="https://www.prisma.io/" passHref>
            <Link isExternal fontWeight="bolder" color={colorsAll[4]}>
              Prisma
            </Link>
          </NextLink>
          .
        </Text>
      </GridItem>
    </Grid>
  )
}

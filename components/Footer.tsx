/* eslint-disable jsx-a11y/anchor-is-valid */
import { Grid, GridItem, Heading, Link, Text } from '@chakra-ui/layout'
import NextLink from 'next/link'

export const Footer = () => {
  return (
    <Grid as="footer" padding="28" templateColumns={['1fr', null, 'repeat(2, 1fr)']} gap={5}>
      <GridItem>
        <Heading as="h3" size="lg">
          A project from{' '}
          <NextLink href="https://danieltovar.io" passHref>
            <Link isExternal fontWeight="bolder">
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
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo enim fugit corrupti, officiis quisquam rerum
          consectetur repudiandae quidem quaerat nisi dolorum est libero amet pariatur.
        </Text>
      </GridItem>
    </Grid>
  )
}

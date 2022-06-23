/* eslint-disable jsx-a11y/anchor-is-valid */
import { Flex, Heading, Link } from '@chakra-ui/layout'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import '@fontsource/six-caps'
import NextLink from 'next/link'
import { AiOutlineMenu } from 'react-icons/ai'
import { links } from '../lib/constants'

export const Menu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Flex
        as="header"
        width="full"
        height="50px"
        bg="white"
        p={2}
        position="sticky"
        top="0"
        justifyContent="space-between"
        alignItems="center"
        zIndex="sticky"
      >
        <NextLink href="/" passHref>
          <Link>
            <Heading as="h1" size="xl" fontWeight="normal" fontFamily="Six Caps">
              500
            </Heading>
          </Link>
        </NextLink>
        <NextLink href="/" passHref>
          <Link>
            <Heading as="h1" size="md" fontWeight="normal" textTransform="uppercase">
              Five Hundred
            </Heading>
          </Link>
        </NextLink>
        <IconButton aria-label="Main menu" icon={<AiOutlineMenu />} bg="white" size="md" onClick={onOpen} />
      </Flex>
      <Drawer onClose={onClose} isOpen={isOpen} size="full" placement="top">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody bg="white" p="40px" justifyContent="center" alignItems="center" display="flex" flexDir="column">
            {links.map((link) => (
              <NextLink href={link.path} passHref key={link.text}>
                <Link onClick={onClose}>
                  <Heading
                    as="h3"
                    fontSize={['4rem', null, '8rem']}
                    lineHeight={0.9}
                    fontWeight={200}
                    textTransform="uppercase"
                  >
                    {link.text}
                  </Heading>
                </Link>
              </NextLink>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

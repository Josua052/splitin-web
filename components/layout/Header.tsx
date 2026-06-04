"use client";

import {
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowRight, IconLogin2 } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Cara Kerja", href: "/cara-kerja" },
  { label: "Fitur", href: "/#features" },
  { label: "FAQ", href: "/#faq" },
];

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sectionIds = ["features", "faq"];
    let frame = 0;

    const updateActiveSection = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const scrollPoint = window.scrollY + window.innerHeight * 0.35;
        const sections = sectionIds
          .map((id) => document.getElementById(id))
          .filter(Boolean) as HTMLElement[];

        const currentSection = sections.find((section, index) => {
          const nextSection = sections[index + 1];
          const sectionTop = section.offsetTop - 96;
          const nextTop = nextSection
            ? nextSection.offsetTop - 96
            : Number.POSITIVE_INFINITY;

          return scrollPoint >= sectionTop && scrollPoint < nextTop;
        });

        setActiveSection(currentSection?.id || "");
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname]);

  const isNavLinkActive = (href: string) => {
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");

      if (activeSection) {
        return pathname === "/" && activeSection === sectionId;
      }

      return pathname === "/" && activeHash === `#${sectionId}`;
    }

    return pathname === href;
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      setActiveHash(hash);
      setActiveSection(hash.replace("#", ""));
    }

    close();
  };

  return (
    <Box
      component="header"
      className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-sm shadow-zinc-950/[0.03] backdrop-blur-xl"
    >
      <Container size="lg" className="h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="SplitBase beranda"
          className="flex items-center gap-3 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={close}
        >
          <Box className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/20">
            <Text fw={900} c="white" size="lg" lh={1}>
              S
            </Text>
          </Box>
          <Text fw={900} size="lg" className="tracking-tight text-primary">
            SplitBase
          </Text>
        </Link>

        <Group
          component="nav"
          aria-label="Navigasi utama"
          gap={6}
          visibleFrom="md"
          className="rounded-full border border-zinc-200 bg-zinc-50/80 p-1"
        >
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavClick(link.href)}
                className={`rounded-full px-4 py-2 text-sm font-semibold outline-none transition-colors hover:bg-white hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  isActive ? "bg-white text-primary shadow-sm" : "text-zinc-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </Group>

        <Group gap="xs" visibleFrom="md">
          <Button
            component={Link}
            href="/login"
            variant="subtle"
            radius="xl"
            size="sm"
            color="gray"
            className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            leftSection={<IconLogin2 size={16} />}
          >
            Masuk
          </Button>
          <Button
            component={Link}
            href="/split"
            variant="filled"
            radius="xl"
            size="sm"
            className="bg-primary px-5 shadow-sm shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20"
            rightSection={<IconArrowRight size={16} />}
          >
            Coba Gratis
          </Button>
        </Group>

        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="md"
          size="sm"
          aria-label={opened ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="rounded-full border border-zinc-200 bg-white p-2 shadow-sm"
        />
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="min(86vw, 360px)"
        padding="lg"
        title={
          <Group gap="sm">
            <Box className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Text fw={900} c="white" size="sm" lh={1}>
                S
              </Text>
            </Box>
            <Text fw={900} className="text-primary">
              SplitBase
            </Text>
          </Group>
        }
        classNames={{
          content: "rounded-l-2xl",
          header: "border-b border-zinc-100",
          title: "w-full",
        }}
      >
        <Stack gap="xs" mt="md">
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-base font-bold outline-none transition-colors hover:bg-primary-light hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  isActive ? "bg-primary-light text-primary" : "text-zinc-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Divider my="sm" />

          <Button
            component={Link}
            href="/split"
            onClick={close}
            fullWidth
            radius="xl"
            size="md"
            className="bg-primary hover:bg-primary-dark"
            rightSection={<IconArrowRight size={18} />}
          >
            Coba Gratis
          </Button>
          <Button
            component={Link}
            href="/login"
            onClick={close}
            fullWidth
            variant="light"
            color="gray"
            radius="xl"
            size="md"
            leftSection={<IconLogin2 size={18} />}
          >
            Masuk
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}

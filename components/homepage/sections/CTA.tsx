"use client";

import { Container, Title, Text, Button, Stack, Box } from "@mantine/core";

export function CTA() {
  return (
    <Box component="section" className="py-12 bg-white">
      <Container size="lg">
        <Box 
          className="bg-primary rounded-[2.5rem] py-20 px-10 text-center relative overflow-hidden"
          style={{ 
            backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.05) 0%, transparent 20%)" 
          }}
        >
          <Stack gap="xl" align="center">
            <Title order={2} className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Siap split tagihan tanpa ribet?
            </Title>
            <Text size="lg" className="text-white/80 max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan pengguna yang sudah meninggalkan cara lama yang membingungkan.
            </Text>
            <Button 
              variant="white" 
              size="xl" 
              radius="xl" 
              className="mt-4 px-10 text-primary font-bold hover:bg-zinc-50 transition-colors"
            >
              Coba Sekarang — Gratis!
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

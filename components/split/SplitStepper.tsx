"use client";

import { Container, Box, Text, Group, Stack } from "@mantine/core";
import { IconReceipt, IconUsers, IconCircleCheck } from "@tabler/icons-react";
import React from "react";

interface SplitStepperProps {
  active: number;
}

export function SplitStepper({ active }: SplitStepperProps) {
  const steps = [
    { label: "Input Tagihan", icon: IconReceipt },
    { label: "Tambah Peserta", icon: IconUsers },
    { label: "Konfirmasi", icon: IconCircleCheck },
  ];

  return (
    <Box className="py-12 bg-white">
      <Container size="sm">
        <Group justify="space-between" align="center" wrap="nowrap" gap={0} className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < active;
            const isActive = index === active;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={index}>
                {/* Step Item */}
                <Stack align="center" gap="xs" className="relative z-10 min-w-[100px]">
                  <Box 
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                      isActive || isCompleted 
                        ? 'bg-emerald-50 border-primary text-primary shadow-lg shadow-emerald-100' 
                        : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                    }`}
                  >
                    <Icon size={24} stroke={2} />
                  </Box>
                  <Text 
                    size="xs" 
                    fw={700} 
                    className={`uppercase tracking-wider transition-colors duration-500 ${
                      isActive || isCompleted ? 'text-primary' : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </Text>
                </Stack>

                {/* Connector Line */}
                {!isLast && (
                  <Box className="flex-grow relative h-[4px] mx-2" style={{ top: '-14px' }}>
                    {/* Background Line (Gray) */}
                    <Box className="absolute inset-0 bg-zinc-100 rounded-full" />
                    
                    {/* Active/Completed Line */}
                    {index < active ? (
                      <Box className="absolute inset-0 bg-primary rounded-full transition-all duration-700" />
                    ) : index === active ? (
                      <Box className="absolute inset-0 animate-moving-dash rounded-full" />
                    ) : null}
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Group>
      </Container>
    </Box>
  );
}

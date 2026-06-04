"use client";

import { Box } from "@mantine/core";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SplitStepper } from "@/components/split/SplitStepper";
import { BillDetailSection } from "@/components/split/sections/BillDetailSection";
import { AddParticipantsSection } from "@/components/split/sections/AddParticipantsSection";
import { FinalResultSection } from "@/components/split/sections/FinalResultSection";
import {
  createEmptyBill,
  CustomShares,
  ItemAssignments,
  Participant,
  SplitMode,
} from "@/components/split/types";

export default function SplitPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [bill, setBill] = useState(createEmptyBill);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "you", name: "Kamu" },
    { id: "friend-1", name: "Teman 1" },
  ]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [itemAssignments, setItemAssignments] = useState<ItemAssignments>({});
  const [customShares, setCustomShares] = useState<CustomShares>({});

  const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  return (
    <Box className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Header />
      
      <main className="flex-grow">
        <SplitStepper active={activeStep} />
        
        {activeStep === 0 && (
          <BillDetailSection bill={bill} onBillChange={setBill} onNext={nextStep} />
        )}
        
        {activeStep === 1 && (
          <AddParticipantsSection
            bill={bill}
            participants={participants}
            splitMode={splitMode}
            itemAssignments={itemAssignments}
            customShares={customShares}
            onParticipantsChange={setParticipants}
            onSplitModeChange={setSplitMode}
            onItemAssignmentsChange={setItemAssignments}
            onCustomSharesChange={setCustomShares}
            onBack={prevStep}
            onNext={nextStep}
          />
        )}

        {activeStep === 2 && (
          <FinalResultSection
            bill={bill}
            participants={participants}
            splitMode={splitMode}
            itemAssignments={itemAssignments}
            customShares={customShares}
          />
        )}
      </main>

      <Footer />
    </Box>
  );
}

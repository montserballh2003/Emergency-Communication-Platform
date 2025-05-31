"use client";

import { NextUIProvider } from "@nextui-org/react";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function ClientProviders({ children }: Props) {
  return <NextUIProvider>{children}</NextUIProvider>;
}

"use client";

import { createContext, useContext } from "react";

export type TemplateType = "romantic" | "modern";

interface TemplateContextValue {
  template: TemplateType;
}

const TemplateContext = createContext<TemplateContextValue | null>(null);

export function TemplateProvider({
  template,
  children,
}: {
  template: TemplateType;
  children: React.ReactNode;
}) {
  return (
    <TemplateContext.Provider value={{ template }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate(): TemplateContextValue {
  const context = useContext(TemplateContext);
  if (!context) {
    return { template: "romantic" };
  }
  return context;
}

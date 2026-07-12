import { PropsWithChildren } from "react";

export function DataTable({ children }: PropsWithChildren) {
  return <table className="w-full border-collapse text-[13px]">{children}</table>;
}

import "../../index.css";
import { ClientOnly } from "../[[...slug]]/client";

export function generateStaticParams() {
  return [{ slug: [""] }];
}

export default function Page() {
  return <ClientOnly />;
}

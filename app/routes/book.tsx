// Page component: just responsible for containing providers, feature components and fetch data drom ssr:
// Page component: just responsible for containing providers, feature components and fectch data from the ssr.
import type { MetaFunction } from "@remix-run/node";
import IndexContainer from "~/components/_index/IndexContainer";

export const meta: MetaFunction = () => {
  return [{ title: "About" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function About() {
  return (
    <div className="w-full h-dvh bg-red-800">
      <p className="text-2xl">Hola</p>
    </div>
  );
}

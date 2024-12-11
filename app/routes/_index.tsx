// Page component: just responsible for containing providers, feature components and fectch data from the ssr.
import type { MetaFunction } from "@remix-run/node";
import IndexContainer from "~/components/_index/IndexContainer";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Index() {
  return <IndexContainer />;
}

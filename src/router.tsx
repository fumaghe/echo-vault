import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Strip trailing slash: TanStack Router expects "/echo-vault", not "/echo-vault/".
  // A trailing slash causes the router to strip the prefix and get "" instead of "/"
  // for the root route, triggering a silent redirect loop that freezes the page.
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/+$/, "");

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath,
  });

  return router;
};
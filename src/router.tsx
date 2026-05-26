import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // BASE_URL is '/' in the Cloudflare/SSR build and '/echo-vault/' in the
    // GitHub Pages static build — keeps routing correct in both environments.
    basepath: import.meta.env.BASE_URL,
  });

  return router;
};
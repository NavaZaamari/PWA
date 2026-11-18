import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { LoadingScreen } from "./components/layout/LoadingScreen";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: LoadingScreen,
    defaultPendingMs: 150,
  });

  return router;
};

import { Suspense, useEffect, useState } from "react";
import React from "react";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
// eslint-disable-next-line import/no-unresolved
import { useHashLocation } from "wouter/use-hash-location";

import { getLinkSafeString, isDev, rootDirectory } from "../../utilities/common";
import { PopupPositioningContext } from "../Contexts/PopupPositioningContext";
import { useLastLocation } from "../Effects/useLocalStorageValue";
import { usePopoverPositioning } from "../Effects/usePopoverPositioning";
import useThemeUpdater from "../Effects/useThemeUpdater";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import PageHeader from "../PageHeader/PageHeader";

class LazyLoadError extends Error {
    constructor(error: any) {
        super(error);
        this.name = "LazyLoadError";
    }
}

type HashJson = {
    hash?: string;
};

// If any of these lazily loaded pages fail to load, throw a special error
// that will trigger a reload. This should only happen on new page navigation
// so state is not lost.
const AboutPage = React.lazy(() =>
    import("../Pages/AboutPage/AboutPage").catch(() => {
        throw new LazyLoadError("Failed to load AboutPage");
    }),
);
const BotsPage = React.lazy(() =>
    import("../Pages/BotsPage/BotsPage").catch(() => {
        throw new LazyLoadError("Failed to load BotsPage");
    }),
);
const BuildPage = React.lazy(() =>
    import("../Pages/BuildPage/BuildPage").catch(() => {
        throw new LazyLoadError("Failed to load BuildPage");
    }),
);
const CombatPage = React.lazy(() =>
    import("../Pages/CombatPage").catch(() => {
        throw new LazyLoadError("Failed to load CombatPage");
    }),
);
const HacksPage = React.lazy(() =>
    import("../Pages/HacksPage/HacksPage").catch(() => {
        throw new LazyLoadError("Failed to load HacksPage");
    }),
);
const LorePage = React.lazy(() =>
    import("../Pages/LorePage/LorePage").catch(() => {
        throw new LazyLoadError("Failed to load LorePage");
    }),
);
const PartsPage = React.lazy(() =>
    import("../Pages/PartsPage/PartsPage").catch(() => {
        throw new LazyLoadError("Failed to load PartsPage");
    }),
);
const RifPage = React.lazy(() =>
    import("../Pages/RifPage/RifPage").catch(() => {
        throw new LazyLoadError("Failed to load RifPage");
    }),
);
const SimulatorPage = React.lazy(() =>
    import("../Pages/SimulatorPage/SimulatorPage").catch(() => {
        throw new LazyLoadError("Failed to load SimulatorPage");
    }),
);
const WikiPage = React.lazy(() =>
    import("../Pages/WikiPage/WikiPage").catch(() => {
        throw new LazyLoadError("Failed to load WikiPage");
    }),
);

function Routes() {
    const [hashLocation] = useHashLocation();

    const routes = (
        <Switch>
            {/* Main routes */}
            <Route path="/">
                <Redirect to="/about" />
            </Route>
            <Route path="/about">
                <AboutPage />
            </Route>
            <Route path="/bots">
                <BotsPage />
            </Route>
            <Route path="/build">
                <BuildPage />
            </Route>
            <Route path="/combat">
                <CombatPage />
            </Route>
            <Route path="/hacks">
                <HacksPage />
            </Route>
            <Route path="/lore">
                <LorePage />
            </Route>
            <Route path="/parts">
                <PartsPage />
            </Route>
            <Route path="/rif">
                <RifPage />
            </Route>
            <Route path="/simulator">
                <SimulatorPage />
            </Route>
            <Route path="/wiki/*?">
                <WikiPage />
            </Route>

            {/* Redirect routes, don't want to break existing links */}
            <Route path="/about.html">
                <Redirect to="/about" replace={true} />
            </Route>
            <Route path="/bots.html">
                <Redirect to="/bots" replace={true} />
            </Route>
            <Route path="/build.html">
                <Redirect to="/build" replace={true} />
            </Route>
            <Route path="/combat.html">
                <Redirect to="/combat" replace={true} />
            </Route>
            <Route path="/hacks.html">
                <Redirect to="/hacks" replace={true} />
            </Route>
            <Route path="/lore.html">
                <Redirect to="/lore" replace={true} />
            </Route>
            <Route path="/parts.html">
                <Redirect to="/parts" replace={true} />
            </Route>
            <Route path="/rif.html">
                <Redirect to="/rif" replace={true} />
            </Route>
            <Route path="/simulator.html">
                <Redirect to="/simulator" replace={true} />
            </Route>
            <Route path="/wiki.html">
                {() => {
                    // If old wiki hash-based URL, redirect to new scheme
                    if (hashLocation.length > 1) {
                        return <Redirect to={`/wiki/${getLinkSafeString(hashLocation.substring(1))}`} replace={true} />;
                    }

                    return <Redirect to="/wiki" replace={true} />;
                }}
            </Route>

            {/* 404 */}
            <Route>Page not found!</Route>
        </Switch>
    );

    return routes;
}

function errorFallback(error: Error) {
    if (error instanceof LazyLoadError && !isDev()) {
        setTimeout(() => location.reload(), 5000);
        return <p className="error-notice">Cog-Minder has updated, automatically reloading page in 5 seconds...</p>;
    }

    let errorMessage: string;
    let stacktrace: string | undefined = undefined;
    if (typeof error === "string") {
        errorMessage = error;
    } else if (error instanceof Error) {
        errorMessage = error.message;
        stacktrace = error.stack;
    } else {
        errorMessage = "An unknown error occurred";
    }

    return (
        <>
            <p className="error-notice">Unexpected error, please try refreshing the page.</p>
            <p className="error-message">
                If the issue persists, please report on the on Roguelikes Discord or Cog-Minder Github.
            </p>
            <p className="error-message">{errorMessage}</p>
            {stacktrace && <p>{stacktrace}</p>}
        </>
    );
}

function checkUpdate(timer: number, updated: boolean, setUpdated: (updated: boolean) => void) {
    if (updated || isDev()) {
        return;
    }

    fetch("https://noemica.github.io/cog-minder/hash.json", {
        cache: "no-store",
    })
        .then((result) => result.json() as HashJson | undefined)
        .then((hashJson) => {
            // @ts-expect-error commit hash is injected
            if (hashJson && hashJson.hash && hashJson.hash !== __COMMIT_HASH__) {
                setUpdated(true);
                clearInterval(timer);
            }
        })
        .catch((e) => {
            console.log(`Failed to check for update: ${e}`);
        });
}

export default function App() {
    useThemeUpdater();
    const [updated, setUpdated] = useState(false);
    const [urlLocation] = useLocation();
    const [lastLocation, setLastLocation] = useLastLocation();
    const popupPositioning = usePopoverPositioning();

    // Explicitly scroll back to top whenever the URL changes
    useEffect(() => {
        if (urlLocation !== lastLocation) {
            window.scrollTo(0, 0);
            setLastLocation(urlLocation);
        }
    }, [urlLocation]);

    // Check every 5 minutes if we need to update
    // Once an update has been pushed, it will sometimes cause random issues
    // where data cannot be fetched due to browser caching (presumably)
    // It would be a little overbearing to instantly reload the page while the
    // user might be doing other things, so instead show a "needs update" icon
    // in the corner
    useEffect(() => {
        const timer = setInterval(
            () => {
                checkUpdate(timer, updated, setUpdated);
            },
            5 * 60 * 1000,
            [],
        );

        checkUpdate(timer, updated, setUpdated);

        return () => {
            clearInterval(timer);
        };
    });

    return (
        <PopupPositioningContext.Provider
            value={{ placement: popupPositioning.placement, shouldShift: popupPositioning.shouldShift }}
        >
            <PageHeader showIcon={updated} />
            <Router base={`/${rootDirectory}`}>
                <Suspense fallback={<span className="loading-message">Loading</span>}>
                    <ErrorBoundary
                        fallback={(error) => {
                            if (updated) {
                                location.reload();
                            }

                            return errorFallback(error);
                        }}
                    >
                        <Switch>{<Routes />}</Switch>
                    </ErrorBoundary>
                </Suspense>
            </Router>
        </PopupPositioningContext.Provider>
    );
}

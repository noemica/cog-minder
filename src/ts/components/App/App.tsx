import { Suspense, useEffect } from "react";
import React from "react";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import { getLinkSafeString, rootDirectory } from "../../utilities/common";
import useThemeUpdater from "../Effects/useThemeUpdater";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import PageHeader from "../PageHeader/PageHeader";

const AboutPage = React.lazy(() => import("../Pages/AboutPage/AboutPage"));
const BotsPage = React.lazy(() => import("../Pages/BotsPage/BotsPage"));
const BuildPage = React.lazy(() => import("../Pages/BuildPage/BuildPage"));
const CombatPage = React.lazy(() => import("../Pages/CombatPage"));
const HacksPage = React.lazy(() => import("../Pages/HacksPage/HacksPage"));
const LorePage = React.lazy(() => import("../Pages/LorePage/LorePage"));
const PartsPage = React.lazy(() => import("../Pages/PartsPage/PartsPage"));
const RifPage = React.lazy(() => import("../Pages/RifPage/RifPage"));
const SimulatorPage = React.lazy(() => import("../Pages/SimulatorPage/SimulatorPage"));
const WikiPage = React.lazy(() => import("../Pages/WikiPage/WikiPage"));

function Routes() {
    const [hashLocation] = useHashLocation();

    return (
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
}

function errorFallback(error: Error) {
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
            <p className="error-notice">Unexpected error, please report the following</p>
            <p className="error-message">{errorMessage}</p>
            {stacktrace && <p>{stacktrace}</p>}
        </>
    );
}

export default function App() {
    useThemeUpdater();
    const [location] = useLocation();

    // Explicitly scroll back to top whenever the URL changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <>
            <PageHeader />
            <Router base={`/${rootDirectory}`}>
                <Suspense fallback={<span className="loading-message">Loading</span>}>
                    <ErrorBoundary fallback={errorFallback}>
                        <Switch>{<Routes />}</Switch>
                    </ErrorBoundary>
                </Suspense>
            </Router>
        </>
    );
}

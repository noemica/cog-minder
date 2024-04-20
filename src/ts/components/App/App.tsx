import { Suspense } from "react";
import React from "react";
import { Redirect, Route, Router, Switch } from "wouter";

import useThemeUpdater from "../Effects/useThemeUpdater";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import PageHeader from "../PageHeader/PageHeader";

const AboutPage = React.lazy(() => import("../Pages/AboutPage"));
const BotsPage = React.lazy(() => import("../Pages/BotsPage/BotsPage"));
const BuildPage = React.lazy(() => import("../Pages/BuildPage/BuildPage"));
const CombatPage = React.lazy(() => import("../Pages/CombatPage"));
const HacksPage = React.lazy(() => import("../Pages/HacksPage/HacksPage"));
const LorePage = React.lazy(() => import("../Pages/LorePage/LorePage"));
const PartsPage = React.lazy(() => import("../Pages/PartsPage/PartsPage"));
const RifPage = React.lazy(() => import("../Pages/RifPage/RifPage"));

function Routes() {
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

            {/* Redirect routes, don't want to break existing links */}
            <Route path="/about.html">
                <Redirect to="/about" />
            </Route>
            <Route path="/bots.html">
                <Redirect to="/bots" />
            </Route>
            <Route path="/build.html">
                <Redirect to="/build" />
            </Route>
            <Route path="/combat.html">
                <Redirect to="/combat" />
            </Route>
            <Route path="/hacks.html">
                <Redirect to="/hacks" />
            </Route>
            <Route path="/lore.html">
                <Redirect to="/lore" />
            </Route>
            <Route path="/parts.html">
                <Redirect to="/parts" />
            </Route>
            <Route path="/rif.html">
                <Redirect to="/rif" />
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
            <p className="error-notice">Unexpected error, please report the following error</p>
            <p className="error-message">{errorMessage}</p>
            {stacktrace && <p>{stacktrace}</p>}
        </>
    );
}

export default function App() {
    useThemeUpdater();

    return (
        <>
            <PageHeader />
            <Router base="/cog-minder">
                <Suspense fallback={<span className="loading-message">Loading</span>}>
                    <ErrorBoundary fallback={errorFallback}>
                        <Switch>{<Routes />}</Switch>
                    </ErrorBoundary>
                </Suspense>
            </Router>
        </>
    );
}

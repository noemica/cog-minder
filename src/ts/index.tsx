import React from "react";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Redirect, Route, Router, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import PageHeader from "./components/PageHeader/PageHeader";

import "../styles/index.less";

const AboutPage = React.lazy(() => import("./components/Pages/AboutPage"));
const BotsPage = React.lazy(() => import("./components/Pages/BotsPage/BotsPage"));
const CombatPage = React.lazy(() => import("./components/Pages/CombatPage"));
const HacksPage = React.lazy(() => import("./components/Pages/HacksPage/HacksPage"));
const PartsPage = React.lazy(() => import("./components/Pages/PartsPage/PartsPage"));

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);

    const routes = (
        <>
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
            <Route path="/combat">
                <CombatPage />
            </Route>
            <Route path="/hacks">
                <HacksPage />
            </Route>
            <Route path="/parts">
                <PartsPage />
            </Route>
            {/* Redirect routes, don't want to break existing links */}
            <Route path="/about.html">
                <Redirect to="/about" />
            </Route>
            <Route path="/bots.html">
                <Redirect to="/bots" />
            </Route>
            <Route path="/combat.html">
                <Redirect to="/combat" />
            </Route>
            <Route path="/hacks.html">
                <Redirect to="/hacks" />
            </Route>
            <Route path="/parts.html">
                <Redirect to="/parts" />
            </Route>
            {/* 404 */}
            <Route>Page not found!</Route>
        </>
    );

    root.render(
        <StrictMode>
            <PageHeader />
            <Router base="/cog-minder">
                <Suspense fallback={<span className="loading-message">Loading</span>}>
                    <ErrorBoundary
                        fallback={(error) => {
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
                        }}
                    >
                        <Switch>{routes}</Switch>
                    </ErrorBoundary>
                </Suspense>
            </Router>
        </StrictMode>,
    );
}

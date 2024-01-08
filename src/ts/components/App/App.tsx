import { ReactNode, StrictMode, Suspense, lazy } from "react";

import { PageType } from "../../types/commonTypes";
import useThemeUpdater from "../Effects/useThemeUpdater";
import PageHeader from "../PageHeader/PageHeader";

import "../../../styles/index.less";

const AboutPage = lazy(() => import("../Pages/AboutPage"));
const BotsPage = lazy(() => import("../Pages/BotsPage/BotsPage"));
const CombatPage = lazy(() => import("../Pages/CombatPage"));
const PartsPage = lazy(() => import("../Pages/PartsPage/PartsPage"));

export type AppProps = {
    pageType: PageType;
};

export default function App({ pageType }: AppProps) {
    let page: ReactNode = undefined;

    useThemeUpdater();

    try {
        switch (pageType) {
            case "About":
                page = <AboutPage />;
                break;

            case "Bots":
                page = <BotsPage />;
                break;

            case "Combat":
                page = <CombatPage />;
                break;

            case "Parts":
                page = <PartsPage />;
                break;

            default:
                page = <div />;
        }
    } catch (ex: unknown) {
        let errorMessage: string;
        let stacktrace: string | undefined = undefined;
        if (typeof ex === "string") {
            errorMessage = ex;
        } else if (ex instanceof Error) {
            errorMessage = ex.message;
            stacktrace = ex.stack;
        } else {
            errorMessage = "An unknown error occurred";
        }

        page = (
            <>
                <p className="error-notice">Unexpected error, please report</p>
                <p className="error-message">{errorMessage}</p>
                {stacktrace && <p>{stacktrace}</p>}
            </>
        );
    }

    return (
        <StrictMode>
            <PageHeader pageType={pageType} />
            <Suspense fallback={<span className="loading-message">Loading</span>}>{page}</Suspense>
        </StrictMode>
    );
}

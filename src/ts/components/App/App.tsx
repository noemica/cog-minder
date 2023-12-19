import { ReactNode, StrictMode } from "react";

import { PageType } from "../../types/commonTypes";
import PageHeader from "../PageHeader/PageHeader";
import AboutPage from "../Pages/AboutPage";
import { CombatPage } from "../Pages/CombatPage";

import "../../../styles/index.less";
import useThemeUpdater from "../Effects/useThemeUpdater";

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

            case "Combat":
                page = <CombatPage />;
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
            {page}
        </StrictMode>
    );
}

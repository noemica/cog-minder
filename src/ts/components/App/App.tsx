import { ReactNode, StrictMode } from "react";

import { PageType } from "../../types/commonTypes";
import { CombatPage } from "../Pages/CombatPage";

import "../../../styles/index.less";
import PageHeader from "../PageHeader/PageHeader";

export type AppProps = {
    pageType: PageType;
};

export default function App({ pageType }: AppProps) {
    let page: ReactNode = undefined;

    try {
        switch (pageType) {
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
            <PageHeader pageType="Combat" />
            {page}
        </StrictMode>
    );
}

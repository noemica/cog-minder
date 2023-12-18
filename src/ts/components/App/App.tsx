import { ReactNode, StrictMode } from "react";

import PageHeader, { PageType } from "../PageHeader/PageHeader";
import { CombatPage } from "../Pages/CombatPage";

import "../../../styles/index.less";

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
            <PageHeader type="Combat" />
            {page}
        </StrictMode>
    );
}

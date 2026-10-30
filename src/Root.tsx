import {AppStateContext} from "./context";
import {AppState} from "./state/app";
import App from "./ui/App";

export default () => {
    return (
        <AppStateContext.Provider value={new AppState()}>
            <App />
        </AppStateContext.Provider>
    );
};

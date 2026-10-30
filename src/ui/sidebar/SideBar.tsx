import AppInfo from "./AppInfo";
import Views from "./Views";

export default () => {
    return (
        <aside class="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-3 p-3">
            <AppInfo />
            <Views />
        </aside>
    );
};

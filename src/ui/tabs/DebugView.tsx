import {ObjectType} from "@/model";

import ObjectView from "../ObjectView";

export default () => {
    return (
        <div>
            <ObjectView object={{type: ObjectType.Atom, value: 42n}} />
        </div>
    );
};

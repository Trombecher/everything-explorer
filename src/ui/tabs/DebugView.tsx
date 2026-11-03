import {ObjectType} from "@/model";

import ObjectView from "../ObjectView";

export default () => {
    return (
        <div>
            <ObjectView
                object={{
                    type: ObjectType.Function,
                    body: {
                        type: ObjectType.Function,
                        body: {type: ObjectType.Integer, value: 0n},
                    },
                }}
            />
        </div>
    );
};

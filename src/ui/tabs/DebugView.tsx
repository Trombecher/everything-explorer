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
                        body: {
                            type: ObjectType.Plus,
                            first: {type: ObjectType.Integer, value: 1n},
                            second: {type: ObjectType.Integer, value: -4n},
                        },
                    },
                }}
            />
        </div>
    );
};

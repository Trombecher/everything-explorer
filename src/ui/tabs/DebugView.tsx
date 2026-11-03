import {ObjectType} from "@/model";
import {NodeType} from "@/model/nodes";

import NodeView from "../NodeView";

export default () => {
    return (
        <div>
            <NodeView
                node={{
                    type: NodeType.Function,
                    body: {
                        type: NodeType.Function,
                        body: {
                            type: NodeType.Plus,
                            first: {
                                type: NodeType.Literal,
                                object: {type: ObjectType.Integer, value: 1n},
                            },
                            second: {
                                type: NodeType.Literal,
                                object: {type: ObjectType.Integer, value: -4n},
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

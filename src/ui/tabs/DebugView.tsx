import {ObjectType} from "@/model";
import {Atom} from "@/model/atoms";

import ObjectView from "../ObjectView";

export default () => {
    return (
        <div>
            <ObjectView
                object={{
                    type: ObjectType.Set,
                    elements: [
                        {
                            type: ObjectType.Construction,
                            constructor: Atom.NodeFunction,
                            value: {
                                type: ObjectType.Set,
                                elements: [
                                    {
                                        type: ObjectType.Construction,
                                        constructor: Atom.NodeLiteral,
                                        value: {
                                            type: ObjectType.Integer,
                                            value: 42n,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }}
            />
        </div>
    );
};

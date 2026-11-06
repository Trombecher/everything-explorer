import {ObjectType, type IntegerObject} from "@/model";
import BigIntTextField from "@/ui/reuse/BigIntTextField";
import BlackBoardZIcon from "@/ui/reuse/BlackBoardZIcon";

export default (props: {
    integer: IntegerObject;
    setInteger: ((newInteger: IntegerObject) => void) | undefined;
}) => {
    return (
        <>
            <BlackBoardZIcon />
            <BigIntTextField
                value={props.integer.value}
                setValue={
                    props.setInteger
                    && (value => {
                        props.setInteger?.({type: ObjectType.Integer, value});
                    })
                }
                inputClass="pr-2"
            />
        </>
    );
};

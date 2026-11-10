import {ObjectType, type IntegerObject} from "@/model";
import BlackBoardZIcon from "@/ui/icons/BlackBoardZIcon";
import BigIntTextField from "@/ui/reuse/BigIntTextField";

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

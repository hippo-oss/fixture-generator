// eslint-disable-next-line import/no-extraneous-dependencies
import {
    Declaration,
    Expression,
    InterfaceType,
    isPropertyAssignment,
    isShorthandPropertyAssignment,
    Symbol as TypeSymbol,
} from 'typescript';

export const getPropertyAssignmentValue = (assignment: Declaration): Expression | undefined => {
    if (isPropertyAssignment(assignment)) {
        return assignment.initializer;
    }

    if (isShorthandPropertyAssignment(assignment)) {
        return assignment.name;
    }

    return undefined;
};

export function getClassConstructor(classType: InterfaceType): TypeSymbol | undefined {
    let constructor: TypeSymbol | undefined;

    if (classType.symbol.members) {
        for (const member of classType.symbol.members.values()) {
            if (member.escapedName.valueOf() === '__constructor') {
                constructor = member;
                break;
            }
        }
    }

    return constructor;
}

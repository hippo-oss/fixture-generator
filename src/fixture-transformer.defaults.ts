// eslint-disable-next-line import/no-extraneous-dependencies
import {
    anyHandler,
    arrayHandler,
    bigIntHandler,
    bigIntLiteralHandler,
    booleanHandler,
    booleanLiteralHandler,
    classHandler,
    dateHandler,
    DefaultValueHandler,
    DefaultValueParams,
    DefaultValueResult,
    enumHandler,
    enumLiteralHandler,
    functionHandler,
    interfaceHandler,
    intersectionHandler,
    mapHandler,
    nullHandler,
    numberHandler,
    numberLiteralHandler,
    promiseHandler,
    stringHandler,
    stringLiteralHandler,
    symbolHandler,
    tagHandler,
    undefinedHandler,
    unionHandler,
    unknownHandler,
    voidHandler,
} from './handlers';

export const defaultValueHandlers: DefaultValueHandler[] = [
    // Tag handler must be first, so that the intersectionHandler
    // (or any other handler) does not attempt to handle it
    tagHandler,

    anyHandler,
    arrayHandler,
    bigIntHandler,
    bigIntLiteralHandler,
    booleanHandler,
    booleanLiteralHandler,
    classHandler,
    dateHandler,
    enumHandler,
    enumLiteralHandler,
    functionHandler,
    interfaceHandler,
    intersectionHandler,
    mapHandler,
    nullHandler,
    numberHandler,
    numberLiteralHandler,
    promiseHandler,
    stringHandler,
    stringLiteralHandler,
    symbolHandler,
    undefinedHandler,
    unionHandler,
    unknownHandler,
    voidHandler,
];

export function getDefaultValue(params: DefaultValueParams): DefaultValueResult {
    for (const handler of defaultValueHandlers) {
        const result = handler({ ...params, defaultValueFunction: getDefaultValue });
        if (result) {
            return result;
        }
    }

    throw new Error(`Unable to get default value in fixture for type ${params.typeChecker.typeToString(params.type)}`);
}

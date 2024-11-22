// eslint-disable-next-line import/no-extraneous-dependencies
import { Expression } from 'typescript';
import { DefaultValueHandler } from '../types';

export const handlerSuccess = (data: Expression): ReturnType<DefaultValueHandler> => ({
    data,
});

export const handlerFail = (): ReturnType<DefaultValueHandler> => null;

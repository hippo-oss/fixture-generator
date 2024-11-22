import { Symbol as TypeSymbol, Type } from 'typescript';

export type TypeSymbolWithLinks = TypeSymbol & { links?: {nameType?: Type} };

# Fixture Generator

# Table of Contents
- [What is it?](#what-is-it)
- [What problem are we trying to solve?](#what-problem-are-we-trying-to-solve)
  - [Fixtures Background](#fixtures-background)
  - [Fixtures Issues](#fixtures-issues)
    - [Fixture Creation and Maintenance](#fixture-creation-and-maintenance)
    - [Undefined Behavior](#undefined-behavior)
    - [Nested Objects](#nested-objects)
- [The solution!](#the-solution)
- [What’s the catch?](#whats-the-catch)
- [How can I use this in my repository?](#how-can-i-use-this-in-my-repository)
  - [For use in mocha:](#for-use-in-mocha)
  - [For use in jest:](#for-use-in-jest)
  - [For use in non-test code:](#for-use-in-non-test-code)
- [How does it work?](#how-does-it-work)
- [Options](#options)

# What is it?

The auto fixture generator is a function `newFixture` and a typescript transformer used to speed up development time around creating test objects.

# What problem are we trying to solve?

## Fixtures Background

For tests a common pattern is to create a 'fixture' of an entity to test out functions with. If the entity is used wide enough an extension to this pattern is to create a fixture function which can create an object of a certain type with some overrides. For example instead of writing out an entire object every time we might instead do:

```typescript
export interface ExampleObject {
  property1: Type1;
  property2: Type2;
  ...
}
```

```typescript
export const newExampleObject = (
  input: Partial<ExampleObject> = {},
): ExampleObject => ({
  property1: input.property1 ?? value1,
  property2: input.property2 ?? value2,
...
});
```

This allows us in tests to simply call the function `newObject` alongside any properties we want to overwrite in the specific circumstance and create a functional test object:

```typescript
// Instead of:
const object1: ExampleObject = {
  property1: overrideValue,
  property2: value2,
...
}

// We can now simply do:
const exampleObject1 = newExampleObject({property1: overrideValue})
```

As you can imagine, as our objects become longer and more complex this increasingly helps simplify and clean up tests.

## Fixtures Issues

### Fixture Function Creation and Maintenance

However, while these fixture functions are nice, they do still present some issues. One of the first issues with these functions is that in a complex app with lots of different entities the number of fixture functions quickly balloons. Creating and maintaining these fixture functions becomes a time-consuming process and a significant portion of the time spent writing tests. Depending on the complexity of the type and how often it is used, one might then not create a fixture function in all situations, but this poses a tradeoff between how clean we could make our tests and the ease of mocking various functions versus the time we wanted to spend creating and maintaining fixture functions.

```typescript
// To easily mock this we now need a fixture for
// ExampleObject, EnrichedObject, and MappedObject!
export const mainFunction = (input: ExampleObject): CompleteObject => {
  const enrichedObject = enrichObject(input);
  const mappedObject = mapObject(enrichedObject);
  return mappedObject;
};

export const enrichObject = (input: ExampleObject): EnrichedObject => {
  const enrichedObject = {
    ...input,
    enrichedProperty: enrichedValue,
  };

  return enrichedObject;
};

export const mapObject = (input: EnrichedObject): MappedObject => {
  const mappedObject = {
    ...input,
    mappedProperty: mappedValue,
  };

  return mappedObject;
};
```

This issue can be further compounded in a microservice architecture where unless these fixture functions are exposed through a client sdk, they might have to be continually created and maintained in downstream services as well when communicating with upstream services.

### Undefined Behavior

Fixtures also have a number of smaller issues unrelated to their development and maintenance costs such as weird behavior around properties that could be undefined and inconveniences with nested objects.

For behavior around properties that can be undefined, say we have an interface:

```typescript
export interface ExampleObject {
  property1: Type1 | undefined;
  ...
}
```

where we want to set a non-undefined default value for the fixture, but we also want to be able to set the property manually to undefined. Doing this:

```typescript
export const newExampleObject = (
  input: Partial<ExampleObject> = {},
): ExampleObject => ({
  property1: input.property1 ?? value1,
  ...
});

const exampleObject1 = newExampleObject({property1: undefined})
```

won’t work as since we are passing in undefined we will get value1. In the past, in home-care we have solved this by checking for the existence of the property on the input object's prototype, but this then adds further complexity in the creation and maintenance of fixtures.


For inconveniences with nested objects, say we have a nested object:

```typescript
export interface SubObject1 {
  subProperty1: subType1;
  subProperty2: subType2;
}

export interface SubObject2 {
  subProperty3: subType3;
  subProperty4: subType4;
}

export interface ExampleObject {
  property1: SubObject1;
  property2: SubObject2;
  nonNestedProperty: Type5;
}
```

We could create a fixture for it like this:

```typescript
export const newExampleObject = (
  input: Partial<ExampleObject> = {},
): ExampleObject => ({
  property1: input.property1 ?? {
    subProperty1: subValue1,
    subProperty2: subValue2,
},
  property2: input.property2 ?? {
    subProperty3: subValue3,
    subProperty4: subValue4,
},
  nonNestedProperty: input.nonNestedProperty ?? value5,
});
```

However, then when we want to use it in a test, we won’t be able to modify any of the subProperties without overwriting the entire subObject, if we want to be able to only overwrite just a single subProperty we will have to create fixtures for each subObject and use the ‘subFixture’ inside the input to the main fixture.

```typescript
export const newSubObject1 = (
  input: Partial<SubObject1> = {},
): SubObject1 => ({
  property1: input.subProperty1 ?? subValue1,
  property2: input.subProperty2 ?? subValue2,
})

export const newSubObject2 = (
  input: Partial<SubObject2> = {},
): SubObject1 => ({
  property1: input.subProperty3 ?? subValue3,
  property2: input.subProperty4 ?? subValue4,
})

export const newExampleObject = (
input: Partial<TestObject> = {},
): TestObject => ({
  property1: input.property1 ?? newSubObject1(),
  property2: input.property2 ?? newSubObject2(),
  nonNestedProperty: input.nonNestedProperty ?? value5,
});

const testObject1 = newExampleObject({
  property1: newSubObject1({
    subProperty1: overrideValue
  })
})
```

This creates additional complexities in both the creation and usage of fixtures.

# The solution!

To solve the issues we faced with the manually created fixtures we created the fixture generator. This is a typescript transformer which automatically creates valid test objects based on your types.

For example, say we have an interface:

```typescript
interface ExampleInterface {
  stringProperty: string;
  numberProperty: number;
  booleanProperty: boolean;
}
```

instead of having to create a fixture for the type we can instead just do:

```typescript
const testInterface = newFixture<ExampleInterface>();
```

which will result in:

```typescript
const testInterface = {
  stringProperty: 'defaultStringProperty',
  numberProperty: 1,
  booleanProperty: true,
}
```

Because this fixture is created based off the type information, if the type changes the resulting fixture output will automatically change along with it. Based on the type, the newFixture function will attempt to assign a reasonable default value. A list of default values for different types can be seen [here](#how-does-it-work).

If you want the fixture to always return a specific value instead of the default value for it’s type you can use the `DefaultFixture<>` tag type. For example, by default test:

```typescript
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const test = newFixture<User>();
```

would equal:

```typescript
{
  id: 'defaultId',
  firstName: 'defautFirstName',
  lastName: 'defaultLastName',
  email: 'defaultEmail',
  phoneNumber: 'defaultPhoneNumber',
};
```

However, if it is important that all fixtures for a `User.id` return a valid uuid (say if this is validated in functions where the property is used), we can add a `DefaultFixture` value for the type on the property so test:

```typescript
type User = {
  id: string & DefaultFixture<'00000000-0000-0000-0000-000000000000'>;
  firstName: string & DefaultFixture<'hungry'>;
  lastName: string & DefaultFixture<'hippo'>;
  email: string & DefaultFixture<'hungry@hippo.com'>;
  phoneNumber: string & DefaultFixture<'123-456-7890'>;
};

const test = newFixture<User>();
```

would equal:

```typescript
{
  id: '00000000-0000-0000-0000-000000000000',
  firstName: 'hungry',
  lastName: 'hippo',
  email: 'hungry@hippo.com',
  phoneNumber: '123-456-7890,
};
```

> [!NOTE]
> Note: while we are tagging the type with DefaultFixture<> this does not meaningfully affect the initial type. For example type `UUID = string & DefaultFixture<'00000000-00...'>` would be able to be used in all places a string could be used, and would be restricted from being used in all places a string would be restricted from being used.(There is a minor caveat here where if you do something like:
> 
> `type UUID = string & DefaultFixture<'00000000-00...'>;`
> 
> `type Email = string & DefaultFixture<'hungry@hippo.com'>;`
> 
> `const testFunction = (param: UUID) => param;`
> 
> while values of type string will be allowed in, values of type Email will not)

If you don’t want to modify the default fixture values you can also overwrite fixture values on a one-off basis. Going back to the user-example let's say we wanted to use a specific id for a specific situation, instead of modifying all versions of `newFixture` to use that id, we can simply overwrite it on the specific instance, so test:

```typescript
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const overwriteId = v4();
const test = newFixture<User>({ id: overwriteId });
```

would equal:

```typescript
{
  id: overwriteId;
  firstName: 'defautFirstName',
  lastName: 'defaultLastName',
  email: 'defaultEmail',
  phoneNumber: 'defaultPhoneNumber',
};
```

This also works, fully-typed with nested objects where if we have a nested object:

```typescript
export interface SubObject1 {
  subProperty1: string;
  subProperty2: number;
}

export interface SubObject2 {
  subProperty3: boolean;
  subProperty4: string;
}

export interface ExampleObject {
  property1: SubObject1;
  property2: SubObject2;
  nonNestedProperty: null;
}
```

If we want to override a specific sub-property, we can simply do:

```typescript
const test = newFixture<ExampleObject>({ property1:
  { subProperty1: 'overrideSubProperty'}
});
```

and test will equal:

```typescript
{
  property1: {
    subProperty1: 'overrideSubProperty',
    subProperty2: 1,
  },
  property2: {
    subProperty3: true,
    subProperty4: 'defaultSubProperty4',
    }
  nonNestedProperty: null
}
```

> [!TIP]
>This overriding also works for partial tuples, so one can do: 
> 
> `const test = newFixture<[string, string]>(['overrideString'])
> and test will equal:
> 
> ['overrideString', 'defaultString']`

The priority for overrides here is
`individual function overrides > DefaultFixture overrides > default value for types`

so test:

```typescript
const test = newFixture<string & DefaultFixture<'defaultFixture'>('overrideString')
```

would equal `overrideString` not `defaultFixture` (or `defaultString`).



The `newFixture` function also has restricted behavior around explicit `undefined`s. Explicitly trying to override a property to undefined for a type which does not allow undefined will cause a compile-time error. For example:

```typescript
type ExampleType = {
  requiredProperty: string;
  optionalProperty?: string
};

const test = newFixture<ExampleType>({
  requiredProperty: undefined,
  optionalProperty: undefined,
});
```

will result in a compile-time error while overriding just optionalProperty:

```typescript
type ExampleType = {
  requiredProperty: string;
  optionalProperty?: string
};

const test = newFixture<ExampleType>({
  optionalProperty: undefined,
});
```

will return:

```typescript
{
  requiredProperty: 'defaultRequiredProperty',
  optionalProperty: undefined,
}
```

> [!TIP]
Your functions don’t have to require unary object inputs for `newFixture` to help assist you in mocking. For example if you have a function: 
> 
> `const testFunction = (property1: string, property2: number, proptery3: boolean): TestType => { ... }` 
> 
> you could mock the entire function by doing:`newFixture<typeof testFunction>()` which will return a function which only returns a default TestType or you could mock valid inputs for the function by doing:
> 
> `testFunction(...newFixture<Parameters<typeof testFunction>>())`

# What’s the catch?

As `newFixture` is using a typescript transformer to correctly set the default values for different types, installation is not as straightforward as doing `npm add @hippo-oss/fixture-generator`. Please see [here](#how-can-i-use-this-in-my-repository) for instructions on how to add this to a repository.

Additionally, while this works for the vast majority of types you will use there are a few holes. Currently, there are issues with the following types:

- **never**: If you try to do `newFixture` with a type which includes never you will get a compile-time error

```typescript
//This will result in a compile-time error
newFixture<never>()
```

- **generics**: If you try to do `newFixture` with a type which includes a generic you will get a compile-time error

```typescript
//This will result in a compile time error
const testFunction = <T>(type: T) => newFixture<T>()
```

**variadic tuples**: Partial overrides are not fully supported with non-ending variadic tuples.

# How can I use this in my repository?

To use this in your repository you should do the following steps:

Add and install the transformer library and its dependents:

```json
"devDependencies": {
  "@hippo-oss/fixture-generator": "",
  "ts-patch": "",
},
```

## For use in mocha:

Update your `ts-config.json` `ts-node` (what mocha by default uses to run tests) to use `“compiler": "ts-patch/compiler" and add { "plugins": [{"transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"} ]` under `"compilerOptions"`

Your `tsconfig.json` should now look something like this:

```json
{
  ...
  "ts-node": {
    ...
    "compiler": "ts-patch/compiler",
    "compilerOptions": {
      "plugins": [
        ...
        {
          "transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"
        },
      ]
    }
  }
}
```

## For use in jest:

Update your `jest.config.js` to include `compiler: 'ts-patch/compiler'`

Your `jest.config.js` should now look something like:

```javascript
module.exports = {
  ...
  transform: {
      '^.+\\.ts$': [
        'ts-jest',
        {
          compiler: 'ts-patch/compiler',
        },
      ],
    },
  };
```

Add `"plugins": [{"transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"}]` under `"compilerOptions"` in `tsconfig.json`.

Your tsconfig.json should now look something like:

```json
{
  "compilerOptions": {
    ...
    "plugins": [
      {
        "transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"
      }
    ]
  }
}
```

## For use in non-test code:

1. Instead of building with `tsc` as your compiler use `tspc` or alternatively add `"prepare": "ts-patch install -s",` to your `package.json`.

2. Add `"plugins": [{"transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"}]` under `"compilerOptions"` in your `tsconfig.json`.

Your `tsconfig.json` should now look something like:

```json
{
  "compilerOptions": {
    ...
    "plugins": [
      {
        "transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"
      }
    ]
  }
}
```

# How does it work?

As a compile-step, the transformer takes a look at all places that use the `newFixture` function and replaces the output of the function with a set of default values based on the type argument of the function (alongside any options or overwrites passed in). The default values for different types are as follows:

- **Anonymous Object**: An object with the default values for each property

- **Any**: ‘defaultAny’

- **Array**: An array with a single item of the default value for the array’s type

- **BigInt**: 9007199254740992n

> [!TIP]
> This is the first number that can not be represented as an int.

- **Boolean**: true

- **Class (No Explicit Constructor)**: A class instance with the default values for each property

- **Class (Explicit Constructor)**: A class instance created from calling the constructor with the default values for each argument

- **Date**: A date

- **Enum**: The first value in the enum
> [!NOTE]
> This is the first value as seen by **Typescript’s AST**. This is generally the first enum as written in typescript but is not necessarily.

> [!TIP]
> You can change the default enum strategy to for example use the first enum alphabetically by passing in the defaultEnum option as a type parameter.


- **Function**: A function which returns the default value related to its return type

- **Interface**: An object with the default values for each property

- **Intersection**: A merged object with the default values for each property

- **Literals**: The value of the literal

- **Map**: A map with default values based on its type arguments

- **Null**: null

- **Number**: 1

- **Promise**: 

- **String**: ‘defaultString’ or if part of an object ‘default{PropertyName}’

- **Tuple**: A tuple with the default value for each member of the tuple

> [!WARNING]  
> Note: There is currently not full support for variadic tuples. There are some edge issues around variadic tuple and partial overrides when the variadic tuple is NOT the last member of the tuple.

- **Undefined**: undefined

- **Union**: The first type in the union that is not undefined or null

> [!NOTE]
> This is the first type as seen by **Typescript’s AST**. This will generally NOT be the first member of the union as you have written it.

> [!NOTE]
> For recursive types, this will eventually try other members of the union to search for the base case

> [!TIP]
> If you prefer this to instead return undefined or null when applicable you can pass in the `preferUndefined: true` or `preferNull:true` option as a type parameter. If you prefer this behavior globally, you can add `preferUndefined: true` or `preferNull:true` as an option on the transformer in your `tsconfig.json` so that you have something like: 
> ```     
> "plugins": [
> ...
> {
> "transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"
> "preferUndefined": true
> ...
> }
> ...
> ```

> [!WARNING]  
> Note: A `newFixture` function with a type argument with an intersection containing any non-object will return just the default value for the non-object 
> 
> ex: `const test = newFixture<string & { property: string }Test>();` will result in `test = defaultString`

- **Unknown**: ‘defaultUnknown’

- **Void**: Nothing

> [!WARNING]  
> Note: there is currently no support for never or generics. Trying to do `newFixture<never>()` or `const testFunction = <T>(type: T) => newFixture<T>()` will result in a compile-time error.

# Options

The fixture generator has a number of options that can be used to customize the output of the `newFixture` function. These options can be set globally in your `tsconfig.json` or on a per-function basis. The available options (at the time of writing) are available below for convenience, however the full list of options available can be found on the `NewFixtureOptions` type in `fixture-transformer.options.ts`.

```typescript
export type NewFixtureOptions = {
  // By default, for union types which contain undefined we will use the other value.
  // This option flips that preference.
  preferUndefined?: boolean;
  // By default, for union types which contain null we will use the other value.
  // This option flips that preference.
  preferNull?: boolean;
  // By default, the first value in an enum will be used.
  // This option allows you to specify a different default strategy.
  defaultEnum?: DefaultEnumOption;
  // By default, undefined values will be explicit.
  // This option allows you to specify a different default strategy.
  defaultUndefined?: DefaultUndefinedOption;
};

```

To enable an option globally it can be added to the transformer in your `tsconfig.json` so that you have something like:

```json
"plugins": [
   ...
   {
       "transform": "@hippo-oss/fixture-generator/dist/src/fixture-transformer.export"
       "preferUndefined": true
        ...
   }
...
```

To enable an option on a per-function basis it can be passed as the second type parameter to the `newFixture` function so that you have something like:

```typescript
const typeFixtureWithDefaultUndefined = newFixture<Type, { preferUndefined: true }>()
```

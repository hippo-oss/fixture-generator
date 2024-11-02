export class ExplicitConstructorTestClass {
    testNumber!: number;
    testBoolean!: boolean;

    constructor() {
        this.testNumber = 200;
        this.testBoolean = false;
    }
}

export class ImplicitConstructorTestClass {
    testNumber!: number;
    testBoolean!: boolean;
}

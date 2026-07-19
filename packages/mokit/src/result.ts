enum Code {
    Success = 200,
    Failed = 500
}

export default class Result<T> {
    private readonly code: Code;
    private readonly data: T;

    private constructor(code: Code, data: T) {
        this.code = code;
        this.data = data;
    }

    public isSuccess() {
        return this.code == Code.Success
    }

    public getData() {
        return this.data;
    }

    public static success<D>(data: D) {
        return new Result(Code.Success, data);
    }

    public static failed() {
        return new Result(Code.Failed, null);
    }

}
export default class Objects {
    /**
     * 判断一个值是否为空。
     * - falsy 值（null、undefined、0、false、''、NaN 等）返回 true
     * - 非对象类型的非 falsy 值返回 false
     * - 空数组返回 true
     * - 无自身可枚举属性的对象返回 true
     */
    public static IsEmpty(obj: unknown): boolean {
        // falsy 值视为空
        if (!obj) return true;

        // 非对象类型的非 falsy 值不视为空
        if (typeof obj !== "object") return false;

        // 数组：长度为 0 即为空
        if (Array.isArray(obj)) return obj.length === 0;

        // 普通对象：无可枚举属性即为空
        return Object.keys(obj).length === 0;
    }
}
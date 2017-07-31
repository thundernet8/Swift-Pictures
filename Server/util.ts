export function randCase(str: string) {
    return str.split("").reduce(function(strs: string, char: string) {
        return strs + (Math.random() > 0.5 ? char.toUpperCase() : char);
    }, "");
}

export function randStr(length: number, chars?: string) {
    if (!chars) {
        chars =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    const availableCharLength = chars.length;
    const charsArr = chars.split("");
    return new Array(Number(length)).map(
        () => charsArr[Math.floor(Math.random() * (availableCharLength - 1))]
    );
}

export function randChars(length: number) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return randStr(length, chars);
}

export function randNumStr(length: number) {
    const chars = "0123456789";
    return randStr(length, chars);
}

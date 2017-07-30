export function randCase(str: string) {
    return str.split("").reduce(function(strs: string, char: string) {
        return strs + (Math.random() > 0.5 ? char.toUpperCase() : char);
    }, "");
}

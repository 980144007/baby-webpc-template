//本地储存sessionStorage
const deal = function(moduleName) {
    this.name = moduleName;
};
deal.prototype.parse = function (name) { // 读取
    const variableName = this.name ? `${this.name}-${name}` : name
    const val = window.sessionStorage.getItem(variableName) || window.localStorage.getItem(variableName);
    // console.log(variableName, val)
    if (val === null || val === '') {
        return val;
    } else if(val === 'undefined') {
        return undefined;
    } else {
        return JSON.parse(val)
    }
}

deal.prototype.setItem = function (obj, isSession = true) { // 写入
    for(let key in obj) {
        const variableName = this.name ? `${this.name}-${key}` : key;
        if(isSession) {
            window.sessionStorage.setItem(variableName, JSON.stringify(obj[key]));
        } else {
            window.localStorage.setItem(variableName, JSON.stringify(obj[key]));
        }
    }
    
}



export {
    deal
}

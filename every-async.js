(async function () {

    Object.defineProperty(Array.prototype, 'everyAsync', {
        value: async function (predicate = (x) => x) {

            let iterateValues = function* (funcs) {
                let index = 0;
                while (true) {
                    yield async () => {
                        let result = funcs[index] instanceof Function ? funcs[index]() : funcs[index];
                        index++;
                        if (result instanceof Promise) {
                            try {
                                return await result;
                            }
                            catch(error) {
                                console.error(error);
                            }
                        }
                        return Promise.resolve(result);
                    }
                }
            }
    
            let values = iterateValues(this);
            for (let i = 0; i < this.length; i++) {
                let result = await values.next().value();
                if (!predicate(result)) {
                    return false;
                }
            }
            return true;
        },
        writable: true,
        configurable: true
    });

    let numbers = [
        1,
        () => { console.log(2); return Promise.resolve(2) },
        () => { console.log(3); return 3; },
        () => { console.log(3); return Promise.resolve(3) },
    ];

    console.log(await numbers.everyAsync(x => x <= 3));

})();
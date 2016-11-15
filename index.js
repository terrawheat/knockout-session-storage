(function (ko) {
    ko.sessionStorage = {
        keyPrefix: '',
        save: function (viewModel, saveKey) {
            var ignoreProps = Object.keys(viewModel).filter(function (key) {
                return ko.isComputed(viewModel[key]) || (typeof viewModel[key] === 'function' && !ko.isObservable(viewModel[key]));
            });
            var includedProps = Object.keys(viewModel).filter(function (key) {
                return !ko.isObservable(viewModel[key]) && typeof viewModel[key] !== 'function' && typeof viewModel[key] !== 'object';
            });
            var saveKey = ko.sessionStorage.keyPrefix + '_' + saveKey;
            var toStore = ko.mapping.toJS(viewModel, { ignore: ignoreProps, include: includedProps });

            window.sessionStorage.setItem(saveKey, JSON.stringify(toStore));
        },
        _restoreObject: function (vm, data) {
            Object.keys(data).forEach(function (key) {
                if (typeof vm[key] === 'object' && !Array.isArray(vm[key])) {
                    return ko.sessionStorage._restoreObject(vm[key], data[key]);
                }

                if (ko.isObservable(vm[key])) {
                    return vm[key](data[key]);
                }

                return vm[key] = data[key];
            });
        },
        restore: function (viewModel, saveKey) {
            var savedData = sessionStorage.getItem(ko.sessionStorage.keyPrefix + '_' + saveKey);
            var restoredObj;

            try {
                restoredObj = JSON.parse(savedData);    
            } catch (err) {
                console.warn('Unsuccessfully deserialised sessionStorage state.' + e.message);
            }

            ko.sessionStorage._restoreObject(viewModel, restoredObj);            
        }
    }
}(window.ko));
(function (ko) {
    ko.sessionStorage = {
        /**
         * All entries in to the session storage are prefixed
         * with this string.
         */
        keyPrefix: '',
        /**
         * Saves an object to the database. Typically a view model.
         */
        save: function (viewModel, saveKey) {
            // Stops computed properties and prototype functions from being saved in to the storage.
            var ignoreProps = Object.keys(viewModel).filter(function (key) {
                return ko.isComputed(viewModel[key]) || (typeof viewModel[key] === 'function' && !ko.isObservable(viewModel[key]));
            });

            // Ensures that non-observable, non-function properties are still saved.
            var includedProps = Object.keys(viewModel).filter(function (key) {
                return !ko.isObservable(viewModel[key]) && typeof viewModel[key] !== 'function' && typeof viewModel[key] !== 'object';
            });

            var saveKey = ko.sessionStorage.keyPrefix + '_' + saveKey;
            var toStore = ko.mapping.toJS(viewModel, { ignore: ignoreProps, include: includedProps });

            window.sessionStorage.setItem(saveKey, JSON.stringify(toStore));
        },
        _restoreObject: function (vm, data) {
            // For each data point in the hydrated data
            Object.keys(data).forEach(function (key) {
                // Data point is a pojo, recurse
                if (typeof vm[key] === 'object' && !Array.isArray(vm[key])) {
                    return ko.sessionStorage._restoreObject(vm[key], data[key]);
                }

                // Data point is an observable, update
                if (ko.isObservable(vm[key])) {
                    return vm[key](data[key]);
                }

                // Data point is not observable, set
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
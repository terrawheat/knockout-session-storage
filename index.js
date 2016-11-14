(function (ko) {
    ko.sessionStorage = {
        save: function () {
            return 1;
        },
        restore: function () {
            return 2;
        }
    }
}(window.ko));
function isObservable(act) {
    return ko.isObservable(act);
}

var Sample = function () {
    this.valueEmptyString = ko.observable('');
    this.valueText = ko.observable('foo');
    this.valueNumber = ko.observable(123);
    this.valueTrue = ko.observable(true);
    this.valueFalse = ko.observable(false);
    this.valueZero = ko.observable(0);
    this.valueNaN = ko.observable(NaN);
    this.valueInfinity = ko.observable(Infinity);
    this.valueNegativeInfinity = ko.observable(-Infinity);
    this.valueNull = ko.observable(null);
    this.valueUndefined = ko.observable();
    this.valueArray = ko.observableArray([1, 2, 3, 'foo', 'bar']);
    this.valueObject = ko.observable({ foo: 'bar' });
    this.valueNested = {
        foo: ko.observable('foo'),
        bar: ko.observable(1),
        baz: ko.observableArray([1, 2])
    };

    this.nonObservableValue = 'foo';

    this.pureComputedProperty = ko.pureComputed(function () {
        return 30;
    });

    this.computedProperty = ko.computed(function () {
        return this.valueNumber();
    }, this);

    this.valueFunction = function () { return 'a'; }
};

window.ko.sessionStorage.keyPrefix = 'bb';

describe('Given a session storage saver', function () {
    var sStorage = window.ko.sessionStorage;

    describe('when serialising a view model to storage', function () {
        var result;

        beforeEach(function () {
            sStorage.save(new Sample(), 'test');
            result = JSON.parse(window.sessionStorage.getItem('bb_test'));
        });

        it('stores non-observed properties correctly', function () {
            assert.equal(result.nonObservableValue, 'foo');
        });

        it('stores numbers correctly', function () {
            assert.equal(result.valueNumber, 123, 'accepts regular numbers');
            assert.equal(result.valueZero, 0, 'accepts falsey numbers');
            // assert.notOk(result.valueNaN, 'accepts NaN');
            // assert.equal(result.valueInfinity, Infinity, 'accepts Infinity');
            // assert.equal(result.valueNegativeInfinity, -Infinity, 'accepts minus Infinity');
        });

        it('stores strings correctly', function () {
            assert.equal(result.valueText, 'foo', 'accepts regular strings');
            assert.equal(result.valueEmptyString, '', 'accepts falsey strings');
        });

        it('stores booleans correctly', function () {
            assert.equal(result.valueTrue, true);
            assert.equal(result.valueFalse, false);
        });

        it('stores empties correctly', function () {
            assert.isNull(result.valueNull);
            assert.isUndefined(result.valueUndefined);
        });

        it('stores arrays correctly', function () {
            assert.deepEqual(result.valueArray, [1,2,3,'foo','bar']);
        });

        it('stores observable objects correctly', function () {
            assert.deepEqual(result.valueObject, { foo: 'bar' });
        });

        it('stores objects of observables correctly', function () {
            assert.deepEqual(result.valueNested, { foo: 'foo', bar: 1, baz: [1, 2]});
        });

        it('does not store computed properties', function () {
            assert.notOk(result.computedProperty);
            assert.notOk(result.pureComputedProperty);
        })

        it('does not store prototypal functions', function () {
            assert.notOk(result.valueFunction);
        });
    });

    describe('when hydrating a stored model from storage', function () {
        var viewModel = new Sample();
        ko.sessionStorage.save(viewModel, 'test2');

        viewModel = new Sample();
        ko.sessionStorage.restore(viewModel);

        it('should restore non-observables correctly', function () {
            assert.notOk(isObservable(viewModel.nonObservableValue));
            assert.equal(viewModel.nonObservableValue, 'foo');
        });

        it('should restore numbers correctly', function () {
            assert.ok(isObservable(viewModel.valueNumber));
            assert.equal(viewModel.valueNumber(), 123);

            assert.ok(isObservable(viewModel.valueZero));
            assert.equal(viewModel.valueZero(), 0);

            // assert.ok(isObservable(viewModel.valueNaN));
            // assert.notOk(viewModel.valueNaN());

            // assert.ok(isObservable(viewModel.valueInfinity));
            // assert.equal(viewModel.valueInfinity(), Infinity);

            // assert.ok(isObservable(viewModel.valueNegativeInfinity));
            // assert.equal(viewModel.valueNegativeInfinity(), -Infinity);
        });

        it('should restore strings correctly', function () {
            assert.ok(isObservable(viewModel.valueText));
            assert.equal(viewModel.valueText(), 'foo');

            assert.ok(isObservable(viewModel.valueEmptyString));
            assert.equal(viewModel.valueEmptyString(), '');
        });

        it('should restore booleans correctly', function () {
            assert.ok(isObservable(viewModel.valueTrue));
            assert.equal(viewModel.valueTrue(), true);

            assert.ok(isObservable(viewModel.valueFalse));
            assert.equal(viewModel.valueFalse(), false);
        });

        it('should restore empties correctly', function () {
            assert.ok(isObservable(viewModel.valueNull));
            assert.isNull(viewModel.valueNull());

            assert.ok(isObservable(viewModel.valueUndefined));
            assert.isUndefined(viewModel.valueUndefined());
        });

        it('restores arrays correctly', function () {
            assert.ok(isObservable(viewModel.valueArray));
            assert.deepEqual(viewModel.valueArray(), [1, 2, 3, 'foo', 'bar']);
        });

        it('restores observable objects correctly', function () {
            assert.ok(isObservable(viewModel.valueObject));
            assert.deepEqual(viewModel.valueObject(), { foo: 'bar' });
        });

        it('restores objects of observables correctly', function () {
            assert.notOk(isObservable(viewModel.valueNested));
            assert.ok(isObservable(viewModel.valueNested.foo));
            assert.ok(isObservable(viewModel.valueNested.bar));
            assert.ok(isObservable(viewModel.valueNested.baz));
            
            assert.equal(viewModel.valueNested.foo(), 'foo');
            assert.equal(viewModel.valueNested.bar(), 1);
            assert.deepEqual(viewModel.valueNested.baz(), [1, 2]);
        });

        it('computed properties behave predictably after a restore', function () {
            assert.equal(viewModel.pureComputedProperty(), 30);
            assert.equal(viewModel.computedProperty(), 123);
        })

        it('prototypal functions are still present', function () {
            assert.equal(viewModel.valueFunction(), 'a');
        });
    });
});
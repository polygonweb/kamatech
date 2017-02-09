//=include dom4/build/dom4.js
//=include fontfaceobserver/fontfaceobserver.js

// вспом. функции
;(function(global) {

    function extend(dest, src) {
        var hasOwn = Object.hasOwnProperty;
        for (var key in src) {
            if (hasOwn.call(src, key)) {
                dest[key] = src[key];
            }
        };
        return dest;
    };

    function toArray(items) {
        return Array.prototype.slice.call(items);
    };

    global.utils = {
        extend: extend,
        toArray: toArray
    };

})(window.kamatech || (window.kamatech = {}));


// ajax
;(function(global) {
    var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;

    /**
     * xhr.readyState
     */
    var STATES = {
        UNSENT:           0, // начальное состояние
        OPENED:           1, // вызван open
        HEADERS_RECEIVED: 2, // получены заголовки
        LOADING:          3, // загружается тело (получен очередной пакет данных)
        DONE:             4  // запрос завершён
    };

    var STATUS_CODES = {
        SUCCESS: 200
    };

    /*
        Cобытия
        readystatechange - происходит несколько раз в процессе отсылки и получения ответа
        load – запрос был успешно (без ошибок) завершён.
        loadstart – запрос начат.
        loadend – запрос был завершён (успешно или неуспешно)
        progress – браузер получил очередной пакет данных, можно прочитать текущие полученные данные в responseText.
        abort – запрос был отменён вызовом xhr.abort().
        error – произошла ошибка.
        timeout – запрос был прекращён по таймауту.
    */

    /**
     * options
     * 
     * method
     * url
     * data
     * onError
     * onSuccess
     * onStart
     * onEnd
     * timeout
     * headers
     */
    var ajax = function(options) {
        var xhr = new XHR();

        xhr.open(options.method, options.url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState !== STATES.DONE) return;

            // status, statusText, responseText, responseXML
            if (xhr.status != STATUS_CODES.SUCCESS) {
                console.error(xhr.status + ': ' + xhr.statusText);
                options.onError && typeof options.onError === 'function' && options.onError(xhr);
            } else {
                // options.onComplete(xhr.responseText);
                options.onSuccess && typeof options.onSuccess === 'function' && options.onSuccess(xhr);
            }

            options.onEnd && typeof options.onEnd === 'function' && options.onEnd(xhr);
        };

        if (options.timeout) {
            xhr.timeout = options.timeout;
        }

        if (options.headers) {
            for (var key in options.headers) {
                if (options.headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, options.headers[key]);
                }
            }
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        // getResponseHeader(name)
        // getAllResponseHeaders()

        options.onStart && typeof options.onStart === 'function' && options.onStart();
        if (options.method !== 'GET') {
            xhr.send(options.data);
        } else {
            xhr.send();
        }

        return xhr;
    };

    global.ajax = ajax;
})(window.kamatech || (window.kamatech = {}));


// загрузка шрифтов 
;(function() {
    var fonts = [
        {
            name: 'Noto Sans',
            weight: 'normal',
            style: 'normal'
        },
        {
            name: 'Noto Sans',
            weight: 'normal',
            style: 'italic'
        },
        {
            name: 'Noto Sans',
            weight: 'bold',
            style: 'normal'
        },
        {
            name: 'Proxima Nova',
            weight: 'bold',
            style: 'normal'
        },
        {
            name: 'Proxima Nova',
            weight: '600',
            style: 'normal'
        }
    ];

    var html = document.documentElement;

    html.classList.add('fonts-loading');

    // if (sessionStorage.fontsLoaded) {
    //     html.classList.remove('fonts-loading');
    //     html.classList.add('fonts-loaded');
    //     return;
    // }

    Promise
        .all(fonts.map(function(font) {
            return (new FontFaceObserver(font.name, {
                style: font.style,
                weight: font.weight
            })).load();
        }))
        .then(function () {
            html.classList.remove('fonts-loading');
            html.classList.add('fonts-loaded');
            // sessionStorage.fontsLoaded = true;
        })
        .catch(function () {
            html.classList.remove('fonts-loading');
            html.classList.add('fonts-failed');
            // sessionStorage.fontsLoaded = false;
        });
})();


// карта
;(function(global) {
    var API_KEY = 'AIzaSyATChWoThtyf2pUXNHJY-rS_rSR9Ev2THw';
    var scriptSrc = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&callback=initMap';
    var mapStyles = [
        {
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "gamma": 1
                },
                {
                    "lightness": 10
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "landscape.natural",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#5dff00"
                },
                {
                    "gamma": 4.97
                },
                {
                    "lightness": -5
                },
                {
                    "saturation": -100
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#bdc0c2"
                },
                {
                    "lightness": -15
                },
                {
                    "saturation": 0
                }
            ]
        }
    ];
    var pos = {
        lat: 58.000447,
        lng: 56.261874
    };
    var map;
    var markerImage;
    var marker;

    function initMap() {
        var options = {
            center: pos,
            styles: mapStyles,
            zoom: 17,
            minZoom: 12,
            maxZoom: 19,
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            // scaleControl: true,
            // scaleControlOptions: {},

            // zoomControl: true,
            // zoomControlOptions: {
            //     position: google.maps.ControlPosition.RIGHT_CENTER
            // },

            // streetViewControl: true,
            // streetViewControlOptions: {
            //     position: google.maps.ControlPosition.LEFT_TOP
            // },

            overviewMapControl: false,
            overviewMapControlOptions: {},

            panControl: true,
            panControlOptions: {}
        };
        var elem = document.getElementById('map');
        // this.options = global.utils.extend({}, this.defaults);
        // this.options = global.utils.extend(this.options, opts);
        // var markerImage = new google.maps.MarkerImage('assets/img/marker.png');
        markerImage = new google.maps.MarkerImage('assets/img/marker.png', null, null, null, new google.maps.Size(212, 51));
        map = new google.maps.Map(elem, options);
        marker = new google.maps.Marker({
            map : map,
            position: pos,
            icon : markerImage,
            title: 'Кама Технологии'
        });

        marker.addListener('click', function() {
            if (typeof global.modal === 'function') {
                var modalElem = document.getElementById('mail');
                modalElem && global.modal(modalElem).open();
            }
        });
    };

     function loadScript() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = scriptSrc;
        document.body.appendChild(script);
    };

    window.initMap = initMap;
    window.addEventListener('load', loadScript, {once: true});
})(window.kamatech || (window.kamatech = {}));


// меню
;(function(global) {
    var SELECTOR = '.menu-item';
    var ACTIVE_CLASS = 'menu-item_active';

    var menu = (function() {
        var items;
        var list;

        function init() {
            var toArray = global.utils.toArray;
            items = toArray(document.querySelectorAll(SELECTOR));
            list = document.querySelector('.menu-list');
            if (!items && !list) return;
            bindEvents();
            setTimeout(function() {
                items[0].classList.add(ACTIVE_CLASS);
            }, 1500);
        };

        function bindEvents() {
            document.addEventListener('click', function(e) {
                var curItem = e.target.closest(SELECTOR);

                if (curItem) {
                    items.forEach(function(item) {
                        var body = item.querySelector('.menu-item__body');
                        if (item !== curItem) {
                            item.classList.remove(ACTIVE_CLASS);
                            body.style.height = '';
                        } else {
                            if (curItem.classList.contains(ACTIVE_CLASS)) {
                                body.style.height = '';
                            } else {
                                body.style.height = body.scrollHeight + 'px';
                            };
                            curItem.classList.toggle(ACTIVE_CLASS);
                        }
                    });
                    e.preventDefault();
                    return;
                }

                if (!list.contains(e.target)) {
                    items.forEach(function(item) {
                        item.classList.remove(ACTIVE_CLASS);
                        var body = item.querySelector('.menu-item__body');
                        body.style.height = '';
                    });
                    return;
                }
            });
        };

        return {
            init: init
        };
    })();

    // global.menu = menu;
    menu.init();

})(window.kamatech || (window.kamatech = {}));


// модальное окно
;(function(global) {
    var body = document.body;

    function modal(elem) {
        if (!elem.classList.contains('modal')) {
            return null;
        }

        return {
            open: function() {
                elem.classList.add('modal_open');
                body.style.overflow = 'hidden';
                return this;
            },
            close: function() {
                elem.classList.remove('modal_open');
                body.style.overflow = '';
                return this;
            },
            toggle: function() {
                elem.classList.toggle('modal_open');
                ody.style.overflow = elem.classList.contains('modal_open') ? 'hidden' : '';
                return this;
            },
        }
    };

    document.addEventListener('click', function(e) {
        var closeBtn = e.target.closest('.modal__close');
        if (closeBtn) {
            var modalElem = closeBtn.closest('.modal');
            modal(modalElem).close();
        }
    });

    document.addEventListener('keyup', function(e) {
        var modalElem = document.querySelector('.modal_open');
        if (e.keyCode == 27 && modalElem) {
            modal(modalElem).close();
        }
    });

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-modal]');
        if (btn) {
            var modalSelector = btn.getAttribute('data-modal') || btn.hash;
            var modalElem = document.querySelector(modalSelector);
            modal(modalElem).open();
            e.preventDefault();
        }
    });

    global.modal = modal;
})(window.kamatech || (window.kamatech = {}));


// полe ввода
;(function(global) {
    // типы и правила валидации полей
    var validateRules = {};
    validateRules['notempty'] = function(value) {
        return value.trim().length > 0;
    };

    validateRules['email'] = function(value) {
        var re = /^([a-z0-9_\.-]+)@([a-zа-я0-9_\.-]+)\.([a-zа-я\.]{2,6})$/;
        return re.test(value);
    };

     validateRules['tel'] = function(value) {
        var re = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
        return re.test(value);
    };

    var toArray = global.utils.toArray;
    var FOCUS_CLASS = 'field_focus';
    var ERROR_CLASS = 'field_error';

    function Field(elem) {
        this.elem = elem;
        this.input = elem.querySelector('.field__input');
        this.checkFilled();
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange= this.onChange.bind(this);
        this.setValidators();
        this.bindEvents();
    }

    Field.prototype.setValidators = function() {
        var self = this;
        self.validators = [];
        if (this.input.hasAttribute('data-rules')) {
            this.input.getAttribute('data-rules')
                .split(',')
                .forEach(function(rule) {
                    var name = rule.trim();
                    if (!!validateRules[name] && typeof validateRules[name] === 'function') {
                        self.validators.push(validateRules[name]);
                    };
                });
        }
    }

     Field.prototype.checkFilled = function() {
        var self = this,
            elem = self.elem,
            input = self.input;

        if(input.value.trim().length > 0) {
            elem.classList.add('field_filled');
        } else {
            elem.classList.remove('field_filled');
        }
    }

    Field.prototype.onFocus = function() {
        this.elem.classList.add(FOCUS_CLASS);
    }

    Field.prototype.onBlur = function() {
        this.elem.classList.remove(FOCUS_CLASS);
        this.checkFilled();
    }

    Field.prototype.onChange = function() {
        this.validate();
        // if (this.validate()) {
        //     this.elem.classList.remove(ERROR_CLASS);
        // } else {
        //     this.elem.classList.add(ERROR_CLASS);
        // }
    }

    Field.prototype.validate = function() {
        var isFailed = false;
        var self = this;
        var validators = self.validators;
        if (validators.length > 0) {
            isFailed = validators.some(function(validator) {
                return !validator(self.input.value);
            });
        }
        if (isFailed) {
            self.elem.classList.add(ERROR_CLASS);
            return false;
        } else {
            self.elem.classList.remove(ERROR_CLASS);
            return true;
        }
    }

    Field.prototype.bindEvents = function() {
        this.input.addEventListener('focus', this.onFocus);
        this.input.addEventListener('blur', this.onBlur);
        this.input.addEventListener('change', this.onChange);
        this.input.addEventListener('input', this.onChange);
    }

    global.Field = Field;
})(window.kamatech || (window.kamatech = {}));


// отправка формы
;(function(global) {
    var toArray = global.utils.toArray;
    var Field = global.Field;
    var SELECTOR = '.send-mail-form';
    var REQ_START = 'send-mail-form__req_start';
    var REQ_END = 'send-mail-form__req_end';
    var REQ_SUCCESS = 'send-mail-form__req_success';
    var REQ_ERROR = 'send-mail-form__req_error';

    function MailForm() {
        var form = document.querySelector(SELECTOR);
        if (!form) return;
        this.form = form;
        this.fields = toArray(this.form.querySelectorAll('.field'))
            .map(function(fieldElem) {
                return new Field(fieldElem);
            });
        this.submitButton = form.querySelector('button[type="submit"]');
        this.onSubmit = this.onSubmit.bind(this);
        this.onStart = this.onStart.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
        this._messageDelay = 4000;
        this.bindEvents();
    }

    MailForm.prototype.validate = function() {
        var fields = this.fields;
        return fields.every(function(field) {
            return field.validate();
        });
    }

    MailForm.prototype.submit = function() {
        var url = this.form.action;
        var method = this.form.method;
        var data = new FormData(this.form);
        var ajax = global.ajax;
        ajax({
            url: url,
            method: method,
            data: data,
            onStart: this.onStart,
            onEnd: this.onEnd,
            onError: this.onError,
            onSuccess: this.onSuccess
        });
    }
    
    MailForm.prototype.onStart = function() {
        this.form.classList.add(REQ_START);
    }

    MailForm.prototype.onEnd = function() {
        var self = this;
        self.form.classList.remove(REQ_START);
        self.form.classList.add(REQ_END);
        setTimeout(function() {
            self.clearClasses();
            self.form.reset();
        }, self._messageDelay);
    }

    MailForm.prototype.onSuccess = function() {
        var self = this;
        self.form.classList.add(REQ_SUCCESS);
        setTimeout(function() {
            var modalElem = self.form.closest('.modal');
            modalElem && global.modal(modalElem).close();
        }, self._messageDelay);
    }

    MailForm.prototype.onError = function() {
        this.form.classList.add(REQ_ERROR);
    }
    
    MailForm.prototype.onSubmit = function(e) {
        if (this.validate()) {
            this.submit();
        }
        e.preventDefault();
    }
    
    MailForm.prototype.clearClasses = function() {
        this.form.classList.remove(REQ_START);
        this.form.classList.remove(REQ_END);
        this.form.classList.remove(REQ_SUCCESS);
        this.form.classList.remove(REQ_ERROR);
    }

    MailForm.prototype.bindEvents = function() {
        this.form.addEventListener('submit', this.onSubmit);
    };

    var mailForm = new MailForm();

})(window.kamatech || (window.kamatech = {}));
/// <reference path="lib.interfaces.ts" />
"use strict";

function $(data) {
    return new $.lib(data);
}
var $;
(function ($) {
    var lib = (function () {
        function lib(data) {
            if (data instanceof Node) {
                // Single node, just create new list with single item
                this.ns = [data];
            } else if (data instanceof NodeList) {
                // reinstance from a node list
                this.ns = Array.prototype.slice.call(data);
            } else if (typeof data === "string") {
                // default with selector
                this.ns = Array.prototype.slice.call(document.querySelectorAll(data));
            } else if (data instanceof Function) {
                // to support dom ready event shortcut
                var ready = function ready() {
                    document.removeEventListener("DOMContentLoaded", ready, false);
                    data();
                };
                document.addEventListener("DOMContentLoaded", ready, false);
            } else {
                // default return empty
                this.ns = [];
            }
        }
        lib.prototype.get = function (index) {
            return this.ns[index];
        };
        /** The number of nodes in the current selection */
        lib.prototype.length = function () {
            return this.ns.length;
        };
        /** Loop through all the nodes in the current selection */
        lib.prototype.each = function (callback) {
            this.ns.forEach(callback);
            return this;
        };
        /** Starts to listen on the specified events for nodes in the current selection */
        lib.prototype.on = function (event, callback) {
            var events = event.split(" ");
            this.each(function (item) {
                for (var i = 0; i < events.length; i++) {
                    item.addEventListener(events[i], callback, false);
                }
            });
            return this;
        };
        lib.prototype.attr = function (attr, value) {
            if (value === undefined) {
                if (this.ns.length > 0) {
                    return this.ns[0].getAttribute(attr);
                }
                return undefined;
            } else {
                this.each(function (item) {
                    item.setAttribute(attr, value);
                });
                return this;
            }
        };
        lib.prototype.data = function (name, value) {
            // check if browser supports the data tag
            if (this.ns.length > 0 && "dataset" in this.ns[0]) {
                if (value === undefined) {
                    return this.ns[0].dataset[name];
                } else {
                    this.each(function (item) {
                        item.dataset[name] = value;
                    });
                    return this;
                }
            } else {
                // if browser does not support the data tag, fallback to the attribute
                return this.attr("data-" + name.replace(/[A-Z]/g, function (match) {
                    return "-" + match.toLowerCase();
                }), value);
            }
        };
        /** Adds the specified class(es) to the nodes in the current selection */
        lib.prototype.addClass = function (name) {
            var classes = name.split(" ");
            this.each(function (item) {
                for (var i = 0; i < classes.length; i++) {
                    item.classList.add(name);
                }
            });
            return this;
        };
        /** Removes the specified class(es) from the nodes in the current selection */
        lib.prototype.removeClass = function (name) {
            var classes = name.split(" ");
            this.each(function (item) {
                for (var i = 0; i < classes.length; i++) {
                    item.classList.remove(classes[0]);
                }
            });
            return this;
        };
        /** Toggles the specified class(es) on the nodes in the current selection */
        lib.prototype.toggleClass = function (name) {
            var classes = name.split(" ");
            this.each(function (item) {
                for (var i = 0; i < classes.length; i++) {
                    item.classList.toggle(name);
                }
            });
            return this;
        };
        lib.prototype.hasClass = function (name) {
            if (this.length() > 0) {
                return this.ns[0].classList.contains(name);
            }
        };
        /** Find all child elements of the nodes in the current selection */
        lib.prototype.find = function (selector) {
            var lib = $(null);
            this.each(function (item) {
                lib.ns = lib.ns.concat(Array.prototype.slice.call(item.querySelectorAll(selector)));
            });
            return lib;
        };
        lib.prototype.css = function (style, value) {
            if (typeof style === "string" && value === undefined) {
                if (this.length() > 0) {
                    return this.ns[0].style[css.get(style)];
                }
                return undefined;
            } else if (typeof style === "string" && value !== undefined) {
                var styleName = css.get(style);
                this.each(function (item) {
                    item.style[styleName] = value;
                });
            } else if (style instanceof Object) {
                for (var propertyName in style) {
                    var styleName = css.get(propertyName);
                    if (styleName !== undefined) {
                        this.each(function (item) {
                            item.style[styleName] = style[propertyName];
                        });
                    }
                }
            }
            return this;
        };
        /** Gets the closests parent that matches the specified selector of the first node in the current selection. */
        lib.prototype.closest = function (selector) {
            if (this.length() > 0) {
                var element = this.ns[0].parentNode,
                    func;
                while (element) {
                    if (element[js.matches](selector)) {
                        return $(element);
                    }
                    element = element.parentNode;
                }
            }
            return $(null);
        };
        return lib;
    })();
    $.lib = lib;
    var css = (function () {
        function css() {}
        /** Initializes the css class, by fetching all available styles from the browser and storing them in a variable. */
        css.init = function () {
            // get all possible styles of the web browser and merge them to a searchable string, seperated by a space
            var styles = "",
                stylesObj = window.getComputedStyle(document.documentElement, '');
            for (var style in stylesObj) {
                if (style !== undefined) {
                    styles += style + " ";
                }
            }
            return styles;
        };
        /** Gets the property name of the entered style name, with browser prefix if available. */
        css.get = function (styleName) {
            if (styleName !== undefined) {
                styleName = styleName.replace(/-(.)/g, function (match, match2) {
                    return match2.toUpperCase();
                });
                var res = css.ss.match(new RegExp("(^|\\s)(moz|ms|webkit|o)?" + styleName + "(\\s|$)", "i"));
                if (res !== null && res.length > 0) {
                    return res[0].trim();
                }
            }
            return undefined;
        };
        css.ss = css.init();
        return css;
    })();
    var js = (function () {
        function js() {}
        js.init = function () {
            var element = document.documentElement;
            return (element.matches || element.matchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector).name;
        };
        js.matches = js.init();
        return js;
    })();
    /** Performs an AJAX request to fetch data from the server. */
    function ajax(settings) {
        var xmlhttp, sendData, data;
        if (settings === undefined || settings.url === undefined) {
            return;
        }
        // create ajax object
        xmlhttp = new XMLHttpRequest();
        if (settings.success) {
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        // return the result to the success method, depending on what return type is specified
                        if (settings.type && settings.type.toLowerCase() === "json") {
                            settings.success(JSON.parse(xmlhttp.responseText));
                        } else if (settings.type && settings.type.toLowerCase() === "xml") {
                            settings.success(xmlhttp.responseXML);
                        } else {
                            settings.success(xmlhttp.responseText);
                        }
                    }
                } else {
                    // fetch errors and send to the error method if specified
                    if (settings.error !== undefined) {
                        settings.error(xmlhttp.status, xmlhttp.statusText);
                    }
                }
            };
        }
        // fetch errors and send to the error method if specified
        if (settings.error) {
            xmlhttp.onerror = function () {
                settings.error(xmlhttp.status, xmlhttp.statusText);
            };
        }
        // set the _ cache query parameter if caching is set to false
        if (settings.cache && settings.cache === false) {
            if (settings.url.indexOf("?") === -1) {
                settings.url += "?_=" + Date.now();
            } else {
                settings.url += "&_=" + Date.now();
            }
        }
        // create the send data string
        if (settings.data) {
            data = settings.data;
            sendData = [];
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    sendData.push(encodeURIComponent(property) + "=" + encodeURIComponent(data[property]));
                }
            }
            sendData = sendData.join("&");
        }
        // if method is GET, append the send data is not empty
        if ((settings.method || settings.method === "GET") && sendData) {
            if (settings.url.indexOf("?") === -1) {
                settings.url += "?" + sendData;
            } else {
                settings.url += "&" + sendData;
            }
        }
        // setup the request
        xmlhttp.open(settings.method ? settings.method : "GET", settings.url, settings.async ? settings.async : true);
        if (settings.method === "POST") {
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("Content-length", sendData.length);
            xmlhttp.setRequestHeader("Connection", "close");
            xmlhttp.send(sendData);
        } else {
            xmlhttp.send();
        }
    }
    $.ajax = ajax;
})($ || ($ = {}));
//# sourceMappingURL=lib.js.map


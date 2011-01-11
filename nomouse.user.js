// ==UserScript==
// @name NoMouse
// @namespace http://github.com/brendoncrawford/nomouse
// @description
//     Intuitive keyboard browsing. Windows users: hit
//     SHIFT+SPACEBAR to activate. OSX users: hit OPTION
//     (or ALT) to activate. To change activation key(s),
//     go to "about:config", and change "nomouse.trigger".
//     To change the labels keys, search for "nomouse.labels". While
//     holding down activation key(s), select the letters corresponding
//     to the item you want to click.
// ==/UserScript==

(function (){

    /**
     * KeyCommander
     */
    kc = {};
    kc.stackWiper = null;
    kc.keyStack = {};
    kc.listeners = [];
    kc.p = {
        o : {
            osx : false,
            win : false,
            linux : false
        },
        b : {
            gecko : false,
            webkit : false,
            opera : false,
            ie : false
        }
    };

    /**
     * PLATFORM SPECIFIC NOTES
     * - Firefox/OSX
     *    - Unfixable
     *        - No alt+e
     *        - No alt+i
     *        - No alt+n
     *        - No alt+u
     *        - Cannot stack printable characters with alt
     *        - Cannot stack more than 5 printable characters
     *        - Ctrl with any number will not register multiple times
     *          on keypress
     *        - Cannot properly detect ctrl+semicolon
     *    - Fixed
     *        - Any printable character used with alt will not register
     *          a valid keyup
     *
     * - Firefox/Win
     *    - Fixed
     *        - Alt with any other key will not register a keyup
     */
     kc.map = {
         'ESC' : { v : '[Esc]', p : false, k : 27, s : [], c : [] },
         'F1' : { v : 'F1', p : false, k : 112, s : [], c : [] },
         'F2' : { v : 'F2', p : false, k : 113, s : [], c : [] },
         'F3' : { v : 'F3', p : false, k : 114, s : [], c : [] },
         'F4' : { v : 'F4', p : false, k : 115, s : [], c : [] },
         'F5' : { v : 'F5', p : false, k : 116, s : [], c : [] },
         'F6' : { v : 'F6', p : false, k : 117, s : [], c : [] },
         'F7' : { v : 'F7', p : false, k : 118, s : [], c : [] },
         'F8' : { v : 'F8', p : false, k : 119, s : [], c : [] },
         'F9' : { v : 'F9', p : false, k : 120, s : [], c : [] },
         'F10' : { v : 'F10', p : false, k : 121, s : [], c : [] },
         'F11' : { v : 'F11', p : false, k : 122, s : [], c : [] },
         'F12' : { v : 'F12', p : false, k : 123, s : [], c : [] },
         'TICK' : { v : '`', p : true, k : 192, s : [], c : [ 96, 126 ] },
         'HYPHEN' : { v : '-', p : true, k : 45, s : [],
                      c : [ 95, 8211, 8212 ] },
         'PLUS' : { v : '+', p : true, k : 43, s : [], c : [ 177 ] },
         'BACKSPACE' : { v : '[BckSpce]', p : false, k : 8, s : [], c : [] },
         'DELETE' : { v : '[Del]', p : false, k : 46, s : [], c : [] },
         'TAB' : { v : '[Tab]', p : false, k : 9, s : [], c : [] },
         'BRACKET_LEFT' : { v : '[', p : true, k : 219, s : [],
                            c : [ 91, 27, 123, 8220, 8221 ] },
         'BRACKET_RIGHT' : { v : ']', p : true, k : 221, s : [],
                             c : [ 93, 29, 125, 8216, 8217 ] },
         'SLASH_BACK' : { v : '\\', p : true, k : 220, s : [],
                          c : [ 92, 28, 124, 171, 187 ] },
         'ARROW_UP' : { v : '[ArrowUp]', p : false, k : 38, s : [], c : [] },
         'ARROW_DOWN' : { v : '[ArrowDn]', p : false, k : 40, s : [], c : [] },
         'ARROW_LEFT' : { v : '[ArrowLt]', p : false, k : 37, s : [], c : [] },
         'ARROW_RIGHT' : { v : '[ArrowRt]', p : false, k : 39, s : [], c : [] },
         'SHIFT' : { v : '[Shift]', p : false, k : 16, s : [], c : [] },
         'CONTROL' : { v : '[Ctrl]', p : false, k : 17, s : [], c : [] },
         'ALT' : { v : '[Alt]', p : false, k : 18, s : [], c : [] },
         'COMMAND' : { v : '[CMD]', p : false, k : 224, s : [], c : [] },
         'A' : { v : 'a', p : true, k : 65, s : [], c : [ 65, 97, 229, 197 ] },
         'B' : { v : 'b', p : true, k : 66, s : [],
                 c : [ 66, 98, 8747, 305 ] },
         'C' : { v : 'c', p : true, k : 67, s : [], c : [ 67, 99, 231, 199 ] },
         'D' : { v : 'd', p : true, k : 68, s : [],
                 c : [ 68, 100, 8706, 206 ] },
         'E' : { v : 'e', p : true, k : 69, s : [], c : [ 69, 101, 180 ] },
         'F' : { v : 'f', p : true, k : 70, s : [], c : [ 70, 102, 402, 207 ] },
         'G' : { v : 'g', p : true, k : 71, s : [], c : [ 71, 103, 169, 733 ] },
         'H' : { v : 'h', p : true, k : 72, s : [], c : [ 72, 104, 729, 211 ] },
         'I' : { v : 'i', p : true, k : 73, s : [], c : [ 73, 105, 710 ] },
         'J' : { v : 'j', p : true, k : 74, s : [], c : [ 74, 106, 8710, 212 ] },
         'K' : { v : 'k', p : true, k : 75, s : [],
                 c : [ 75, 107, 730, 63743 ] },
         'L' : { v : 'l', p : true, k : 76, s : [], c : [ 76, 108, 172, 210 ] },
         'M' : { v : 'm', p : true, k : 77, s : [], c : [ 77, 109, 181, 194 ] },
         'N' : { v : 'n', p : true, k : 78, s : [], c : [ 78, 110, 732 ] },
         'O' : { v : 'o', p : true, k : 79, s : [], c : [ 79, 111, 248, 216 ] },
         'P' : { v : 'p', p : true, k : 80, s : [], c : [ 80, 112, 960, 8719 ] },
         'Q' : { v : 'q', p : true, k : 81, s : [], c : [ 81, 113, 339, 338 ] },
         'R' : { v : 'r', p : true, k : 82, s : [], c : [ 82, 114, 174, 8240 ] },
         'S' : { v : 's', p : true, k : 83, s : [], c : [ 83, 115, 223, 205 ] },
         'T' : { v : 't', p : true, k : 84, s : [], c : [ 84, 116, 8224, 711 ] },
         'U' : { v : 'u', p : true, k : 85, s : [], c : [ 85, 117, 168 ] },
         'V' : { v : 'v', p : true, k : 86, s : [],
                 c : [ 86, 118, 8730, 9674 ] },
         'W' : { v : 'w', p : true, k : 87, s : [],
                 c : [ 87, 119, 8721, 8222 ] },
         'X' : { v : 'x', p : true, k : 88, s : [], c : [ 88, 120, 8776, 731 ] },
         'Y' : { v : 'y', p : true, k : 89, s : [], c : [ 89, 121, 165, 193 ] },
         'Z' : { v : 'z', p : true, k : 90, s : [], c : [ 90, 122, 937, 184 ] },
         'EQUAL' : { v : '=', p : true, k : 61, s : [ 221 ], c : [ 61, 8800 ] },
         'SPACE' : { v : '[SpaceBar]', p : false, k : 32, s : [ 192 ],
                     c : [ 32, 160 ] },
         'ONE' : { v : '1', p : true, k : 49, s : [ 81 ],
                   c : [ 49, 33, 161, 8260 ] },
         'TWO' : { v : '2', p : true, k : 50, s : [ 82 ],
                   c : [ 50, 64, 8482, 8364 ] },
         'THREE' : { v : '3', p : true, k : 51, s : [ 83 ],
                     c : [ 51, 35, 164, 8249 ] },
         'FOUR' : { v : '4', p : true, k : 52, s : [ 84 ],
                    c : [ 52, 36, 162, 8250 ] },
         'FIVE' : { v : '5', p : true, k : 53, s : [ 85 ],
                    c : [ 53, 37, 8734, 64257 ] },
         'SIX' : { v : '6', p : true, k : 54, s : [ 86 ],
                   c : [ 54, 94, 167, 64258 ] },
         'SEVEN' : { v : '7', p : true, k : 55, s : [ 87 ],
                     c : [ 55, 38, 182, 8225 ] },
         'EIGHT' : { v : '8', p : true, k : 56, s : [ 88 ],
                     c : [ 56, 42, 8226, 176 ] },
         'NINE' : { v : '9', p : true, k : 57, s : [ 89 ],
                    c : [ 57, 40, 170, 183 ] },
         'ZERO' : { v : '0', p : true, k : 48, s : [ 80 ],
                    c : [ 48, 41, 186, 8218 ] },
         'SEMICOLON' : { v : ';', p : true, k : 59, s : [ 219 ],
                         c : [ 59, 58, 8230, 218 ] },
         'QUOTE_SINGLE' : { v : '\'', p : true, k : 222, s : [ 71 ],
                            c : [ 39, 34, 230, 198 ] },
         'RETURN' : { v : '[Return]', p : false, k : 13, s : [ 77, 67 ],
                      c : [] },
         'COMMA' : { v : ',', p : true, k : 188, s : [ 76 ],
                     c : [ 44, 60, 8804, 175 ] },
         'PERIOD' : { v : '.', p : true, k : 190, s : [ 78 ],
                      c : [ 46, 62, 8805, 728 ] },
         'SLASH_FORWARD' : { v : '/', p : true, k : 191, s : [ 79 ],
                             c : [ 47, 63, 247, 191 ] }
    };

    /**
     * Init
     *
     * @return {Bool}
     */
    kc.init = function () {
        var nav;
        unsafeWindow.document.onkeypress = new Function;
        unsafeWindow.document.onkeydown = new Function;
        unsafeWindow.document.onkeyup = new Function;
        kc.bind( document, 'keypress', kc.process );
        kc.bind( document, 'keydown', kc.process );
        kc.bind( document, 'keyup', kc.process );
        nav = window.navigator.userAgent.toString();
        //browser
        if (window.opera) {
            kc.p.b.opera = true;
        }
        else if (nav.match(/(khtml|safari|webkit)/i)) {
            kc.p.b.webkit = true;
        }
        else if (nav.match(/gecko/i)) {
            kc.p.b.gecko = true;
        }
        else if (nav.match(/msie/i)) {
            kc.p.b.ie = true;
        }
        //os
        if (nav.match(/windows/i)) {
            kc.p.o.win = true;
        }
        else if (nav.match(/macintosh/i)) {
            kc.p.o.osx = true;
        }
        else if (nav.match(/linux/i)) {
            kc.p.o.linux = true;
        }
        return true;
    };

    /**
     * Cant catch all the keys everytime,
     * so we need to clear the stack
     *
     * @return {Bool}
     */
    kc.clearStack = function () {
        if (kc.stackWiper !== null) {
            window.clearTimeout(kc.stackWiper);
        }
        kc.stackWiper = window.setTimeout(function () {
            kc.keyStack = {};
        }, 30000);
        return true;
    };

    /**
     * Process
     *
     * @return {Bool}
     */
    kc.process = function (_) {
        var e, action, popper, exists, popper_first, popper_last;
        if (_) {
            e = _;
        }
        else if (window.event) {
            e = window.event;
        }
        else {
            return true;
        }
        kc.clearStack();
        action = kc.getAction(e.keyCode, e.charCode);
        if (e.type === 'keydown' && !action.printable && 
                action.found && !kc.searchStack({name:action.name})) {
            kc.pushStack(action.name, action);
            kc.dispatch(action, 'down', e);
        }
        else if (e.type === 'keypress' && action.found) {
            if (!kc.searchStack({name:action.name})) {
                kc.pushStack(action.name, action);
                kc.dispatch(action, 'down', e);
            }
            else {
                kc.dispatch(action, 'press', e);     
            }
        }
        else if( e.type === 'keyup' ) {
            if (action.found) {
                popper = kc.searchStack({keyCode:action.keyCode});
            }
            else {
                popper = kc.searchStack({position:'last'});
            }
            kc.dispatch(action, 'up', e);
            kc.popStack(popper.name);
            /**
             * ff-win alt bug
             * Since we cant register a keyup for alt when it is ustacked
             * below anther character, we need to fake register the keyup when
             * the key above it is registered this is not a perfect implementation,
             * but it works for the most part
             */
            if (kc.p.o.win && kc.p.b.gecko) {
                popper_first = kc.searchStack({position:'first'});
                popper_last = kc.searchStack({position:'last'});
                if(popper_last && popper_last.name === 'ALT') {
                    if ((action.name === 'SHIFT' ||
                            action.name === 'CONTROL') ||
                            (popper_first && popper_first.name === 'ALT')) {
                        kc.dispatch(action, 'up', e);
                        kc.popStack('ALT');
                    }
                }
            }
        }
        return true;
    };

    /**
     * Clone Elements
     *
     * @param {Object|String} arr
     */
    kc.clone = function (arr) {
        var i, _i, temp;
        if (typeof arr !== 'object') {
            return arr;
        }
        else {
            if(arr.concat) {
                temp = [];
                for(i = 0, _i = arr.length; i < _i; i++) {
                    temp[i] = arguments.callee(arr[i]);
                }
            }
            else {
                temp = {};
                for (i in arr) {
                    if (arr.hasOwnProperty(i)) {
                        temp[i] = arguments.callee(arr[i]);
                    }
                }
            }
            return temp;
        }
    };

    /**
     * Register Keys
     *
     * @param {Array} _keys
     * @param {String} type
     * @param {Function} callback
     * @return {Bool}
     */
    kc.register = function (_keys, type, callback) {
        //Need to clone the keys object
        kc.listeners[kc.listeners.length] = {
            keys : kc.clone(_keys),
            type : type,
            callback : callback
        };
        return true;
    };

    kc.dispatch = function(action, type, evt) {
        var i, _i, listener, item, listen_count, stack_count,
            cb_return, isType, k, _k, t, _t;
        for (i = 0, _i = kc.listeners.length; i < _i; i++) {
            listener = kc.listeners[i];
            item = null;
            listen_count = 0;
            stack_count = 0;
            isType = false;
            // Determine listener type
            if ((typeof listener.type).toLowerCase() !== 'string') {
                for (t = 0, _t = listener.type.length; t < _t; t++) {
                    if (listener.type[t] === type) {
                        isType = true;
                        break;
                    }
                }
            }
            else if (listener.type === type) {
                isType = true;
            }
            if (isType) {
                for(item in kc.keyStack) {
                    if (kc.keyStack.hasOwnProperty(item)) {
                        for (k = 0, _k = listener.keys.length; k < _k; k++) {
                            if (listener.keys[k] === item) {
                                listen_count++;
                            }
                        }
                        stack_count++;
                    }
                }
                // Callback executer
                if (listen_count > 0 && listen_count === stack_count &&
                        listen_count === listener.keys.length) {
                    cb_return = listener.callback(action, type);
                    if (!cb_return) {
                        kc.killEvent(evt);
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            }
        }
        return true;
    };

    /**
     * Kill Event
     *
     * @param {Event} evt
     * @return {Bool}
     */
    kc.killEvent = function (evt) {
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        return true;
    };


    /**
     * Push to stack
     * 
     * @param {String} name
     * @param {String} val
     * @return {Bool}
     */
    kc.pushStack = function (name, val) {
        kc.keyStack[name] = val;
        return true;
    };

    /**
     * Search the stack
     * 
     * @param {Object} options
     * @return {Bool}
     */
    kc.searchStack = function (options) {
        var i, _i, prop, item1, item2, s, _s;
        // Search array of names
        if (options.names !== undefined) {
            for (i = 0, _i = options.names.length; i < _i; i++) {
                if (kc.keyStack[options.names[i]] !== undefined) {
                    return true;
                }       
            }
        }
        // Search single name
        else if (options.name !== undefined) {
            if (kc.keyStack[options.name] !== undefined) {
                return true;
            }
        }
        // Search by keycode
        else if (options.keyCode !== undefined) {
            // Search primary keys
            for (item1 in kc.keyStack) {
                if (kc.keyStack.hasOwnProperty(item1)) {
                    if (kc.keyStack[item1].keyCode === options.keyCode) {
                        return kc.keyStack[item1];
                    }
                }
            }
            // Search secondary keys
            for (item2 in kc.keyStack) {
                if (kc.keyStack.hasOwnProperty(item2)) {
                    for (s = 0, _s = kc.keyStack[item2].secKeys.length;
                            s < _s; s++) {
                        if (kc.keyStack[item2].secKeys[s] === options.keyCode) {
                            return kc.keyStack[item2];
                        }
                    }
                }
            }
        }
        // Search by position
        else if (options.position !== undefined) {
            if (options.position === 'last') {
                item = false;
                for (item in kc.keyStack) {
                    if (kc.keyStack.hasOwnProperty(item)) {
                        continue;
                    }
                }
                if (item) {
                    return kc.keyStack[item];
                }
                else {
                    return false;
                }
            }
            if (options.position === 'first') {
                item = false;
                for (item in kc.keyStack) {
                    if (kc.keyStack.hasOwnProperty(item)) {
                        break;
                    }
                }
                if (item) {
                    return kc.keyStack[item];
                }
                else {
                    return false;
                }
            }
        }
        return false;
    };

kc.popStack = function(name) {
 delete kc.keyStack[name];
 return true;
}

kc.getAction = function(keyCode, charCode) {
 var item, c, _c, s, _s, action, thisChar, out, found, val;
 found = false;
    main : for( action in kc.map ) {
     item = kc.map[action];
        //search char list
        for(  c = 0, _c = item.c.length; c < _c; c++ ) {
         thisChar = item.c[c];
            if( charCode === thisChar ) {
             out = {
                found : true,
                keyCode : item.k,
                charCode : thisChar,
                secKeys : item.s,
                name : action,
                printable : item.p,
                val : item.v
             };
             found = true;
             break main;
            }
        }
        //search secondary key list
        //a secondary list isonly valid if control characters exist
        for(  s = 0, _s = item.s.length; s < _s; s++ ) {
         thisSecKey = item.s[s];
            //found in char list
            if( keyCode === thisSecKey) {
             out = {
                found : true,
                keyCode : item.k,
                charCode : thisSecKey,
                secKeys : item.s,
                name : action,
                printable : item.p,
                val : item.v
             };
             found = true;
             break main;
            }
        }
        //search primary key
        if( item.k === keyCode ) {
         out = {
            found : true,
            keyCode : item.k,
            charCode : item.k,
            secKeys : item.s,
            name : action,
            printable : item.p,
            val : item.v
         };
         found = true;
         break main;        
        }
    }
    //nothing found
    if( !found ) {
     val = (keyCode !== 0 ? String.fromCharCode( keyCode ) :
            String.fromCharCode( charCode ) );
     out = {
        found : false,
        keyCode : keyCode,
        charCode : charCode,
        secKeys : [],
        name : 'UNKNOWN',
        printable : val.length ? true : false, 
        val : val
     };
    }
 return out;
}

kc.bind = function(elm, ev, callback) {
    if(elm.attachEvent) {
     elm.attachEvent( 'on'+ev, callback);
    }
    else if(elm.addEventListener) {
     elm.addEventListener( ev, callback, false);
    }
}

kc.init();

/**** NOMOUSE ********************************************************/
/**
 * NoMouse
 * @author Brendon Crawford <http://aphexcreations.net>
 * @created 2007-06-01
 */
 
 nomouse = new Object;
 nomouse.timeout = 3000;
 nomouse.timer = null;
 nomouse.lastNode = null;
 nomouse.current = '';
 nomouse.nodemap = {};
 nomouse.zindexer = 100;
 nomouse.built = false;
 nomouse.container = null;
 nomouse.limit = 1000;
 nomouse.trigger = null;
 nomouse.chars = null;
 nomouse.keyconf = {
    trigger : {
        win : 'SHIFT SPACE',
        osx : 'ALT',
        linux : 'ALT'
    },
    labels : 'J K L SEMICOLON'
 };

    nomouse.buildContainer = function(){
     nomouse.container = document.body.appendChild(document.createElement('div'));
     nomouse.container.id = 'nomouse_container';
     nomouse.container.style.display = 'none';
     nomouse.container.style.position = 'absolute';
     nomouse.container.style.top = '0px';
     nomouse.container.style.left = '0px';  
    }
    
    //It is necesarry to clone object before modifying it.
    nomouse.arr_add = function(arr, val){
     var temp;
     temp = kc.clone(arr);
     temp[temp.length] = val;
     return temp;
    }
    
    nomouse.prefs = function() {
     var _trigger, trigger, _labels, labels, i, _i, chars;
      chars = "";
     _trigger = GM_getValue('trigger', null);
     _labels = GM_getValue('labels', null);
        if( _trigger === null || _trigger === '' ) {
            if( kc.p.o.osx ) {
             _trigger = nomouse.keyconf.trigger.osx;
            }
            else if( kc.p.o.win ) {
             _trigger = nomouse.keyconf.trigger.win;
            }
            else if (kc.p.o.linux) {
             _trigger = nomouse.keyconf.trigger.linux;
            }
         GM_setValue('trigger', _trigger);
        }
        if( _labels === null || _labels === '' ) {
         _labels = nomouse.keyconf.labels;
         GM_setValue('labels', _labels);     
        }
     trigger = _trigger.split(/\W+/ig);
     labels = _labels.split(/\W+/ig);
     kc.register( trigger , ['up','down','press'] , nomouse.toggler );
        for(i = 0, _i = labels.length; i < _i; i++) {
            //For now we can only handle single character labels
            if(kc.map[labels[i]].v.length === 1) {
             kc.register( nomouse.arr_add(trigger, labels[i]) , ['down','press'] , nomouse.press );
             chars += kc.map[labels[i]].v;
            }
        }
     kc.register( ['RETURN'] , ['down'] , nomouse.enter );
     return chars;
    }
    
    nomouse.init = function(){
     nomouse.chars = nomouse.prefs();
     nomouse.buildContainer();
     nomouse.buildLabels();
     nomouse.built = true;
    }
    
    //Not used
    nomouse.intercept = function() {
     //org_addEventListener =
     //HTMLElement.prototype.addEventListener;
     //HTMLElement.prototype.addEventListener =
     //function(name, fpNotify, uc) { ...; org_addEventListener.call(this, name, fpNotify, uc); }
    }
    
    nomouse.buildLabels = function() {
     var elms, i, j;
     j = nomouse.charIncrement(nomouse.chars);
     elms = document.evaluate("//a|//input|//select|//textarea", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
     nomouse.zindexer += elms.snapshotLength;
        for(i = 0, _i = elms.snapshotLength; i < _i && i < nomouse.limit; i++ ) {
         nomouse.register(elms.snapshotItem(i), j.val, j.id);
         j = nomouse.charIncrement(nomouse.chars, j.val);
        }
    }
    
    nomouse.charIncrement = function( chars ) {
     var val, carryIndex, addDigit, str, valChar, valIndex, i;
        if(!arguments[1]) {
         return {
            val : chars.charAt(0),
            id : 1
         }
        }
        else {
         val = arguments[1];
        }
     carryIndex = false;
     addDigit = false;
     str = '';
     id = '';
        for( i = val.length-1; i >= 0; i-- ) {
         valChar = val.charAt(i);
         valIndex = chars.indexOf(valChar);
            //first
            if( i === val.length-1 || carryIndex) {
             //alert(valChar);
             newValIndex = valIndex + 1;
             carryIndex = false;
            }
            else {
             newValIndex = valIndex;
            }
            //time to carry
            if( newValIndex >= chars.length ) {
             newValIndex = 0;
             carryIndex = true;
                if( i === 0 ) {
                 addDigit = true;
                }
            }
            else {
             carryIndex = false;
            }
         str = chars.charAt(newValIndex) + str;
         id = (newValIndex+1).toString() + id;
            if( addDigit ) {
             str = chars.charAt(0) + str;
             id = (1).toString() + id;
             addDigit = false;
            }
        }
     return {
        val : str,
        id : parseInt(id)
     };
    }

    nomouse.toggler = function(action,type) {
        if( type === 'down' ) {
         nomouse.showLabels();      
        }
        else if(type === 'up') {
         nomouse.cleanup();
            if(nomouse.lastNode !== null) {
             nomouse.lastNode.node.focus();
            }
        }
     return false;
    }
    
    //http://www.quirksmode.org/js/findpos.html
    nomouse.pos = function(obj) {
     var curleft = curtop = 0;
        if (obj.offsetParent) {
            curleft = obj.offsetLeft
            curtop = obj.offsetTop
            while (obj = obj.offsetParent) {
                curleft += obj.offsetLeft
                curtop += obj.offsetTop
            }
        }
     return {
        left : curleft,
        top : curtop
     };
    }
    
    nomouse.register = function(elm, val, index) {
     var numLabel, _numLabel, elmPos;
     elmPos = nomouse.pos(elm);
     numLabel = document.createElement('div');
     numLabel.appendChild(document.createTextNode(val));
     numLabel.style.position = 'absolute';
     numLabel.style.top = elmPos.top + 'px';
     numLabel.style.left = elmPos.left + 'px';
     numLabel.style.fontWeight = 'normal';
     numLabel.style.fontSize = '12px';
     numLabel.style.fontFamily = 'Courier, Courier New, Andale Mono, monospace';
     numLabel.style.backgroundColor = '#000000';
     numLabel.style.color = '#FFFFFF';
     numLabel.style.padding = '1px';
     numLabel.style.letterSpacing = '0px';
     numLabel.style.border = '1px solid green';
     numLabel.style.zIndex = nomouse.zindexer;
     numLabel.className = 'nomouse';
     nomouse.container.appendChild(numLabel);
     nomouse.nodemap[index] = {
      node : elm
     };
     nomouse.zindexer++;
    }
    
    nomouse.doClick = function(elm) {
     var evtObj;
     evtObj = unsafeWindow.document.createEvent('MouseEvents');
     evtObj.initMouseEvent( 'click', true, true, unsafeWindow, 1, 12, 345, 7, 220, false, false, true, false, 0, null );
     elm.dispatchEvent( evtObj );
    }
    
    nomouse.press = function(action,type){
     //input key - find element
        if(type === 'down') {
         nomouse.process( action.val );
        }
     return false;
    }
    
    //enter key - simulate click
    nomouse.enter = function(action,type) {
        if(nomouse.lastNode !== null) {
         nomouse.doClick(nomouse.lastNode.node);
        }
     return true;
    }
    
    nomouse.showLabels = function() {
     nomouse.container.style.display = 'block';
    }
    
    nomouse.cleanup = function() {
     nomouse.container.style.display = 'none';
     nomouse.kill();
    }
    
    nomouse.process = function(key){
     var num, elm;
     nomouse.killTimer();
     nomouse.current += key;
     window.status = nomouse.current;
     nomouse.timer = window.setTimeout(nomouse.kill,nomouse.timeout);
     strID = nomouse.getCodeID(nomouse.chars, nomouse.current);
        if(nomouse.nodemap[strID] !== undefined) {
            if(nomouse.lastNode !== null) {
             nomouse.lastNode.node.style.backgroundColor = nomouse.lastNode.backgroundColor;
             nomouse.lastNode.node.style.border = nomouse.lastNode.border;
             nomouse.lastNode.node.style.color = nomouse.lastNode.color;
             nomouse.lastNode.node.style.backgroundImage = nomouse.lastNode.backgroundImage;
            }
         elm = nomouse.nodemap[strID].node;
         nomouse.lastNode = {
            node : elm,
            backgroundColor : elm.style.backgroundColor,
            border : elm.style.border,
            color : elm.style.color,
            backgroundImage : elm.style.backgroundImage
         };
         elm.style.backgroundColor = "#FF0";
         elm.style.border = "1px solid #F00";
         elm.style.color = "#000";
         elm.style.backgroundImage = "none";
        }
         
    }
    
    nomouse.getCodeID = function(chars, val) {
     var i, out;
     out = '';
        for( i = 0; i < val.length; i++ ) {
         valChar = val.charAt(i);
         valIndex = (chars.indexOf(valChar)+1).toString();
         out += valIndex;
        }
     return out;
    }
    
    nomouse.kill = function() {
     nomouse.killTimer();
     nomouse.current = '';
     window.status = window.defaultStatus;
     return true;
    }
    
    nomouse.killTimer = function(){
        if(nomouse.timer !== null) {
         window.clearTimeout(nomouse.timer);
         nomouse.timer = null;
         return true;
        }
        else {
         return false;
        }
    }
    
 nomouse.init();
    
})();

// ==UserScript==
// @name         YouTube Personal
// @namespace    https://github.com/youtube-personal
// @version      0.1.0
// @description  Lightweight personal enhancement suite for YouTube
// @author       ChatGPT & User
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
'use strict';

/**
 * ============================================================
 * YouTube Personal
 *
 * Version : 0.1.0
 * Commit  : #1
 *
 * This commit contains only the application foundation.
 * No UI changes are performed.
 * ============================================================
 */


/* ------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------- */

const APP_NAME = "YouTube Personal";
const VERSION = "0.1.0";

const DEBUG = true;


/* ------------------------------------------------------------
 * Logger
 * ---------------------------------------------------------- */

class Logger {

    static log(...args) {

        if (!DEBUG) return;

        console.log(
            `%c${APP_NAME}`,
            "color:#ff0000;font-weight:bold;",
            ...args
        );

    }

    static warn(...args) {

        console.warn(
            `%c${APP_NAME}`,
            "color:orange;font-weight:bold;",
            ...args
        );

    }

    static error(...args) {

        console.error(
            `%c${APP_NAME}`,
            "color:red;font-weight:bold;",
            ...args
        );

    }

}


/* ------------------------------------------------------------
 * Utility
 * ---------------------------------------------------------- */

class Util {

    static sleep(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));

    }

    static isWatchPage() {

        return location.pathname === "/watch";

    }

    static isShortsPage() {

        return location.pathname.startsWith("/shorts");

    }

}


/* ------------------------------------------------------------
 * Base Module
 * ---------------------------------------------------------- */

/**
 * 全モジュールの親クラス
 *
 * Layout
 * Player
 * Live
 * Tabs
 *
 * はこのクラスを継承する。
 */

class BaseModule {

    constructor(name) {

        this.name = name;

        this.initialized = false;

    }

    init() {}

    destroy() {}

}


/* ------------------------------------------------------------
 * Application
 * ---------------------------------------------------------- */

class YouTubePersonal {

    constructor() {

        Logger.log(`Starting ${VERSION}`);

        this.modules = [];

    }

    register(module) {

        this.modules.push(module);

    }

    init() {

        Logger.log("Application Initialized");

        for (const module of this.modules) {

            module.init();

        }

    }

}


/* ------------------------------------------------------------
 * Boot
 * ---------------------------------------------------------- */

const app = new YouTubePersonal();

app.init();

})();

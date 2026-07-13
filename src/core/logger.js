/**
 * ============================================================
 * YouTube Personal
 * File    : logger.js
 * Version : 0.1.0
 *
 * アプリケーション全体で使用するロガー。
 *
 * console.log を直接使用せず、
 * 必ず Logger を経由する。
 *
 * 将来的には
 * ・ログレベル
 * ・ファイル出力
 * ・開発モード切替
 * などをここへ追加する。
 * ============================================================
 */

'use strict';

import { APP, CURRENT_ENV, ENV } from './constants.js';

/**
 * ログレベル
 */
export const LogLevel = Object.freeze({
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
});

/**
 * Logger
 */
export class Logger {

    /**
     * 現在のログレベル
     */
    static #level = LogLevel.DEBUG;

    /**
     * プレフィックス
     */
    static #prefix(level) {

        return `[${APP.NAME}] [${level}]`;

    }

    /**
     * 開発モード判定
     */
    static #enabled() {

        return CURRENT_ENV === ENV.DEVELOPMENT;

    }

    /**
     * Debug
     */
    static debug(...args) {

        if (!this.#enabled()) return;

        if (this.#level > LogLevel.DEBUG) return;

        console.debug(
            this.#prefix("DEBUG"),
            ...args
        );

    }

    /**
     * Info
     */
    static info(...args) {

        if (!this.#enabled()) return;

        if (this.#level > LogLevel.INFO) return;

        console.info(
            this.#prefix("INFO"),
            ...args
        );

    }

    /**
     * Warning
     */
    static warn(...args) {

        if (!this.#enabled()) return;

        if (this.#level > LogLevel.WARN) return;

        console.warn(
            this.#prefix("WARN"),
            ...args
        );

    }

    /**
     * Error
     */
    static error(...args) {

        if (this.#level > LogLevel.ERROR) return;

        console.error(
            this.#prefix("ERROR"),
            ...args
        );

    }

    /**
     * ログレベル変更
     */
    static setLevel(level) {

        this.#level = level;

    }

}

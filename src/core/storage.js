/**
 * ============================================================
 * YouTube Personal
 * File    : storage.js
 * Version : 0.1.0
 *
 * 永続ストレージ管理
 *
 * 優先順位
 * 1. GM Storage
 * 2. localStorage
 *
 * StorageManager以外は
 * GM_getValue / localStorage を直接使用しない。
 * ============================================================
 */

'use strict';

import { STORAGE_PREFIX } from './constants.js';
import { Logger } from './logger.js';

export class Storage {

    /**
     * ストレージ名
     * @param {string} namespace
     */
    constructor(namespace = STORAGE_PREFIX) {

        this.namespace = namespace;

        this.useGM =
            typeof GM_getValue === 'function' &&
            typeof GM_setValue === 'function';

        Logger.info(
            `Storage Backend : ${this.useGM ? 'GM Storage' : 'localStorage'}`
        );

    }

    /**
     * 名前空間付きキー生成
     * @param {string} key
     * @returns {string}
     */
    #key(key) {

        return `${this.namespace}:${key}`;

    }

    /**
     * 保存
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {

        const storageKey = this.#key(key);

        if (this.useGM) {

            GM_setValue(storageKey, value);

            return;

        }

        localStorage.setItem(
            storageKey,
            JSON.stringify(value)
        );

    }

    /**
     * 読み込み
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {

        const storageKey = this.#key(key);

        if (this.useGM) {

            return GM_getValue(storageKey, defaultValue);

        }

        const value = localStorage.getItem(storageKey);

        if (value === null) {

            return defaultValue;

        }

        try {

            return JSON.parse(value);

        } catch {

            Logger.warn(
                `Failed to parse storage : ${storageKey}`
            );

            return defaultValue;

        }

    }

    /**
     * 削除
     * @param {string} key
     */
    remove(key) {

        const storageKey = this.#key(key);

        if (this.useGM) {

            if (typeof GM_deleteValue === 'function') {

                GM_deleteValue(storageKey);

            }

            return;

        }

        localStorage.removeItem(storageKey);

    }

    /**
     * 存在確認
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {

        return this.get(key, Symbol.for('missing')) !== Symbol.for('missing');

    }

}

/**
 * ============================================================
 * YouTube Personal
 * File    : settings-utils.js
 * Version : 0.1.0
 *
 * 設定操作に使用するオブジェクト操作用ユーティリティ関数群。
 * 外部ライブラリに依存せず、ピュアなJavaScriptで完結する。
 * ============================================================
 */
'use strict';

/**
 * プロトタイプ汚染対策のための禁止キー一覧
 * @type {Set<string>}
 */
const PROHIBITED_KEYS = new Set([
    '__proto__',
    'constructor',
    'prototype'
]);

/**
 * オブジェクトをディープコピー（深層複製）する
 * JSON互換のデータ構造（設定値）を対象とする。
 * 
 * @param {*} value - コピー対象の値
 * @returns {*} 複製された値
 */
export function clone(value) {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    // 標準APIを利用してディープコピーする
    return structuredClone(value);
}

/**
 * オブジェクトを再帰的にディープマージする
 * source の値を target へ上書き・マージする（target 自体は変更しない）。
 * 
 * @param {Object} target - ベースとなるオブジェクト
 * @param {Object} source - 上書きする設定値を持つオブジェクト
 * @returns {Object} マージされた新しいオブジェクト
 */
export function merge(target, source) {
    if (typeof target !== 'object' || target === null) {
        return clone(source);
    }
    if (typeof source !== 'object' || source === null) {
        return clone(target);
    }

    const result = clone(target);

    for (const key of Object.keys(source)) {
        // セキュリティ対策：プロトタイプ汚染経路を遮断
        if (PROHIBITED_KEYS.has(key)) {
            continue;
        }

        const sourceValue = source[key];
        const targetValue = result[key];

        // 配列の場合は単純に source 側をクローンして置換（設定の配列は全置換が安全）
        if (Array.isArray(sourceValue)) {
            result[key] = clone(sourceValue);
        } else if (typeof sourceValue === 'object' && sourceValue !== null) {
            // targetValueがオブジェクトでない（プリミティブ）場合は空オブジェクトをベースにする
            const base = (typeof targetValue === 'object' && targetValue !== null) ? targetValue : {};
            result[key] = merge(base, sourceValue);
        } else {
            result[key] = clone(sourceValue);
        }
    }

    return result;
}

/**
 * ドット区切りのパス（例: "layout.fontSize"）からオブジェクトの値を取得する
 * 
 * @param {Object} object - 対象のオブジェクト
 * @param {string} path - ドット区切りのパス
 * @returns {*} 取得した値。見つからない場合は undefined
 */
export function getPath(object, path) {
    if (!path || typeof path !== 'string') return undefined;
    
    const keys = path.split('.');
    let current = object;

    for (const key of keys) {
        if (current === null || typeof current !== 'object' || PROHIBITED_KEYS.has(key)) {
            return undefined;
        }
        current = current[key];
    }

    return current;
}

/**
 * ドット区切りのパス（例: "layout.fontSize"）の場所に値をセットする
 * 途中のオブジェクトが存在しない場合は自動生成する。
 * 
 * @param {Object} object - 対象のオブジェクト
 * @param {string} path - ドット区切りのパス
 * @param {*} value - セットする値
 */
export function setPath(object, path, value) {
    if (!path || typeof path !== 'string' || object === null || typeof object !== 'object') {
        return;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = object;

    for (const key of keys) {
        // セキュリティ対策：プロトタイプ汚染経路を遮断
        if (PROHIBITED_KEYS.has(key)) {
            return;
        }

        if (typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }

    if (!PROHIBITED_KEYS.has(lastKey)) {
        // 外部オブジェクトの参照を引きずらないようクローンして代入
        current[lastKey] = clone(value);
    }
}

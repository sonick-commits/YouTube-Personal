/**
 * ============================================================
 * YouTube Personal
 * File    : css-manager.js
 * Version : 0.1.0
 *
 * ページ全体へのCSSインジェクション（注入）と削除、および
 * 適用状態の重複防止を一元管理する汎用CSS管理クラス。
 * 
 * 責務
 * ・CSS文字列のStyle要素（<style>）への変換とheadへの挿入
 * ・注入したCSSのID管理による重複防止
 * ・個別および一括のCSS削除
 * ============================================================
 */
'use strict';

import { Logger } from './logger.js';

/**
 * 汎用CSS管理クラス
 */
export class CSSManager {
    /** @type {Map<string, HTMLStyleElement>} */
    #styles;

    /**
     * コンストラクタ
     */
    constructor() {
        this.#styles = new Map();
        Logger.info('CSSManager initialized');
    }

    /**
     * 指定されたIDでCSS文字列をドキュメントのheadに挿入する。
     * 同一IDのCSSが既に存在する場合は、上書き（更新）を行う。
     * 
     * @param {string} id - CSSを一意識別するためのID
     * @param {string} cssText - 注入するCSS文字列
     * @returns {boolean} 挿入または更新が成功した場合はtrue、失敗した場合はfalse
     */
    add(id, cssText) {
        // idの型チェックおよび空白文字のみのケースを厳密にチェック
        if (typeof id !== 'string' || id.trim() === '') {
            Logger.error('CSSManager: Invalid or empty ID provided.');
            return false;
        }

        if (typeof cssText !== 'string') {
            Logger.error(`CSSManager: Invalid CSS text provided for ID "${id}".`);
            return false;
        }

        try {
            // 既に同一IDの要素が存在する場合は、中身のテキストだけを更新（重複防止・再利用）
            if (this.#styles.has(id)) {
                const existingStyle = this.#styles.get(id);
                existingStyle.textContent = cssText;
                Logger.info(`CSSManager: CSS for ID "${id}" updated.`);
                return true;
            }

            // 新規に<style>要素を生成して属性を設定
            const styleElement = document.createElement('style');
            styleElement.setAttribute('type', 'text/css');
            styleElement.setAttribute('data-manager-id', id);
            styleElement.textContent = cssText;

            // head要素へ挿入
            const head = document.head || document.getElementsByTagName('head')[0];
            if (!head) {
                Logger.error('CSSManager: document.head is not available.');
                return false;
            }

            head.appendChild(styleElement);
            this.#styles.set(id, styleElement);
            Logger.info(`CSSManager: CSS for ID "${id}" injected successfully.`);
            return true;
        } catch (error) {
            Logger.error(`CSSManager: Failed to add CSS for ID "${id}":`, error);
            return false;
        }
    }

    /**
     * 指定されたIDのCSS（style要素）を削除する
     * 
     * @param {string} id - 削除対象のCSS ID
     * @returns {boolean} 削除が成功した場合はtrue、存在しなかった場合はfalse
     */
    remove(id) {
        const styleElement = this.#styles.get(id);
        
        if (!styleElement) {
            Logger.warn(`CSSManager: CSS ID "${id}" not found. Active deletion skipped.`);
            return false;
        }

        try {
            styleElement.remove();
            this.#styles.delete(id);
            Logger.info(`CSSManager: CSS for ID "${id}" removed successfully.`);
            return true;
        } catch (error) {
            Logger.error(`CSSManager: Failed to remove CSS for ID "${id}":`, error);
            return false;
        }
    }

    /**
     * 指定されたIDのCSSが現在適用されているか確認する
     * 
     * @param {string} id - 確認対象のCSS ID
     * @returns {boolean} 適用されていればtrue
     */
    has(id) {
        return this.#styles.has(id);
    }

    /**
     * マネージャー経由で注入されたすべてのCSSを一括で削除する
     */
    clear() {
        Logger.info('CSSManager: Start clearing all injected CSS.');
        
        // ループ内でのdelete操作によるイテレータへの不具合を防ぐため、スナップショット配列を利用
        const keysSnapshot = [...this.#styles.keys()];
        for (const id of keysSnapshot) {
            this.remove(id);
        }
    }
}

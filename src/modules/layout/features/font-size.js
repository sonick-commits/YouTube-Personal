/**
 * ============================================================
 * YouTube Personal
 * File    : features/font-size.js
 * Version : 1.1.2
 *
 * フォントサイズ変更のレイアウト適用・解除を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { Logger } from '../../../core/logger.js';

/** @type {string} */
const SETTING_KEY = 'layout.fontSize';

/** @type {string} */
const STYLE_ID = 'layout-font-size';

/**
 * フォントサイズ設定を読み込み、スタイルを適用する
 * 
 * @param {Settings} settings - 設定マネージャーのインスタンス
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function apply(settings, cssManager) {
    if (!settings || !cssManager) {
        Logger.warn('FontSize: Cannot apply style. Required dependency is missing.');
        return;
    }

    const fontSize = settings.get(SETTING_KEY);
    if (fontSize == null) {
        Logger.info('FontSize: Setting is empty. Skipped application.');
        return;
    }

    // 重複適用を防ぐため既存スタイルを事前に解除
    remove(cssManager);

    const cssText = generateFontSizeCss(fontSize);
    cssManager.add(STYLE_ID, cssText);
    Logger.info(`FontSize: Style [${fontSize}] applied successfully.`);
}

/**
 * 適用されているフォントサイズ設定用スタイルを解除する
 * 
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function remove(cssManager) {
    if (!cssManager) {
        Logger.warn('FontSize: Cannot remove style. CSSManager is missing.');
        return;
    }
    cssManager.remove(STYLE_ID);
}

/**
 * 指定されたフォントサイズ値からCSS文字列を動的に生成する内部ユーティリティ
 * 
 * @param {string} size - 設定されたフォントサイズ値
 * @returns {string} インジェクト用のCSS文字列
 */
function generateFontSizeCss(size) {
    return `
        html, body, ytd-app {
            font-size: ${size} !important;
        }
    `;
}

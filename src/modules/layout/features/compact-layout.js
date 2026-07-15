/**
 * ============================================================
 * YouTube Personal
 * File    : features/compact-layout.js
 * Version : 1.0.0
 *
 * 一覧ページコンパクトレイアウトの適用・解除を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { Logger } from '../../../core/logger.js';

/** @type {string} */
const SETTING_KEY = 'layout.compactLayout';

/** @type {string} */
const STYLE_ID = 'layout-compact-layout';

/**
 * コンパクトレイアウト設定を読み込み、スタイルを適用する
 * 
 * @param {Settings} settings - 設定マネージャーのインスタンス
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function apply(settings, cssManager) {
    if (!settings || !cssManager) {
        Logger.warn('CompactLayout: Cannot apply style. Required dependency is missing.');
        return;
    }

    const isCompact = settings.get(SETTING_KEY);
    if (isCompact !== true) {
        // 設定がOFFまたは未定義の場合は、適用中のスタイルを解除して終了
        remove(cssManager);
        return;
    }

    // 重複適用を防ぐため既存スタイルを事前に解除
    remove(cssManager);

    const cssText = generateCompactLayoutCss();
    cssManager.add(STYLE_ID, cssText);
    Logger.info('CompactLayout: Style applied successfully.');
}

/**
 * 適用されているコンパクトレイアウト設定用スタイルを解除する
 * 
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function remove(cssManager) {
    if (!cssManager) {
        Logger.warn('CompactLayout: Cannot remove style. CSSManager is missing.');
        return;
    }
    cssManager.remove(STYLE_ID);
}

/**
 * 一覧ページコンパクトレイアウト用CSS文字列を動的に生成する内部ユーティリティ
 * 
 * @returns {string} インジェクト用のCSS文字列
 */
function generateCompactLayoutCss() {
    return `
        ytd-browse ytd-rich-grid-renderer {
            padding-top: 8px !important;
        }
        ytd-browse ytd-rich-item-renderer {
            margin-bottom: 12px !important;
        }
        ytd-browse ytd-rich-grid-media #details {
            margin-top: 6px !important;
        }
        ytd-browse ytd-rich-grid-media #meta {
            padding-right: 8px !important;
        }
        ytd-browse ytd-rich-grid-media #video-title-link {
            margin-bottom: 4px !important;
        }
        ytd-browse ytd-rich-grid-media ytd-channel-name {
            margin-top: 2px !important;
            margin-bottom: 2px !important;
        }
        ytd-browse ytd-rich-grid-media #metadata-line {
            margin-top: 2px !important;
        }
    `;
}

/**
 * ============================================================
 * YouTube Personal
 * File    : features/compact-video-layout.js
 * Version : 1.0.0
 *
 * 視聴ページコンパクトレイアウトの適用・解除を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { Logger } from '../../../core/logger.js';

/** @type {string} */
const SETTING_KEY = 'layout.compactVideoPageLayout';

/** @type {string} */
const STYLE_ID = 'layout-compact-video-page-layout';

/**
 * 視聴ページコンパクトレイアウト設定を読み込み、スタイルを適用する
 * 
 * @param {Settings} settings - 設定マネージャーのインスタンス
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function apply(settings, cssManager) {
    if (!settings || !cssManager) {
        Logger.warn('CompactVideoLayout: Cannot apply style. Required dependency is missing.');
        return;
    }

    const isCompactWatch = settings.get(SETTING_KEY);
    if (isCompactWatch !== true) {
        // 設定がOFFまたは未定義の場合は、適用中のスタイルを解除して終了
        remove(cssManager);
        return;
    }

    // 重複適用を防ぐため既存スタイルを事前に解除
    remove(cssManager);

    const cssText = generateCompactVideoLayoutCss();
    cssManager.add(STYLE_ID, cssText);
    Logger.info('CompactVideoLayout: Style applied successfully.');
}

/**
 * 適用されている視聴ページコンパクトレイアウト用スタイルを解除する
 * 
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function remove(cssManager) {
    if (!cssManager) {
        Logger.warn('CompactVideoLayout: Cannot remove style. CSSManager is missing.');
        return;
    }
    cssManager.remove(STYLE_ID);
}

/**
 * 視聴ページコンパクトレイアウト用CSS文字列を動的に生成する内部ユーティリティ
 * 
 * @returns {string} インジェクト用のCSS文字列
 */
function generateCompactVideoLayoutCss() {
    return `
        ytd-watch-flexy {
            --ytd-watch-flexy-space-below-player: 12px !important;
        }
        ytd-watch-flexy ytd-watch-metadata {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
        }
        ytd-watch-flexy #top-row.ytd-watch-metadata {
            margin-top: 4px !important;
            padding-bottom: 4px !important;
        }
        ytd-watch-flexy #description.ytd-watch-metadata {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
        }
        ytd-watch-flexy #secondary ytd-compact-video-renderer {
            margin-bottom: 8px !important;
        }
    `;
}

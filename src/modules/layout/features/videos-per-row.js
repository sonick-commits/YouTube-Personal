/**
 * ============================================================
 * YouTube Personal
 * File    : features/videos-per-row.js
 * Version : 1.0.0
 *
 * 1行あたりの動画表示列数のレイアウト適用・解除を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { Logger } from '../../../core/logger.js';

/** @type {string} */
const SETTING_KEY = 'layout.videosPerRow';

/** @type {string} */
const STYLE_ID = 'layout-videos-per-row';

/**
 * 1行あたりの動画表示列数設定を読み込み、スタイルを適用する
 * 
 * @param {Settings} settings - 設定マネージャーのインスタンス
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function apply(settings, cssManager) {
    if (!settings || !cssManager) {
        Logger.warn('VideosPerRow: Cannot apply style. Required dependency is missing.');
        return;
    }

    const count = settings.get(SETTING_KEY);
    if (count == null) {
        Logger.info('VideosPerRow: Setting is empty. Skipped application.');
        return;
    }

    // 厳密な数値型チェックによるバリデーション
    const numericCount = Number(count);
    if (!Number.isInteger(numericCount) || numericCount <= 0) {
        Logger.warn(`VideosPerRow: Invalid value [${count}]. Skipped application.`);
        return;
    }

    // 重複適用を防ぐため既存スタイルを事前に解除
    remove(cssManager);

    const cssText = generateVideosPerRowCss(numericCount);
    cssManager.add(STYLE_ID, cssText);
    Logger.info(`VideosPerRow: Row count [${numericCount}] applied successfully.`);
}

/**
 * 適用されている動画表示列数設定用スタイルを解除する
 * 
 * @param {CSSManager} cssManager - CSSマネージャーのインスタンス
 */
export function remove(cssManager) {
    if (!cssManager) {
        Logger.warn('VideosPerRow: Cannot remove style. CSSManager is missing.');
        return;
    }
    cssManager.remove(STYLE_ID);
}

/**
 * 指定された列数からCSS文字列を動的に生成する内部ユーティリティ
 * YouTube内部CSS変数を利用し、グリッドの表示列数を上書きする。
 * 
 * @param {number} count - 1行あたりの動画数（安全確認済みの整数）
 * @returns {string} インジェクト用のCSS文字列
 */
function generateVideosPerRowCss(count) {
    return `
        ytd-rich-grid-renderer {
            --ytd-rich-grid-items-per-row: ${count} !important;
        }
    `;
}

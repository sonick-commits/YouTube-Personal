/**
 * ============================================================
 * YouTube Personal
 * File    : layout-module.js
 * Version : 0.4.1
 *
 * YouTubeの画面レイアウト（サイドバー、ヘッダー、動画表示列数等）の
 * 制御を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { ModuleBase } from '../../core/module-base.js';
import { Logger } from '../../core/logger.js';
import { Settings } from '../../core/settings.js';
import { CSSManager } from '../../core/css-manager.js';

/**
 * レイアウト制御モジュール
 */
export class LayoutModule extends ModuleBase {
    /** @type {Settings|null} */
    #settings;

    /** @type {CSSManager|null} */
    #cssManager;

    /** @type {string} */
    #cssStyleId;

    /** @type {string} */
    #fontSizeStyleId;

    /** @type {string} */
    #videosPerRowStyleId;

    /**
     * コンストラクタ
     */
    constructor() {
        super('layout');
        this.#settings = null;
        this.#cssManager = null;
        this.#cssStyleId = 'layout-base';
        this.#fontSizeStyleId = 'layout-font-size';
        this.#videosPerRowStyleId = 'layout-videos-per-row';
        Logger.info('LayoutModule: Instance initialized.');
    }

    /**
     * モジュールの初期化処理
     * App (ModuleManager) から一元管理された共有依存コンテキストを受け取る。
     * 
     * @param {Object} context - 初期化コンテキスト
     * @param {Settings} context.settings - 設定マネージャーのインスタンス
     * @param {CSSManager} context.cssManager - CSSマネージャーのインスタンス
     */
    init({ settings, cssManager } = {}) {
        this.#settings = settings;
        this.#cssManager = cssManager;
        
        Logger.info('LayoutModule: init() accepted dependency injection successfully.');
        
        // 初回起動時のレイアウト設定一斉適用
        this.apply();
    }

    /**
     * モジュールの破棄処理
     */
    destroy() {
        Logger.info('LayoutModule: destroy() triggered clean up.');
        this.remove();
    }

    /**
     * レイアウト変更の実機能を適用する内部メソッド（各機能のハブ）
     */
    apply() {
        if (!this.#cssManager) {
            Logger.warn('LayoutModule: Cannot apply styles. CSSManager is missing.');
            return;
        }

        // 疎通確認用ベースCSSのインジェクト
        const testCss = `
            body {
                /* LayoutModule: CSSManager Connection Test Pass */
                --yt-personal-layout-active: 1;
            }
        `;

        this.#cssManager.add(this.#cssStyleId, testCss);
        Logger.info('LayoutModule: Layout CSS applied via add().');

        // 各レイアウト適用機能を内部から安全に順次呼び出し
        this.applyFontSize();
        this.applyVideosPerRow();
    }

    /**
     * 適用したすべてのレイアウト変更を解除・復元する内部メソッド（各解除機能のハブ）
     */
    remove() {
        if (!this.#cssManager) return;

        // 各レイアウト解除機能を内部から安全に順次呼び出し（applyと対称性を維持）
        this.removeFontSize();
        this.removeVideosPerRow();

        this.#cssManager.remove(this.#cssStyleId);
        Logger.info('LayoutModule: Layout CSS removed via remove().');
    }

    // ============================================================
    // Font Size 機能エリア
    // ============================================================

    /**
     * Settingsからフォントサイズ設定を取得し、YouTubeにスタイルを適用する
     */
    applyFontSize() {
        if (!this.#cssManager || !this.#settings) {
            Logger.warn('LayoutModule: Cannot apply font size. Dependency component is missing.');
            return;
        }

        const fontSize = this.#settings.get('layout.fontSize');
        if (fontSize == null) {
            Logger.info('LayoutModule: Font size setting is empty. Skipped application.');
            return;
        }

        this.removeFontSize();

        const cssText = this.#generateFontSizeCss(fontSize);
        this.#cssManager.add(this.#fontSizeStyleId, cssText);
        Logger.info(`LayoutModule: Font size [${fontSize}] applied successfully.`);
    }

    /**
     * 適用されているフォントサイズ設定用スタイルを解除する
     */
    removeFontSize() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#fontSizeStyleId);
            Logger.info('LayoutModule: Font size CSS removed.');
        }
    }

    /**
     * 指定されたフォントサイズ値からCSS文字列を動的に生成する内部ユーティリティ
     * 
     * @param {string} size - 設定されたフォントサイズ値
     * @returns {string} インジェクト用のCSS文字列
     */
    #generateFontSizeCss(size) {
        return `
            html, body, ytd-app {
                font-size: ${size} !important;
            }
        `;
    }

    // ============================================================
    // Videos Per Row 機能エリア
    // ============================================================

    /**
     * Settingsから1行あたりの動画表示数設定を取得し、YouTubeにスタイルを適用する
     */
    applyVideosPerRow() {
        if (!this.#cssManager || !this.#settings) {
            Logger.warn('LayoutModule: Cannot apply videos per row. Dependency component is missing.');
            return;
        }

        const count = this.#settings.get('layout.videosPerRow');
        if (count == null) {
            Logger.info('LayoutModule: Videos per row setting is empty. Skipped application.');
            return;
        }

        // 厳密な数値型チェックによるバリデーションの強化
        const numericCount = Number(count);
        if (!Number.isInteger(numericCount) || numericCount <= 0) {
            Logger.warn(`LayoutModule: Invalid videosPerRow value [${count}]. Skipped application.`);
            return;
        }

        this.removeVideosPerRow();

        const cssText = this.#generateVideosPerRowCss(numericCount);
        this.#cssManager.add(this.#videosPerRowStyleId, cssText);
        Logger.info(`LayoutModule: Videos per row [${numericCount}] applied successfully.`);
    }

    /**
     * 適用されている動画表示列数設定用スタイルを解除する
     */
    removeVideosPerRow() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#videosPerRowStyleId);
            Logger.info('LayoutModule: Videos per row CSS removed.');
        }
    }

    /**
     * 指定された列数からCSS文字列を動的に生成する内部ユーティリティ
     * YouTube内部CSS変数を利用し、グリッドの表示列数を上書きする。
     * 
     * @param {number} count - 1行あたりの動画数（安全確認済みの整数）
     * @returns {string} インジェクト用のCSS文字列
     */
    #generateVideosPerRowCss(count) {
        return `
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: ${count} !important;
            }
        `;
    }

    // ============================================================
    // Router連携用のページ遷移ハンドラ
    // ============================================================

    /**
     * ホーム画面への遷移ハンドラ
     * @param {Object} routeData - ルーティングデータ
     */
    onHomePage(routeData) {
        Logger.info('LayoutModule: Handled HomePage navigation.', routeData);
        // SPA navigation: re-apply layout styles
        this.apply();
    }

    /**
     * 動画視聴画面への遷移ハンドラ
     * @param {Object} routeData - ルーティングデータ
     */
    onWatchPage(routeData) {
        Logger.info('LayoutModule: Handled WatchPage navigation.', routeData);
        // SPA navigation: re-apply layout styles
        this.apply();
    }

    /**
     * Shorts画面への遷移ハンドラ
     * @param {Object} routeData - ルーティングデータ
     */
    onShortsPage(routeData) {
        Logger.info('LayoutModule: Handled ShortsPage navigation.', routeData);
        // SPA navigation: re-apply layout styles
        this.apply();
    }
}

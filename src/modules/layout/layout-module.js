/**
 * ============================================================
 * YouTube Personal
 * File    : layout-module.js
 * Version : 0.7.1 (Commit #9 Part2: Font Size Separation)
 *
 * YouTubeの画面レイアウト（サイドバー、ヘッダー、動画表示列数等）の
 * 制御を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { ModuleBase } from '../../core/module-base.js';
import { Logger } from '../../core/logger.js';
import * as FontSize from './features/font-size.js'; // Commit #9: FontSizeモジュールのインポート

/**
 * レイアウト制御モジュール（司令塔）
 */
export class LayoutModule extends ModuleBase {
    /** @type {Settings|null} */
    #settings;

    /** @type {CSSManager|null} */
    #cssManager;

    /** @type {string} */
    #cssStyleId;

    /** @type {string} */
    #videosPerRowStyleId;

    /** @type {string} */
    #compactLayoutStyleId;

    /** @type {string} */
    #compactVideoPageStyleId;

    /**
     * コンストラクタ
     */
    constructor() {
        super('layout');
        this.#settings = null;
        this.#cssManager = null;
        this.#cssStyleId = 'layout-base';
        this.#videosPerRowStyleId = 'layout-videos-per-row';
        this.#compactLayoutStyleId = 'layout-compact-layout';
        this.#compactVideoPageStyleId = 'layout-compact-video-page-layout';
        Logger.info('LayoutModule: Instance initialized.');
    }

    /**
     * モジュールの初期化処理
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
        if (!this.#cssManager || !this.#settings) {
            Logger.warn('LayoutModule: Cannot apply styles. Dependency component is missing.');
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
        Logger.info('LayoutModule: Layout Base CSS applied via add().');

        // 各レイアウト適用機能を順次呼び出し
        FontSize.apply(this.#settings, this.#cssManager); // Commit #9: 分離したモジュールを呼び出し
        this.applyVideosPerRow();
        this.applyCompactLayout();
        this.applyCompactVideoPageLayout();
    }

    /**
     * 適用したすべてのレイアウト変更を解除する内部メソッド
     */
    remove() {
        if (!this.#cssManager) return;

        // 各レイアウト解除機能を順次呼び出し
        FontSize.remove(this.#cssManager); // Commit #9: 分離したモジュールを呼び出し
        this.removeVideosPerRow();
        this.removeCompactLayout();
        this.removeCompactVideoPageLayout();

        this.#cssManager.remove(this.#cssStyleId);
        Logger.info('LayoutModule: Layout Base CSS removed via remove().');
    }

    // ============================================================
    // Videos Per Row 機能エリア (※次回以降分離予定)
    // ============================================================

    /**
     * Settingsから1行あたりの動画表示数設定を取得し、YouTubeにスタイルを適用する
     */
    applyVideosPerRow() {
        if (!this.#cssManager || !this.#settings) return;

        const count = this.#settings.get('layout.videosPerRow');
        if (count == null) return;

        const numericCount = Number(count);
        if (!Number.isInteger(numericCount) || numericCount <= 0) return;

        this.removeVideosPerRow();

        const cssText = this.#generateVideosPerRowCss(numericCount);
        this.#cssManager.add(this.#videosPerRowStyleId, cssText);
    }

    /**
     * 適用されている動画表示列数設定用スタイルを解除する
     */
    removeVideosPerRow() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#videosPerRowStyleId);
        }
    }

    /**
     * 指定された列数からCSS文字列を動的に生成する内部ユーティリティ
     */
    #generateVideosPerRowCss(count) {
        return `
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: ${count} !important;
            }
        `;
    }

    // ============================================================
    // Compact Layout 機能エリア (一覧ページ用 ※次回以降分離予定)
    // ============================================================

    /**
     * Settingsからコンパクトレイアウト設定を取得し、YouTubeにスタイルを適用する
     */
    applyCompactLayout() {
        if (!this.#cssManager || !this.#settings) return;

        const isCompact = this.#settings.get('layout.compactLayout');
        if (isCompact !== true) {
            this.removeCompactLayout();
            return;
        }

        this.removeCompactLayout();

        const cssText = this.#generateCompactLayoutCss();
        this.#cssManager.add(this.#compactLayoutStyleId, cssText);
    }

    /**
     * 適用されているコンパクトレイアウト設定用スタイルを解除する
     */
    removeCompactLayout() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#compactLayoutStyleId);
        }
    }

    /**
     * コンパクトレイアウト用CSS文字列を生成する内部ユーティリティ
     */
    #generateCompactLayoutCss() {
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

    // ============================================================
    // Compact Video Page Layout 機能エリア (視聴ページ用 ※次回以降分離予定)
    // ============================================================

    /**
     * Settingsから視聴ページ向けコンパクトレイアウト設定を取得し、YouTubeにスタイルを適用する
     */
    applyCompactVideoPageLayout() {
        if (!this.#cssManager || !this.#settings) return;

        const isCompactWatch = this.#settings.get('layout.compactVideoPageLayout');
        if (isCompactWatch !== true) {
            this.removeCompactVideoPageLayout();
            return;
        }

        this.removeCompactVideoPageLayout();

        const cssText = this.#generateCompactVideoPageLayoutCss();
        this.#cssManager.add(this.#compactVideoPageStyleId, cssText);
    }

    /**
     * 適用されている視聴ページ向けコンパクトレイアウト設定用スタイルを解除する
     */
    removeCompactVideoPageLayout() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#compactVideoPageStyleId);
        }
    }

    /**
     * 視聴ページコンパクトレイアウト用CSS文字列を生成する内部ユーティリティ
     */
    #generateCompactVideoPageLayoutCss() {
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

    // ============================================================
    // Router連携用のページ遷移ハンドラ
    // ============================================================

    onHomePage(routeData) {
        Logger.info('LayoutModule: Handled HomePage navigation.', routeData);
        this.apply();
    }

    onWatchPage(routeData) {
        Logger.info('LayoutModule: Handled WatchPage navigation.', routeData);
        this.apply();
    }

    onShortsPage(routeData) {
        Logger.info('LayoutModule: Handled ShortsPage navigation.', routeData);
        this.apply();
    }
}

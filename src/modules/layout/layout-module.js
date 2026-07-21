/**
 * ============================================================
 * YouTube Personal
 * File    : layout-module.js
 * Version : 0.8.0 (Commit #10: FEATURES Array Management)
 *
 * YouTubeの画面レイアウト（サイドバー、ヘッダー、動画表示列数等）の
 * 制御を担当する機能モジュール。
 * ============================================================
 */
'use strict';

import { ModuleBase } from '../../core/module-base.js';
import { Logger } from '../../core/logger.js';
import * as FontSize from './features/font-size.js';
import * as VideosPerRow from './features/videos-per-row.js';
import * as CompactLayout from './features/compact-layout.js';
import * as CompactVideoLayout from './features/compact-video-layout.js';

/**
 * 登録されているすべてのレイアウト機能モジュールの一覧
 * 新しいレイアウト機能を追加する場合は、この配列にモジュールを追加するだけで完了します。
 */
const FEATURES = [
    FontSize,
    VideosPerRow,
    CompactLayout,
    CompactVideoLayout,
];

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

    /**
     * コンストラクタ
     */
    constructor() {
        super('layout');
        this.#settings = null;
        this.#cssManager = null;
        this.#cssStyleId = 'layout-base';
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

        // 疎通確認用ベースCSSのインジェクト（※将来的に共通CSSへ統合または削除予定）
        const testCss = `
            body {
                /* LayoutModule: CSSManager Connection Test Pass */
                --yt-personal-layout-active: 1;
            }
        `;

        this.#cssManager.add(this.#cssStyleId, testCss);
        Logger.info('LayoutModule: Layout Base CSS applied via add().');

        // 登録されている全Featureの適用処理を順番に実行
        for (const feature of FEATURES) {
            feature.apply(this.#settings, this.#cssManager);
        }
    }

    /**
     * 適用したすべてのレイアウト変更を解除する内部メソッド
     */
    remove() {
        if (!this.#cssManager) return;

        // 登録されている全Featureの解除処理を順番に実行
        for (const feature of FEATURES) {
            feature.remove(this.#cssManager);
        }

        this.#cssManager.remove(this.#cssStyleId);
        Logger.info('LayoutModule: Layout Base CSS removed via remove().');
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

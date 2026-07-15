/**
 * ============================================================
 * YouTube Personal
 * File    : layout-module.js
 * Version : 0.2.3
 *
 * YouTubeの画面レイアウト（サイドバー、ヘッダー、シアターモード等）の
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
     * App (ModuleManager) から一元管理された共有依存コンテキストを受け取る。
     * 
     * @param {Object} context - 初期化コンテキスト
     * @param {Settings} context.settings - 設定マネージャー的インスタンス
     * @param {CSSManager} context.cssManager - CSSマネージャーのインスタンス
     */
    init({ settings, cssManager } = {}) {
        this.#settings = settings;
        this.#cssManager = cssManager;
        
        Logger.info('LayoutModule: init() accepted dependency injection successfully.');
        
        // インフラ配線の疎通テストを実行
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
     * レイアウト変更の実機能を適用する内部メソッド
     */
    apply() {
        if (!this.#cssManager) {
            Logger.warn('LayoutModule: Cannot apply styles. CSSManager is missing.');
            return;
        }

        // デバッグおよび可読性に優れたテスト用カスタムプロパティCSSのインジェクト
        const testCss = `
            body {
                /* LayoutModule: CSSManager Connection Test Pass */
                --yt-personal-layout-active: 1;
            }
        `;

        // 現物のAPI名「add」に合わせて呼び出し
        this.#cssManager.add(this.#cssStyleId, testCss);
        Logger.info('LayoutModule: Layout CSS applied via add().');
    }

    /**
     * 適用したレイアウト変更を完全に解除・復元する内部メソッド
     */
    remove() {
        if (this.#cssManager) {
            // 現物のAPI名「remove」に合わせて呼び出し
            this.#cssManager.remove(this.#cssStyleId);
            Logger.info('LayoutModule: Layout CSS removed via remove().');
        }
    }

    // ============================================================
    // Router連携用のページ遷移ハンドラ（スタブ）
    // ============================================================

    onHomePage(routeData) {
        Logger.info('LayoutModule: Handled HomePage navigation.', routeData);
    }

    onWatchPage(routeData) {
        Logger.info('LayoutModule: Handled WatchPage navigation.', routeData);
    }

    onShortsPage(routeData) {
        Logger.info('LayoutModule: Handled ShortsPage navigation.', routeData);
    }
}

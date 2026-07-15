/**
 * ============================================================
 * YouTube Personal
 * File    : layout-module.js
 * Version : 0.3.0
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

    /** @type {string} */
    #fontSizeStyleId;

    /**
     * コンストラクタ
     */
    constructor() {
        super('layout');
        this.#settings = null;
        this.#cssManager = null;
        this.#cssStyleId = 'layout-base';
        this.#fontSizeStyleId = 'layout-font-size'; // Font Size専用のCSS ID
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
        
        // 主機能および各レイアウト適用処理を一括実行
        this.apply();
    }

    /**
     * モジュールの破棄処理
     */
    destroy() {
        Logger.info('LayoutModule: destroy() triggered clean up.');
        // 解除処理のハブである remove() のみを呼び出すシンプルな構造を維持
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
    }

    /**
     * 適用したすべてのレイアウト変更を解除・復元する内部メソッド（各解除機能のハブ）
     */
    remove() {
        if (!this.#cssManager) return;

        // 各レイアウト解除機能を内部から安全に順次呼び出し（applyと対称性を維持）
        this.removeFontSize();

        this.#cssManager.remove(this.#cssStyleId);
        Logger.info('LayoutModule: Layout CSS removed via remove().');
    }

    // ============================================================
    // Commit #5 Part1: Font Size 機能実装エリア
    // ============================================================

    /**
     * Settingsからフォントサイズ設定を取得し、YouTubeにスタイルを適用する
     */
    applyFontSize() {
        if (!this.#cssManager || !this.#settings) {
            Logger.warn('LayoutModule: Cannot apply font size. Dependency component is missing.');
            return;
        }

        // Settingsから layout.fontSize を取得（未設定 null / undefined の場合は処理をスキップ）
        const fontSize = this.#settings.get('layout.fontSize');
        if (fontSize == null) {
            Logger.info('LayoutModule: Font size setting is empty. Skipped application.');
            return;
        }

        // 安全な適用のための「remove() → add()」シーケンスの実行
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
     * @param {string} size - 設定されたフォントサイズ値 (例: '16px', '120%' 等、単位を含む文字列に統一)
     * @returns {string} インジェクト用のCSS文字列
     */
    #generateFontSizeCss(size) {
        // YouTube全体の文字サイズを包括的に制御するためのスタイル定義（実機検証時の要確認対象）
        return `
            html, body, ytd-app {
                font-size: ${size} !important;
            }
        `;
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

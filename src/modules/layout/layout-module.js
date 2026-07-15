/**
 * ============================================================
 * YouTube Personal
 * File    : layout-module.js
 * Version : 0.6.0
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
        this.#fontSizeStyleId = 'layout-font-size';
        this.#videosPerRowStyleId = 'layout-videos-per-row';
        this.#compactLayoutStyleId = 'layout-compact-layout'; // Commit #7: Compact Layout (一覧用)
        this.#compactVideoPageStyleId = 'layout-compact-video-page-layout'; // Commit #8: Compact Video Page Layout (視聴ページ用)
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
        this.applyCompactLayout();
        this.applyCompactVideoPageLayout(); // Commit #8: ハブへ追加
    }

    /**
     * 適用したすべてのレイアウト変更を解除・復元する内部メソッド（各解除機能のハブ）
     */
    remove() {
        if (!this.#cssManager) return;

        // 各レイアウト解除機能を内部から安全に順次呼び出し（applyと対称性を維持）
        this.removeFontSize();
        this.removeVideosPerRow();
        this.removeCompactLayout();
        this.removeCompactVideoPageLayout(); // Commit #8: ハブへ追加

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
    // Compact Layout 機能エリア (一覧ページ用)
    // ============================================================

    /**
     * Settingsからコンパクトレイアウト設定を取得し、YouTubeにスタイルを適用する
     */
    applyCompactLayout() {
        if (!this.#cssManager || !this.#settings) {
            Logger.warn('LayoutModule: Cannot apply compact layout. Dependency component is missing.');
            return;
        }

        const isCompact = this.#settings.get('layout.compactLayout');
        if (isCompact !== true) {
            this.removeCompactLayout();
            Logger.info('LayoutModule: Compact layout setting is inactive or disabled.');
            return;
        }

        this.removeCompactLayout();

        const cssText = this.#generateCompactLayoutCss();
        this.#cssManager.add(this.#compactLayoutStyleId, cssText);
        Logger.info('LayoutModule: Compact layout applied successfully.');
    }

    /**
     * 適用されているコンパクトレイアウト設定用スタイルを解除する
     */
    removeCompactLayout() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#compactLayoutStyleId);
            Logger.info('LayoutModule: Compact layout CSS removed.');
        }
    }

    /**
     * ytd-browse 配下に制限し、純正レイアウトシステムを崩さない安全な
     * コンパクトレイアウト用CSS文字列を生成する内部ユーティリティ
     * 
     * @returns {string} インジェクト用のCSS文字列
     */
    #generateCompactLayoutCss() {
        return `
            /* 1. グリッド全体の最上部パディングの微調整 */
            ytd-browse ytd-rich-grid-renderer {
                padding-top: 8px !important;
            }

            /* 2. 各動画カードコンテナの縦マージン縮小（左右マージンはレスポンシブ崩れ防止のため不干渉） */
            ytd-browse ytd-rich-item-renderer {
                margin-bottom: 12px !important;
            }

            /* 3. サムネイルとテキスト領域（詳細メタデータ）の間の余白を削減 */
            ytd-browse ytd-rich-grid-media #details {
                margin-top: 6px !important;
            }

            /* 4. 動画タイトル、チャンネル情報、再生回数行の間のマージンを削減 */
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
    // Compact Video Page Layout 機能エリア (視聴ページ用)
    // ============================================================

    /**
     * Settingsから視聴ページ向けコンパクトレイアウト設定を取得し、YouTubeにスタイルを適用する
     */
    applyCompactVideoPageLayout() {
        if (!this.#cssManager || !this.#settings) {
            Logger.warn('LayoutModule: Cannot apply compact video page layout. Dependency component is missing.');
            return;
        }

        const isCompactWatch = this.#settings.get('layout.compactVideoPageLayout');
        if (isCompactWatch !== true) {
            this.removeCompactVideoPageLayout();
            Logger.info('LayoutModule: Compact video page layout setting is inactive or disabled.');
            return;
        }

        this.removeCompactVideoPageLayout();

        const cssText = this.#generateCompactVideoPageLayoutCss();
        this.#cssManager.add(this.#compactVideoPageStyleId, cssText);
        Logger.info('LayoutModule: Compact video page layout applied successfully.');
    }

    /**
     * 適用されている視聴ページ向けコンパクトレイアウト設定用スタイルを解除する
     */
    removeCompactVideoPageLayout() {
        if (this.#cssManager) {
            this.#cssManager.remove(this.#compactVideoPageStyleId);
            Logger.info('LayoutModule: Compact video page layout CSS removed.');
        }
    }

    /**
     * ytd-watch-flexy 配下に厳格に制限し、プレイヤー自体のサイズ計算を崩さずに、
     * 周辺メタデータや右カラムおすすめ動画の余白を詰めるCSSを生成する内部ユーティリティ
     * 
     * @returns {string} インジェクト用のCSS文字列
     */
    #generateCompactVideoPageLayoutCss() {
        return `
            /* 1. プレイヤーと下部コンテンツの間の不要な余白を縮小 */
            ytd-watch-flexy {
                --ytd-watch-flexy-space-below-player: 12px !important; /* 標準約24pxから安全に半減 */
            }

            /* 2. タイトルおよびチャンネル情報領域（ytd-watch-metadata）の上下余白の圧縮 */
            ytd-watch-flexy ytd-watch-metadata {
                margin-top: 8px !important;
                margin-bottom: 8px !important;
            }

            /* 3. チャンネル名や登録ボタン・アクションボタンが並ぶメイン行の余白引き締め */
            ytd-watch-flexy #top-row.ytd-watch-metadata {
                margin-top: 4px !important;
                padding-bottom: 4px !important;
            }

            /* 4. 概要欄コンテナの上下マージン削減（展開/非展開どちらの状態でも追従） */
            ytd-watch-flexy #description.ytd-watch-metadata {
                margin-top: 8px !important;
                margin-bottom: 8px !important;
            }

            /* 5. 右側おすすめ動画（ytd-compact-video-renderer）の間隔を詰める（表示密度向上） */
            ytd-watch-flexy #secondary ytd-compact-video-renderer {
                margin-bottom: 8px !important;
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

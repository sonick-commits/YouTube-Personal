/**
 * ============================================================
 * YouTube Personal
 * File    : main.js
 * Version : 0.1.1
 *
 * Tampermonkey 環境における唯一のエントリーポイント。
 * ブラウザのDOM構築タイミングを管理し、グローバルエラーを捕捉しながら
 * アプリケーションのインスタンスを生成・起動する。
 * ============================================================
 */
'use strict';

import { App } from './core/app.js';
import { Logger } from './core/logger.js';
import { LayoutModule } from './modules/layout/layout-module.js';

// グローバルSymbolレジストリを使用した一意な初期化フラグの定義
const LAUNCH_FLAG = Symbol.for('__youtube_personal_initialized__');

(() => {
    // 1. 厳密な二重起動防止チェック
    if (window[LAUNCH_FLAG]) {
        return;
    }
    window[LAUNCH_FLAG] = true;

    /**
     * 将来的な外部イベント（設定変更、手動リロード、stop/start等）からの
     * 操作やデバッグ対応のため、GCに回収されないよう参照をIIFEスコープで保持する
     * @type {App|null}
     */
    let app = null;

    /**
     * アプリケーションのメイン起動ロジック
     */
    const bootstrap = async () => {
        Logger.info('Main: Bootstrapping application sequence...');
        
        try {
            // インスタンスをスコープ変数に保持
            app = new App();
            
            // LayoutModuleのインスタンスを生成（Tracer Bulletの配置）
            const layoutModule = new LayoutModule();
            
            // 配列形式でモジュールをアプリケーションのstartライフサイクルへ投入
            const success = await app.start([layoutModule]);
            
            if (success) {
                Logger.info('Main: Application successfully mounted to YouTube environment.');
            } else {
                Logger.error('Main: Application failed to start cleanly.');
            }
        } catch (fatalError) {
            Logger.error('Main: Unhandled catastrophic error during bootstrap:', fatalError);
        }
    };

    /**
     * グローバルエラーの捕捉（ウィンドウ全体の未キャッチ例外・Promise拒否をロギング）
     */
    const setupGlobalErrorHandler = () => {
        window.addEventListener('error', (event) => {
            Logger.error(`Main: [Global Runtime Error] ${event.message} at ${event.filename}:${event.lineno}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            Logger.error('Main: [Global Unhandled Promise Rejection]', event.reason);
        });
    };

    // --- 実行タイミング制御 ---
    setupGlobalErrorHandler();

    if (document.readyState === 'loading') {
        // DOMがまだ構築中の場合は、パース完了のタイミングを待って起動
        document.addEventListener('DOMContentLoaded', () => {
            bootstrap();
        }, { once: true });
    } else {
        // すでに DOMContentLoaded 以降（interactive / complete）の状態であれば即座に起動
        bootstrap();
    }
})();

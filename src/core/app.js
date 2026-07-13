/**
 * ============================================================
 * YouTube Personal
 * File    : app.js
 * Version : 0.1.3
 *
 * アプリケーション全体のライフサイクルを一元管理するエントリーポイント（司令塔）。
 * 各種マネージャーやルーターの生成、依存関係に基づいた適切な順序での初期化、
 * 終了処理、および二重起動の防止を担当する。
 * 
 * 責務
 * ・コアコンポーネント（Settings, CSSManager, ModuleManager, Router）の統合
 * ・厳密な順序による起動（start）と停止（stop）の制御
 * ・多重起動の防止およびエラー発生時の安全な終了処理
 * ============================================================
 */
'use strict';

import { Logger } from './logger.js';
import { Settings } from './settings.js';
import { ModuleManager } from './module-manager.js';
import { CSSManager } from './css-manager.js';
import { Router } from './router.js';

/**
 * アプリケーションメインクラス
 */
export class App {
    /** @type {boolean} */
    #isRunning;

    /** @type {Settings} */
    #settings;

    /** @type {ModuleManager} */
    #moduleManager;

    /** @type {CSSManager} */
    #cssManager;

    /** @type {Router} */
    #router;

    /**
     * コンストラクタ
     */
    constructor() {
        this.#isRunning = false;
        this.#settings = new Settings();
        this.#moduleManager = new ModuleManager();
        this.#cssManager = new CSSManager();
        this.#router = new Router();
        Logger.info('App: Instance created.');
    }

    /**
     * アプリケーションを厳密な順序で安全に起動する
     * 
     * @param {Array<Object>} modulesToRegister - 登録対象の初期モジュール配列（将来拡張用）
     * @returns {Promise<boolean>} 起動が成功した場合はtrue、失敗した場合はfalse
     */
    async start(modulesToRegister = []) {
        // 1. 二重起動防止のチェック
        if (this.#isRunning) {
            Logger.warn('App: Application is already running. Double launch blocked.');
            return false;
        }

        Logger.info('App: Execution start procedure triggered.');

        try {
            // 2. 設定データの非同期読み込み
            await this.#settings.load();
            Logger.info('App: [Step 1/5] Settings loaded successfully.');

            // 3. CSSManagerの準備
            Logger.info('App: [Step 2/5] CSSManager is ready.');

            // 4. ModuleManagerへ各モジュールの登録
            if (Array.isArray(modulesToRegister)) {
                for (const module of modulesToRegister) {
                    this.#moduleManager.register(module);
                }
            }
            Logger.info('App: [Step 3/5] Base modules registration phase completed.');

            // 5. RouterのURL遷移監視を開始
            this.#router.start();
            Logger.info('App: [Step 4/5] Router tracking activated.');

            // 6. ルーターの変更イベントの購読（メソッド参照を渡してクリーンアップ可能に）
            this.#router.onRouteChange(this.#handleRouteChange);

            // 7. 登録された全モジュールの初期化を実行
            await this.#moduleManager.initAll();
            Logger.info('App: [Step 5/5] All module lifecycles initialized.');

            this.#isRunning = true;
            Logger.info('App: Application started perfectly.');
            return true;

        } catch (error) {
            Logger.error('App: Critical error occurred during startup sequence. Rolling back...', error);
            await this.stop();
            return false;
        }
    }

    /**
     * アプリケーションを安全かつ厳密な順序で停止し、リソースを完全に解放する
     * 
     * @returns {Promise<void>}
     */
    async stop() {
        if (!this.#isRunning) {
            Logger.info('App: Application is not active. Shutdown request ignored.');
            return;
        }

        Logger.info('App: Execution stop procedure triggered.');

        try {
            // 1. Routerの停止とイベント購読の完全解除
            if (this.#router) {
                this.#router.offRouteChange(this.#handleRouteChange);
                this.#router.stop();
                Logger.info('App: [Shutdown 1/3] Router tracking stopped and listeners cleared.');
            }

            // 2. 全モジュールの破棄
            if (this.#moduleManager) {
                await this.#moduleManager.destroyAll();
                Logger.info('App: [Shutdown 2/3] All registered modules destroyed.');
            }

            // 3. 注入された全スタイルのクリア
            if (this.#cssManager) {
                this.#cssManager.clear();
                Logger.info('App: [Shutdown 3/3] Injected CSS structures cleared.');
            }

        } catch (shutdownError) {
            Logger.error('App: Emergency! Error experienced during application teardown:', shutdownError);
        } finally {
            this.#isRunning = false;
            Logger.info('App: Application terminated cleanly.');
        }
    }

    /**
     * ルート変更イベントをハンドリングし、ModuleManagerからモジュールを取得して適切に振り分ける
     * 
     * @param {string} routeType - 判定されたルート識別子
     * @param {URL} urlObj - 遷移先のURLオブジェクト
     */
    #handleRouteChange = (routeType, urlObj) => {
        Logger.info(`App: Bridge received route change event -> ${routeType}`);
        
        // 1. 対象のレイアウト制御モジュールを取得
        const layoutModule = this.#moduleManager.get('layout');
        if (!layoutModule) {
            Logger.warn('App: LayoutModule not found in ModuleManager.');
            return;
        }

        // 2. Commit #3 Part 6: routeType に応じた適切なハンドラへのルーティング振り分け
        switch (routeType) {
            case 'home':
                layoutModule.onHomePage({
                    routeType,
                    url: urlObj
                });
                break;

            case 'watch':
                layoutModule.onWatchPage({
                    routeType,
                    url: urlObj
                });
                break;

            case 'shorts':
                layoutModule.onShortsPage({
                    routeType,
                    url: urlObj
                });
                break;

            default:
                // ハンドラが定義されていないルートに遷移した場合も、エラーにせず安全にロギング
                Logger.info(`App: No module event handler registered for route "${routeType}".`);
                break;
        }
    };

    /**
     * 各マネージャーおよび設定クラスのインスタンスを取得するゲッター群
     */
    get settings() { return this.#settings; }
    get moduleManager() { return this.#moduleManager; }
    get cssManager() { return this.#cssManager; }
    get router() { return this.#router; }
}

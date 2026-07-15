/**
 * ============================================================
 * YouTube Personal
 * File    : module-manager.js
 * Version : 0.2.0
 *
 * 各種機能モジュールのライフサイクル（登録、初期化、有効化、無効化、破棄）を
 * 一元管理するマネージャークラス。
 * 
 * 責務
 * ・モジュールの登録と取得
 * ・モジュールの初期化 (init) / 破棄 (destroy) の一括制御（非同期対応）
 * ・モジュールの有効・無効状態の管理
 * ============================================================
 */
'use strict';

import { Logger } from './logger.js';

/**
 * @typedef {Object} Module
 * @property {string} name - モジュールの一意識別名
 * @property {function(Object=): (void|Promise<void>)} init - モジュール初期化関数（共通コンテキストを受け取る）
 * @property {function(): (void|Promise<void>)} destroy - モジュール破棄関数
 */

/**
 * モジュール管理クラス
 */
export class ModuleManager {
    /** @type {Map<string, Module>} */
    #modules;

    /** @type {Map<string, boolean>} */
    #activeStates;

    /**
     * コンストラクタ
     */
    constructor() {
        this.#modules = new Map();
        this.#activeStates = new Map();
        Logger.info('ModuleManager initialized');
    }

    /**
     * モジュールをマネージャーに登録する
     * 
     * @param {Module} module - 登録するモジュールオブジェクト
     * @returns {boolean} 登録が成功した場合はtrue、失敗した場合はfalse
     */
    register(module) {
        if (!module || typeof module.name !== 'string' || !module.name) {
            Logger.error('ModuleManager: Invalid module structural definition.');
            return false;
        }

        if (this.#modules.has(module.name)) {
            Logger.warn(`ModuleManager: Module "${module.name}" is already registered.`);
            return false;
        }

        if (typeof module.init !== 'function' || typeof module.destroy !== 'function') {
            Logger.error(`ModuleManager: Module "${module.name}" must implement init() and destroy().`);
            return false;
        }

        this.#modules.set(module.name, module);
        this.#activeStates.set(module.name, false);
        Logger.info(`ModuleManager: Module "${module.name}" registered.`);
        return true;
    }

    /**
     * 登録されているすべてのモジュールを非同期で順次初期化する
     * 上流（App）から渡された共有インフラ（context）を、各モジュールへリレーする。
     * 
     * @param {Object} [context={}] - 依存関係をカプセル化した共通コンテキスト
     * @returns {Promise<void>}
     */
    async initAll(context = {}) {
        Logger.info('ModuleManager: Start initializing all modules with context.');
        
        for (const [name, module] of this.#modules.entries()) {
            if (this.#activeStates.get(name)) continue;

            try {
                // 各モジュールの init() に context を渡して依存性を注入
                await module.init(context);
                this.#activeStates.set(name, true);
                Logger.info(`ModuleManager: Module "${name}" initialized successfully.`);
            } catch (error) {
                Logger.error(`ModuleManager: Failed to initialize module "${name}":`, error);
            }
        }
    }

    /**
     * 登録されているすべてのモジュールを非同期で順次破棄（無効化）する
     * 
     * @returns {Promise<void>}
     */
    async destroyAll() {
        Logger.info('ModuleManager: Start destroying all modules.');

        for (const [name, module] of this.#modules.entries()) {
            if (!this.#activeStates.get(name)) continue;

            try {
                // 将来的な各モジュールの非同期破棄（イベント解除等）を確実に待機
                await module.destroy();
                this.#activeStates.set(name, false);
                Logger.info(`ModuleManager: Module "${name}" destroyed successfully.`);
            } catch (error) {
                Logger.error(`ModuleManager: Failed to destroy module "${name}":`, error);
            }
        }
    }

    /**
     * 指定された名前のモジュールを取得する
     * 
     * @param {string} name - モジュール名
     * @returns {Module|undefined} モジュールオブジェクト、存在しない場合はundefined
     */
    get(name) {
        return this.#modules.get(name);
    }

    /**
     * 指定されたモジュールが現在有効（稼働中）かどうかを返す
     * 
     * @param {string} name - モジュール名
     * @returns {boolean} 有効であればtrue
     */
    isActive(name) {
        return this.#activeStates.get(name) ?? false;
    }

    /**
     * マネージャーに登録されている全モジュール名を配列で取得する
     * 
     * @returns {string[]} モジュール名の配列
     */
    getModuleNames() {
        return Array.from(this.#modules.keys());
    }
}

/**
 * ============================================================
 * YouTube Personal
 * File    : module-base.js
 * Version : 0.1.0
 *
 * すべての機能モジュール（Layout, Player, Live等）が継承すべき共通の基底（抽象）クラス。
 * ModuleManagerが要求するライフサイクル（init / destroy）と識別名の規格を強制する。
 * 
 * 責務
 * ・モジュール識別名（name）の一元管理とカプセル化
 * ・ライフサイクルメソッド（init / destroy）のインターフェース定義（抽象メソッド化）
 * ============================================================
 */
'use strict';

import { Logger } from './logger.js';

/**
 * モジュール共通基底クラス（疑似抽象クラス）
 */
export class ModuleBase {
    /** @type {string} */
    #name;

    /**
     * コンストラクタ
     * @param {string} name - モジュールの一意識別名
     */
    constructor(name) {
        // 疑似抽象クラスの強制（本クラスを直接インスタンス化しようとした場合はエラー）
        if (new.target === ModuleBase) {
            throw new TypeError('ModuleBase: Cannot construct instances directly. Must be inherited.');
        }

        // 名前のバリデーション
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('ModuleBase: A valid string name must be provided to the constructor.');
        }

        this.#name = name;
        Logger.info(`ModuleBase: [${this.#name}] Instance created via sub-class.`);
    }

    /**
     * モジュールの識別名を取得する（ModuleManagerがプロパティとしてアクセスするのを保証）
     * @returns {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * モジュールの初期化処理（抽象メソッド）
     * 継承先の子クラスで必ずオーバーライド（上書き実装）してください。
     * 
     * @returns {void|Promise<void>}
     */
    init() {
        const errorMsg = `ModuleBase: [${this.#name}] Method "init()" must be implemented by subclass.`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    /**
     * モジュールの破棄・無効化処理（抽象メソッド）
     * 継承先の子クラスで必ずオーバーライド（上書き実装）してください。
     * 
     * @returns {void|Promise<void>}
     */
    destroy() {
        const errorMsg = `ModuleBase: [${this.#name}] Method "destroy()" must be implemented by subclass.`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
    }
}

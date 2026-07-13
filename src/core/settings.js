/**
 * ============================================================
 * YouTube Personal
 * File    : settings.js
 * Version : 0.1.0
 *
 * アプリケーション全体で使用する設定管理クラス。
 * 
 * 責 emergence (責務)
 * ・デフォルト設定管理
 * ・設定の保存 / 読み込み（Storage連携）
 * ・設定バージョン管理とマイグレーション
 * ============================================================
 */
'use strict';

import { SETTINGS_VERSION } from './constants.js';
import { Logger } from './logger.js';
import { Storage } from './storage.js';
import * as Utils from './settings-utils.js';

/**
 * デフォルト設定の定義
 * アプリケーションの基本構造を定義する（外部からの汚染を防ぐためフリーズ）。
 */
export const DEFAULT_SETTINGS = Object.freeze({
    version: SETTINGS_VERSION,
    layout: {
        fontSize: 100,
        videosPerRow: 4,
        compactLayout: false,
        compactVideoPageLayout: false,
        displayFullTitles: false,
        redirectShorts: true
    },
    player: {
        playbackSpeed: 1.0,
        volume: 100,
        loop: false,
        darkVideo: false
    },
    live: {
        showOriginalTime: true,
        skipSeconds: 10
    },
    tabs: {
        fixedChatHeight: 480,
        defaultTab: 'comments',
        lazyLoadComments: true
    }
});

/**
 * 設定管理クラス
 */
export class Settings {
    /** @type {Storage} */
    #storage;

    /** @type {Object} */
    #settings;

    /**
     * コンストラクタ
     */
    constructor() {
        this.#storage = new Storage();
        // 初期状態はデフォルト設定をクローン
        this.#settings = Utils.clone(DEFAULT_SETTINGS);
        Logger.info('Settings initialized');
    }

    /**
     * Storageから設定を読み込む。
     * データが存在しない場合はデフォルト設定を保存して初期化する（初回起動対策）。
     * 
     * @returns {Promise<Object>} 読み込まれた設定オブジェクト
     */
    async load() {
        try {
            // Storageの現在の実装に基づき、短いキー"settings"を渡す
            const stored = await this.#storage.get('settings');

            if (!stored) {
                Logger.info('No settings found. Initializing with defaults.');
                this.#settings = Utils.clone(DEFAULT_SETTINGS);
                await this.save();
                return this.#settings;
            }

            // マイグレーションの実行
            this.#settings = this.migrate(stored);
            return this.#settings;
        } catch (error) {
            Logger.error('Failed to load settings:', error);
            // 失敗時は安全のためにデフォルト設定をフォールバックとして保持
            this.#settings = Utils.clone(DEFAULT_SETTINGS);
            return this.#settings;
        }
    }

    /**
     * 現在の設定をStorageへ保存する。
     */
    async save() {
        try {
            await this.#storage.set('settings', this.#settings);
            Logger.info('Settings saved successfully');
        } catch (error) {
            Logger.error('Failed to save settings:', error);
            throw error;
        }
    }

    /**
     * 過去のバージョンの設定データを最新の構造へマイグレーション（移行）する。
     * 新規項目の補完、廃止項目の無視、バージョン更新を行う。
     * 
     * @param {Object} loadedSettings - ストレージから読み込まれた設定データ
     * @returns {Object} 最新構造に適合した設定データ
     */
    migrate(loadedSettings) {
        if (!loadedSettings) return Utils.clone(DEFAULT_SETTINGS);

        // デフォルトの構造をベースに、読み込んだデータをディープマージして新規項目を補完
        let migrated = Utils.merge(DEFAULT_SETTINGS, loadedSettings);

        const currentVersion = loadedSettings.version ?? 0;

        if (currentVersion < SETTINGS_VERSION) {
            Logger.info(`Migrating settings from v${currentVersion} to v${SETTINGS_VERSION}`);
            
            // 将来的なバージョンごとの移行ロジック（v1->v2等）はここに追記する
            
            // 最終的に最新のバージョンに更新
            migrated.version = SETTINGS_VERSION;
        }

        return migrated;
    }

    /**
     * 指定されたパスの設定値を取得する（例: "layout.fontSize"）
     * 
     * @param {string} path - ドット区切りの設定パス
     * @returns {*} 設定値
     */
    get(path) {
        return Utils.getPath(this.#settings, path);
    }

    /**
     * 指定されたパスに設定値をセットし、自動的に保存する。
     * 
     * @param {string} path - ドット区切りの設定パス
     * @param {*} value - 設定する値
     * @returns {Promise<void>}
     */
    async set(path, value) {
        Utils.setPath(this.#settings, path, value);
        await this.save();
    }

    /**
     * 指定されたパスの設定値が存在するか確認する
     * 
     * @param {string} path - ドット区切りの設定パス
     * @returns {boolean} 存在すればtrue
     */
    has(path) {
        return this.get(path) !== undefined;
    }

    /**
     * 設定全体を取得する（読み取り専用としてのクローンを返す）
     * 
     * @returns {Object} 設定全体のクローン
     */
    getAll() {
        return Utils.clone(this.#settings);
    }

    /**
     * 設定全体を新しいオブジェクトで安全に置き換える（ディープマージ）。
     * カテゴリが丸ごと消失するのを防ぎ、構造の整合性を維持する。
     * 
     * @param {Object} newSettings - 新しい設定オブジェクト
     * @returns {Promise<void>}
     */
    async replace(newSettings) {
        if (!newSettings || typeof newSettings !== 'object') return;
        this.#settings = Utils.merge(DEFAULT_SETTINGS, newSettings);
        await this.save();
    }

    /**
     * 設定をすべてデフォルト値にリセットする。
     * 
     * @returns {Promise<void>}
     */
    async reset() {
        this.#settings = Utils.clone(DEFAULT_SETTINGS);
        await this.save();
        Logger.info('Settings has been reset to defaults');
    }
}
